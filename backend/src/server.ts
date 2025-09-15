import dotenv from "dotenv";
import express from "express";
import dvdRoutes from "./routes/dvd.routes";
import { connectDB } from "./utils/database";
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

// Routes
app.use("/api/dvds", dvdRoutes);

// Basics routes
app.get("/", (req, res) => {
  res.send("<h1>DVD collection App Backend is running!</h1>");
});

const startServer = async () => {
  try {
    await connectDB;
    app.listen(port, () => {
      console.log(`Server is listening on "http://localhost:${PORT}"`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

export default app;
