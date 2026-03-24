const express = require("express");
const router = express.Router();
const db = require("../database/db");
const bcrypt = require("bcrypt");
const authMiddleware = require("../middleware/auth");

// Get all users
router.get("/", authMiddleware, (req, res) => {
  //Pagination
  let { page, limit } = req.query;
  page = parseInt(page) || 1;
  limit = parseInt(limit) || 10;
  const offset = (page - 1) * limit;

  db.get("SELECT COUNT(*) AS count FROM user", [], (err, countRow) => {
    if (err) return res.status(500).json({ error: err.message });

    const total = countRow.count;
    const totalPages = Math.ceil(total / limit);

    db.all(
      "SELECT * FROM user LIMIT ? OFFSET ?",
      [limit, offset],
      (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({
          data: rows,
          page,
          totalPages,
          totalRecords: total,
        });
      },
    );
  });
});

router.post("/", (req, res) => {
  const {
    fname,
    lname,
    email,
    password,
    confirmPassword,
    dateOfBirth,
    gender,
    address,
    phoneNumber,
  } = req.body;

  if (
    !fname ||
    !lname ||
    !email ||
    !password ||
    !confirmPassword ||
    !dateOfBirth ||
    !gender ||
    !address ||
    !phoneNumber
  ) {
    return res.status(400).json({ error: "All fields are required" });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ error: "Passwords do not match" });
  }

  try {
    const saltRounds = 10;
    const hashedPassword = bcrypt.hashSync(password, saltRounds);

    const query = `
      INSERT INTO user (fname, lname, email, password, dob, gender, address, phone)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(
      query,
      [
        fname,
        lname,
        email,
        hashedPassword,
        dateOfBirth,
        gender,
        address,
        phoneNumber,
      ],
      function (err) {
        if (err) {
          console.error(err);
          if (err.message.includes("UNIQUE")) {
            return res.status(400).json({ error: "Email already exists" });
          }
          return res.status(500).json({ error: "Database error" });
        }
        res.json({
          id: this.lastID,
          fname,
          lname,
          email,
          dob: dateOfBirth,
          gender,
          address,
          phoneNumber,
        });
      },
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/:id", authMiddleware, (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ error: "User ID is required" });
  }
  const query = "DELETE FROM user WHERE id = ?";

  db.run(query, [id], function (err) {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Database error" });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ message: "User deleted successfully" });
  });
});

router.put("/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const {
    fname,
    lname,
    email,
    password,
    confirmPassword,
    dateOfBirth,
    gender,
    address,
    phoneNumber,
  } = req.body;

  if (!id) {
    return res.status(400).json({ error: "User ID is required" });
  }

  if (
    !fname ||
    !lname ||
    !email ||
    !dateOfBirth ||
    !gender ||
    !address ||
    !phoneNumber
  ) {
    return res.status(400).json({ error: "All fields are required" });
  }

  let query, params;

  let hashedPassword = null;
  if (password) {
    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    hashedPassword = await bcrypt.hash(password, 10);

    query = `
        UPDATE user
        SET fname = ?, lname = ?, email = ?, password = ?, dob = ?, gender = ?, address = ?, phone = ?
        WHERE id = ?
    `;

    params = [
      fname,
      lname,
      email,
      hashedPassword,
      dateOfBirth,
      gender,
      address,
      phoneNumber,
      id,
    ];
  } else {
    query = `
        UPDATE user
        SET fname = ?, lname = ?, email = ?, dob = ?, gender = ?, address = ?, phone = ?
        WHERE id = ?
    `;

    params = [
      fname,
      lname,
      email,
      dateOfBirth,
      gender,
      address,
      phoneNumber,
      id,
    ];
  }

  db.run(query, params, function (err) {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Database error" });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      message: "User updated successfully",
      id,
      fname,
      lname,
      email,
      dateOfBirth,
      gender,
      address,
      phoneNumber,
    });
  });
});

module.exports = router;
