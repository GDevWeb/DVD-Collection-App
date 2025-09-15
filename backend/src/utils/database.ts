import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

// MongoDB
export const connectDB = mongoose
  .connect(process.env.MONGODB_URI as string)
  .then(() => {
    console.log("Connected to MongoDB!");
  })
  .catch((err) => console.error("Could not connect to MongoDB...", err));
