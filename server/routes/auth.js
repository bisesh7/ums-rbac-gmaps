import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { protect } from "../middlewares/protect.js";

const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username) {
      return res.status(400).json({ error: "Username is required" });
    }
    if (!password) {
      return res.status(400).json({ error: "Password is required" });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ error: "Invalid credential" });
    }

    if (!user.role) {
      return res
        .status(403)
        .json({ error: "User role is not assigned by admin" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );

    res.status(200).json({
      message: "Login Successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        profilePicture: user.profilePicture,
      },
    });
  } catch (err) {
    console.error("Login error", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/role", protect, (req, res) => {
  res.status(200).json({
    id: req.user._id,
    role: req.user.role,
  });
});

export default router;
