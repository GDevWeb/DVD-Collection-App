import dotenv from "dotenv";
import express from "express";
import {
  addDVDFromTMDB,
  addManualDVD,
  createDVD,
  deleteDVD,
  getAllDVDs,
  getDVDById,
  scanDVD,
  updateDVD,
} from "../controllers/dvd.controller";

dotenv.config();

const router = express.Router();

const UPC_API_URL = process.env.UPC_API_URL;
const TMDB_API_URL = process.env.TMDB_API_URL;
const TMDB_API_KEY = process.env.TMDB_API_KEY;

// ***CRUD - Manual actions***
router.post("/", createDVD);
router.get("/", getAllDVDs);
router.get("/:id", getDVDById);
router.patch("/:id", updateDVD);
router.delete("/:id", deleteDVD);

// ***
// ***1.Scan and Search***
router.post("/scan", scanDVD);
// ***2.Add DVD (from TMDb)***
router.post("/add", addDVDFromTMDB);
// ***3.Add DVD (Manual)***
router.post("/manual", addManualDVD);

export default router;
