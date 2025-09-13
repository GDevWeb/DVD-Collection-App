import { Request, Response } from "express";
import DVD, { IDVD } from "../models/dvd.model";
import {
  extractDirectorName,
  fetchMovieCreditsFromTMDB,
  fetchMovieDetailsFromTMDB,
  fetchProductDetailsFromUPC,
  formatTMDBMovieData,
  searchMovieOnTMDB,
} from "../services/dvd.service";
import { DVDInputData } from "../types/dvd.type";
import { cleanTitleForSearch } from "../utils/cleanTitle.utils";

/**
 * @file DVD Controller
 * @description This file contains all the controllers for the DVD routes.
 * @module controllers/dvd.controller
 */

/**
 * Creates a new DVD.
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @returns {Promise<void>}
 */

export const createDVD = async (req: Request, res: Response): Promise<void> => {
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
};

/**
 * Retrieves all DVDs from the database.
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @returns {Promise<void>}
 */
export const getAllDVDs = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const dvds = await DVD.find({}).sort({ title: 1 });
    res.status(200).json(dvds);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

/**
 * Retrieves a single DVD by its ID from the database.
 * @param {Request} req - The Express request object, containing the DVD ID in `req.params.id`.
 * @param {Response} res - The Express response object.
 * @returns {Promise<void>}
 */

export const getDVDById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = req.params.id;
    const dvd = await DVD.findById(id);

    if (!dvd) {
      res.status(404).json({ message: "DVD not found" });
      return;
    }

    res.status(200).json(dvd);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

/**
 * Updates an existing DVD by its ID.
 * @param {Request} req - The Express request object, containing the DVD ID in `req.params.id` and updated DVD data in `req.body`.
 * @param {Response} res - The Express response object.
 * @returns {Promise<void>}
 */

export const updateDVD = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id;
    const dvd = await DVD.findById(id);

    if (!dvd) {
      res.status(404).json({ message: "DVD not found" });
      return;
    }
    const updatedDVD = req.body;

    await DVD.findByIdAndUpdate(id, updatedDVD, { new: true });
    res.status(200).json(updatedDVD);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

/**
 * Deletes an existing DVD by its ID.
 * @param {Request} req - The Express request object, containing the DVD ID in `req.params.id` and updated DVD data in `req.body`.
 * @param {Response} res - The Express response object.
 * @returns {Promise<void>}
 */

export const deleteDVD = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id;
    const dvd = await DVD.findById(id);

    if (!dvd) {
      res.status(404).json({ message: "DVD not found" });
      return;
    }
    await DVD.findByIdAndDelete(id);
    res.status(200).json({ message: "DVD deleted successfully" });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

export const scanDVD = async (req: Request, res: Response) => {
  try {
    const { eanCode } = req.body;

    if (!eanCode) {
      return res.status(400).json({ message: "EAN code is required." });
    }

    const existingEanCode = await DVD.findOne({ eanCode });
    if (existingEanCode) {
      return res
        .status(409)
        .json({ message: "A DVD with this EAN code already exists." });
    }

    const upcData: any = await fetchProductDetailsFromUPC(eanCode);

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

    const tmdbResults = await searchMovieOnTMDB(cleanTitle);

    if (tmdbResults.length === 0) {
      return res.status(404).json({
        message: `Movie not found on TMDb for title: "${cleanTitle}"`,
      });
    }

    // Map the results to a cleaner format to send to the frontend, limiting to 5 results
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

    res.status(200).json(results);
  } catch (error: any) {
    if (error.response || error.request || error.config) {
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
};

export const addDVDFromTMDB = async (req: Request, res: Response) => {
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

    const movieData = await fetchMovieDetailsFromTMDB(tmdbId);
    const creditData = await fetchMovieCreditsFromTMDB(tmdbId);
    const directorName = extractDirectorName(creditData);

    const newDVDData = formatTMDBMovieData(movieData, directorName, eanCode);
    const newDVD = new DVD(newDVDData);
    const savedDVD = await newDVD.save();

    res.status(200).json(savedDVD);
  } catch (error: any) {
    // Vérification basée sur les propriétés spécifiques d'Axios
    if (error.response || error.request || error.config) {
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
};

// Controller for manually adding a DVD
/**
 * Adds a DVD manually to the database.
 * @param {Request} req - The Express request object, containing DVD data in `req.body`.
 * @param {Response} res - The Express response object.
 * @returns {Promise<void>}
 */

export const addManualDVD = async (req: Request, res: Response) => {
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
};

/**
 * Retrieves a single DVD by its title from the database.
 * @param {Request} req - The Express request object, containing the DVD title in `req.params.title`.
 * @param {Response} res - The Express response object.
 * @returns {Promise<void>}
 */

export const getDVDByTitle = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const title = req.params.title;
    const dvd = await DVD.findOne({
      title: { $regex: new RegExp(title, "i") },
    });

    if (!dvd) {
      res.status(404).json({ message: "DVD not found" });
      return;
    }

    res.status(200).json(dvd);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};
