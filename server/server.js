const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db.js");

dotenv.config();
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
