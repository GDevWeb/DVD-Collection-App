import axios from "axios";
import dotenv from "dotenv";
import express, { Request, Response } from "express";
import DVD, { IDVD, InputDVD } from "../models/dvd.model";

dotenv.config();

const router = express.Router();

const UPC_API_URL = process.env.UPC_API_URL;
const TMDB_API_URL = process.env.TMDB_API_URL;
const TMDB_API_KEY = process.env.TMDB_API_KEY;

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
/**
 * @route POST /api/dvds/scan
 * @description Scans a DVD by EAN code, retrieves product information from external APIs, and saves it to the database.
 * @param {Request} req - The request object containing the EAN code in the body.
 * @param {Response} res - The response object.
 * @returns {Promise<void>}
 */

router.post("/scan", async (req: Request, res: Response) => {
  try {
    const { eanCode } = req.body;

    if (!eanCode) {
      return res.status(400).json({ message: "EAN code is required." });
    }

    const existingDVD = await DVD.findOne({ eanCode });
    if (existingDVD) {
      return res
        .status(409)
        .json({ message: "A DVD with this EAN code already exists." });
    }

    const upcResponse = await axios.get(`${UPC_API_URL}?upc=${eanCode}`);
    const upcData: any = upcResponse.data;
    console.log(upcData);

    if (!upcData.items || upcData.items.length === 0) {
      return res
        .status(404)
        .json({ message: "Product not found on UPCitemdb." });
    }

    const product = upcData.items[0];
    const productTitle = product.title || product.product_name || null;

    if (!productTitle) {
      return res
        .status(404)
        .json({ message: "Product title not found for this EAN code." });
    }

    // Build the data object with fallback values from UPCitemdb
    const newDVDData: InputDVD = {
      eanCode: eanCode,
      title: productTitle,
      imageUrl:
        product.images && product.images.length > 0
          ? product.images[0]
          : "https://placehold.co/300x400?text=Cover+Not+Found",
      releaseYear: product.asin
        ? parseInt(product.asin.substring(0, 4))
        : undefined,
      director: undefined,
      comments: "",
    };

    const newDVD = new DVD(newDVDData);
    const savedDVD = await newDVD.save();

    res.status(201).json(savedDVD);
  } catch (error: any) {
    console.error("API Error:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

export default router;
