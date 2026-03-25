import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer")) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    if (user.deletedAt) {
      return res.status(403).json({ error: "User has been deleted" });
    }

    req.user = user;

    next();
  } catch {
    console.error("JWT verification failed", err);
    res.status(401).json({ error: "Unauthorized" });
  }
};
