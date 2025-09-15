import { Request, Response } from "express";
import DVD, { IDVD } from "../models/dvd.model";
import {
  addDVDFromTMDBService,
  addManualDVDService,
  getMovieSearchResults,
} from "../services/dvd.service";

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
    const results = await getMovieSearchResults(eanCode);
    res.status(200).json(results);
  } catch (error: any) {
    res.status(404).json({ message: error.message });
  }
};

export const addDVDFromTMDB = async (req: Request, res: Response) => {
  try {
    const { tmdbId, eanCode } = req.body;
    const savedDVD = await addDVDFromTMDBService(tmdbId, eanCode);
    res.status(201).json(savedDVD);
  } catch (error: any) {
    res.status(409).json({ message: error.message });
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
    const savedDVD = await addManualDVDService(req.body);
    res.status(201).json(savedDVD);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
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
