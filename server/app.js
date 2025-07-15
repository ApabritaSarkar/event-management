// app.js
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());
const eventRoutes = require("./routes/eventRoutes");
app.use("/events", eventRoutes);

// Routes placeholder
app.get("/", (req, res) => {
  res.send("Event Management API is running");
});

const pool = require("./db/db");
pool.query("SELECT NOW()", (err, res) => {
  if (err) console.error("DB Connection Error:", err);
  else console.log("DB Connected:", res.rows[0]);
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
