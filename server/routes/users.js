import express from "express";
import User from "../models/User.js";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();

const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

router.post("/", upload.single("profilePicture"), async (req, res) => {
  try {
    const { username, firstName, lastName, password, confirmPassword } =
      req.body;

    if (!username) {
      return res.status(400).json({ error: "Username is required" });
    }
    if (!firstName) {
      return res.status(400).json({ error: "First name is required" });
    }
    if (!lastName) {
      return res.status(400).json({ error: "Last name is required" });
    }
    if (!password) {
      return res.status(400).json({ error: "Password is required" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "Password needs to be at least 6 characters" });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords need to match" });
    }
    if (!req.file) {
      return res.status(400).json({ error: "Profile picture is required" });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({
        error: "Username already exists",
      });
    }

    const profilePicture = `/uploads/${req.file.filename}`;

    const user = await User.create({
      username,
      firstName,
      lastName,
      password,
      profilePicture,
    });
    res.status(201).json(user);
  } catch (err) {
    console.log("Error creating user", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
