import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import userRouter from "./routes/users.js";
import authRouter from "./routes/auth.js";
import path from "path";

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Mongo DB connected.");
  } catch (err) {
    console.error("MongoDB connection failed.", err);
    process.exit(1);
  }
};

connectDB();

const app = express();

app.use(
  cors({
    origin: "*",
  }),
);
app.use(express.json());

//Serve uploads folder
const uploadDir = path.join(process.cwd(), "uploads");
app.use("/uploads", express.static(uploadDir));

// User routes
app.use("/api/users", userRouter);
// Auth routes
app.use("/api/auth", authRouter);

const PORT = 5002;

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
