import axios, { isAxiosError } from "axios";
import dotenv from "dotenv";
import express, { Request, Response } from "express";
import DVD, { DVDInputData, IDVD } from "../models/dvd.model";
import { cleanTitleForSearch } from "../utils/cleanTitle.utils";

dotenv.config();

const router = express.Router();

const UPC_API_URL = process.env.UPC_API_URL;
const TMDB_API_URL = process.env.TMDB_API_URL;
const TMDB_API_KEY = process.env.TMDB_API_KEY;

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

// ***1.Scan and Search***
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
    if (isAxiosError(error)) {
      console.error("Axios API Error:", error.response?.data || error.message);
      res
        .status(error.response?.status || 500)
        .json({ message: "External API Error", details: error.message });
    } else if (error instanceof Error) {
      console.error("Internal Server Error:", error.message);
      res.status(500).json({ message: "Internal Server Error" });
    } else {
      console.error("Unknown error:", error);
      res.status(500).json({ message: "Unknown Internal Server Error" });
    }
  }
});

// 2.***Add DVD (from TMDb)***
/**
 * @route POST /api/dvds/add
 * @description Adds a DVD to the collection using data fetched from TMDb based on a provided TMDb ID and EAN code.
 * @param {Request} req - The request object containing `tmdbId` and `eanCode` in the body.
 * @param {Response} res - The response object.
 * @returns {Promise<void>}
 */

router.post("/add", async (req: Request, res: Response) => {
  try {
    const { tmdbId, eanCode } = req.body;

    if (!tmdbId || !eanCode) {
      return res
        .status(400)
        .json({ message: "TMDb ID and EAN code are required." });
    }

    // Check if a DVD with EAN is already in DB
    const existing = await DVD.findOne({ eanCode }); //❗refactor in utils
    if (existing) {
      return res
        .status(409)
        .json({ message: "A DVD with this EAN code already exists." });
    }

    // Fetch the detailed movie data from TMdb
    const movieResponse = await axios.get(
      `${TMDB_API_URL}/movie/${tmdbId}?api_key=${TMDB_API_KEY}`
    );
    const movieData: any = movieResponse.data;
    console.log("movieData:", movieData);

    // Fetch director's name
    const creditResponse = await axios.get(
      `${TMDB_API_URL}/movie/${tmdbId}/credits?api_key=${TMDB_API_KEY}`
    );
    const creditData: any = creditResponse.data;
    console.log(creditData);
    const director = creditData.crew.find(
      (member: any) => member.job === "Director"
    );
    console.log("Director:", director.name);
    const directorName = director.name;

    const newDVDData: DVDInputData = {
      eanCode: String(eanCode),
      title: movieData.title,
      comments: "",
      imageUrl: movieData.poster_path
        ? `https://image.tmdb.org/t/p/w500${movieData.poster_path}`
        : "https://placehold.co/300x400?text=Cover+Not+Found",
      releaseYear: movieData.release_date
        ? parseInt(movieData.release_date.substring(0, 4))
        : undefined,
      director: directorName,
      brand: movieData.production_companies
        ? movieData.production_companies[0]?.name
        : "N/A",
    };

    const newDVD = new DVD(newDVDData);
    const savedDVD = await newDVD.save();

    res.status(200).json(savedDVD);
  } catch (error: any) {
    if (isAxiosError(error)) {
      console.error("Axios API Error:", error.response?.data || error.message);
      res
        .status(error.response?.status || 500)
        .json({ message: "External API Error", details: error.message });
    } else if (error instanceof Error) {
      console.error("Internal Server Error:", error.message);
      res.status(500).json({ message: "Internal Server Error" });
    } else {
      console.error("Unknown error:", error);
      res.status(500).json({ message: "Unknown Internal Server Error" });
    }
  }
});

// 3.***Add DVD (Manual)***
/**
 * @route POST /api/dvds/manual
 * @description Adds a DVD to the collection with manually entered data.
 * @param {Request} req - The request object containing DVD data in the body.
 * @param {Response} res - The response object.
 * @returns {Promise<void>}
 */

router.post("/manual", async (req: Request, res: Response) => {
  try {
    const { eanCode, title, comments, imageUrl, releaseYear, director, brand } =
      req.body;

    const newDVDData: DVDInputData = {
      eanCode: eanCode,
      title: title,
      comments: comments || "",
      imageUrl: imageUrl || "https://placehold.co/300x400?text=Manual+Entry",
      releaseYear: releaseYear || null,
      director: director || null,
    };

    const newDVD = new DVD(newDVDData);
    const savedDVD = await newDVD.save();

    res.status(201).json(savedDVD);
  } catch (error: any) {
    console.error("API error:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
});
export default router;
