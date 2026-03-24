const express = require("express");
const cors = require("cors");
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
