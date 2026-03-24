import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

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

const PORT = 5002;

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
