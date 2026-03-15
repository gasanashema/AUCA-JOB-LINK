// server.js
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const Job = require("./models/Job"); // Mongoose model for jobs

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
.then(() => {
  console.log("✅ MongoDB connected");
  seedJobs(); // Seed jobs after DB connection
})
.catch(err => console.error("MongoDB connection error:", err));

// Seed jobs if collection is empty
const seedJobs = async () => {
  try {
    const count = await Job.countDocuments();
    if (count === 0) {
      await Job.insertMany([
        { title: "Software Developer", company: "Tech Corp", description: "Full-stack development" },
        { title: "Data Analyst", company: "Data Inc", description: "Data analysis and reporting" },
        { title: "Backend Engineer", company: "Globex", description: "Node.js & MongoDB development" },
      ]);
      console.log("✅ Sample jobs inserted into MongoDB");
    } else {
      console.log(`ℹ️ ${count} jobs already exist in MongoDB`);
    }
  } catch (err) {
    console.error("Error seeding jobs:", err);
  }
};

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/jobs", require("./routes/jobs"));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});