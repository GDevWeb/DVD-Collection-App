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

// ***CRUD - Manual actions***
router.post("/", createDVD);
router.get("/", getAllDVDs);
router.get("/:id", getDVDById);
router.patch("/:id", updateDVD);
router.delete("/:id", deleteDVD);

// ***Scan***
// ***1.Scan and Search***
router.post("/scan", scanDVD);
router.post("/add", addDVDFromTMDB);
router.post("/manual", addManualDVD);

export default router;
