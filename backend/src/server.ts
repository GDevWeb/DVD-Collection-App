import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";

dotenv.config();

const app = express();
const PORT = 3000;
const port = process.env.PORT || PORT;

try {
  const testEnvPORT = process.env.PORT;
  if (!testEnvPORT) {
    throw new Error("PORT is not defined in the environment variables.");
  }
  console.log(process.env.PORT);
} catch (error) {
  console.error(error);
  process.exit(1);
}

// Middlewares
app.use(express.json());

// MongoDB
mongoose
  .connect(process.env.MONGODB_URI as string)
  .then(() => {
    console.log("Connected to MongoDB!");
  })
  .catch((err) => console.error("Could not connect to MongoDB...", err));

// Basics routes
app.get("/", (req, res) => {
  res.send("DVD collection App Backend is running!");
});

app.listen(port, () => {
  console.log(`Server is listening on "http://localhost/${PORT}"`);
});
