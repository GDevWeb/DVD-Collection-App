import axios from "axios";
import dotenv from "dotenv";
import express, { Request, Response } from "express";
import DVD, { IDVD } from "../models/dvd.model";

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
    /dvd|blu-ray|\bset\b|edition|(\d{4})|-disc|blister pack|by|movie|no\.\s\d+/gi,
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
      return res.status(400).json({ message: "EAN code is required." });
    }

    const upcResponse: any = await axios.get(`${UPC_API_URL}?upc=${eanCode}`);
    const upcData: any = upcResponse.data;

    if (!upcData.items || upcData.items.length === 0) {
      return res
        .status(404)
        .json({ message: "Product not found on UPCitemdb." });
    }

    const product = upcData.items[0];
    const productTitle = product.title || product.product_name || null;

    if (!productTitle) {
      return res.status(404).json({ message: "Product title not found." });
    }

    // Use the data cleaning function
    const cleanTitle = cleanTitleForSearch(productTitle);

    if (cleanTitle.length < 3) {
      return res
        .status(404)
        .json({ message: "Cleaned title is too short to search on TMDb." });
    }

    const tmdbResponse: any = await axios.get(
      `${TMDB_API_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(
        cleanTitle
      )}`
    );
    const tmdbResults = tmdbResponse.data.results;

    if (tmdbResults.length === 0) {
      return res.status(404).json({
        message: `Movie not found on TMDb for title: "${cleanTitle}"`,
      });
    }

    // Map the results to a cleaner format to send to the frontend
    const results = tmdbResults.slice(0, 5).map((movie: any) => ({
      tmdbId: movie.id,
      title: movie.title,
      releaseYear: movie.release_date
        ? movie.release_date.substring(0, 4)
        : null,
      imageUrl: movie.poster_path
        ? `https://image.tmdb.org/t/p/w200${movie.poster_path}`
        : null,
    }));

    // Send the list of potential matches back to the frontend
    res.status(200).json(results);
  } catch (error: any) {
    if (AxiosError(error)) {
      console.error("Axios API Error:", error.response?.data || error.message);
      res
        .status(error.response?.status || 500)
        .json({ message: "External API Error", details: error.message });
    } else {
      console.error("Internal Server Error:", error.message);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
});
export default router;
