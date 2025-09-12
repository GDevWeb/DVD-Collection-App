import dotenv from "dotenv";
import express, { Request, Response } from "express";
import DVD, { IDVD } from "../models/dvd.model";
import axios = require("axios");

dotenv.config();

const router = express.Router();

const UPC_API_URL = process.env.UPC_API_URL;
const TMDB_API_URL = process.env.TMDB_API_URL;
const TMDB_API_KEY = process.env.TMDB_API_KEY;

// A utility function to clean up the product title
const cleanTitleForSearch = (title: string): string => {
  // 1. Convert to lowercase
  let cleanString = title.toLowerCase();

  // 2. Remove common DVD/Blu-ray keywords and other non-title info
  cleanString = cleanString.replace(
    /dvd|blu-ray|\bset\b|edition|(\d{4})|-disc|blister pack|no.\s\d+/gi,
    ""
  );

  // 3. Remove punctuation and extra spaces
  cleanString = cleanString.replace(/[",:]/g, ""); // Remove specific characters like quotes and colons

  // 4. Trim and replace multiple spaces with a single space
  cleanString = cleanString.trim().replace(/\s+/g, " ");

  return cleanString;
};
// POST /api/dvds/manual: The frontend sends a request with all the manually entered data. The backend saves this data directly to the database. This maps to the fallback for User Story 3.
router.post("/", async (req: Request, res: Response) => {
  try {
    const newDVDData: IDVD = req.body;
    const newDVD = new DVD(newDVDData);
    const savedDVD = await newDVD.save();
    res.status(201).json(savedDVD);
  } catch (error: any) {
    if (error.code === 11000) {
      res
        .status(409)
        .json({ message: "A DVD with this EAN code already exists" });
    } else {
      res
        .status(500)
        .json({ message: "Internal Server Error", error: error.message });
    }
  }
});

router.get("/", async (req: Request, res: Response) => {
  try {
    const dvds = await DVD.find({}).sort({ title: 1 });
    res.status(200).json(dvds);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const dvd = await DVD.findById(id);

    if (!dvd) {
      return res.status(404).json({ message: "DVD not found" });
    }

    res.status(200).json(dvd);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
});

router.patch("/:id", async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const dvd = await DVD.findById(id);

    if (!dvd) {
      return res.status(404).json({ message: "DVD not found" });
    }
    const updatedDVD = req.body;

    await DVD.findByIdAndUpdate(id, updatedDVD, { new: true });
    res.status(200).json(updatedDVD);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
});

router.patch("/:id", async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const dvd = await DVD.findById(id);

    if (!dvd) {
      return res.status(404).json({ message: "DVD not found" });
    }
    const updatedDVD = req.body;

    await DVD.replaceOne({ _id: id }, updatedDVD);
    res.status(200).json({ message: "DVD deleted successfully" });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const dvd = await DVD.findById(id);

    if (!dvd) {
      return res.status(404).json({ message: "DVD not found" });
    }
    await DVD.findByIdAndDelete(id);
    res.status(200).json({ message: "DVD deleted successfully" });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
});

// ***Scan***
//     POST /api/dvds/scan: The backend's only job is to receive the EAN code, perform the initial API lookups (UPCitemdb and TMDb), and return a list of potential matches to the frontend. It should not save anything to the database at this stage. This directly maps to User Story 1.
// ***Scan and Search***
/**
 * @route POST /api/dvds/scan
 * @description Scans a DVD by EAN code, retrieves potential matches from external APIs, and returns a list of results.
 * @param {Request} req - The request object containing the EAN code in the body.
 * @param {Response} res - The response object.
 * @returns {Promise<void>}
 */

router.post("/scan", async (req: Request, res: Response) => {
  try {
    const { eanCode } = req.body;

    if (!eanCode) {
      return res.status(400).json({ message: "EAN code is required!" });
    }
    // Checking if already exists in DB
    const existingDVD = await DVD.findOne({ eanCode });
    if (existingDVD) {
      res
        .status(409)
        .json({ message: "A DVD with this EAN code already exists." });
    }

    // Fetch 1st api
    const upcResponse: any = await axios.get(`${UPC_API_URL}?upc=${eanCode}`);
    const upcData: any = upcResponse.data;

    // Check the returned data
    if (!upcData.items || upcData.items.length === 0) {
      return res
        .status(404)
        .json({ message: "Product not found on UPCitemdb." });
    }

    const products = upcData;

    return res.status(200).json({ products });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
      error: (error as Error).message,
    });
  }
});
export default router;
