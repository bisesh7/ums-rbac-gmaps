import express from "express";
import User from "../models/User.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import bcrypt from "bcrypt";
import { protect } from "../middlewares/protect.js";

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

    const hashedPassword = await bcrypt.hash(password, 10);

    const profilePicture = `/uploads/${req.file.filename}`;

    const user = await User.create({
      username,
      firstName,
      lastName,
      password: hashedPassword,
      profilePicture,
    });
    res.status(201).json(user);
  } catch (err) {
    console.log("Error creating user", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/", protect, async (req, res) => {
  try {
    const { role, page = 1, limit = 10 } = req.query;

    const query = { deletedAt: null };
    if (role && role !== "ALL") {
      query.role = role;
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    const totalUsers = await User.countDocuments(query);

    const users = await User.find(query)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    res.status(200).json({
      users,
      totalUsers,
      totalPages: Math.ceil(totalUsers / limitNum),
      currentPage: pageNum,
    });
  } catch (err) {
    console.error("Error fetching users", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
