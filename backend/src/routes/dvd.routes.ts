import express, { Request, Response } from "express";
import DVD, { IDVD } from "../models/dvd.model";

const router = express.Router();

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

export default router;
