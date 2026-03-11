const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/auca-job-link')
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// In-memory data for testing
let jobs = [
  { id: 1, title: "Software Developer", company: "Tech Corp", description: "Full-stack development" },
  { id: 2, title: "Data Analyst", company: "Data Inc", description: "Data analysis and reporting" }
];

console.log("✅ Server initialized with sample data");

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/jobs", require("./routes/jobs"));

// Export jobs for routes
app.locals.jobs = jobs;

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});