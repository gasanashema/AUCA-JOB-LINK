const express = require("express");
const Job = require("../models/Job");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

// Get all jobs from DB
router.get("/", async (req, res) => {
  console.log("🔍 Fetching all jobs...");
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    console.log(`✅ Found ${jobs.length} jobs`);
    res.json(jobs);
  } catch (err) {
    console.error("❌ Failed to fetch jobs:", err);
    res.status(500).json({ message: "Failed to fetch jobs" });
  }
});

// Create a new job (authenticated)
router.post("/", auth, async (req, res) => {
  try {
    const { title, company, location, description, salary, jobType, requirements, minGrade, skills } = req.body;

    const job = await Job.create({
      title,
      company,
      location: location || "",
      description,
      salary,
      jobType,
      requirements: requirements || [],
      minGrade,
      skills: skills || [],
      postedBy: req.user.id
    });

    res.status(201).json(job);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create job" });
  }
});

// Delete job (only by poster or admin)
router.delete("/:id", auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });

    // allow if admin or owner
    if (req.user.role !== "admin" && job.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to delete this job" });
    }

    await Job.findByIdAndDelete(req.params.id);
    res.json({ message: "Job deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete job" });
  }
});

// Apply to a job (authenticated)
router.post('/:id/apply', auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    // prevent duplicate applications
    if (job.applicants && job.applicants.some(a => a.user.toString() === req.user.id)) {
      return res.status(400).json({ message: 'Already applied' });
    }

    job.applicants = job.applicants || [];
    job.applicants.push({ 
      user: req.user.id, 
      appliedAt: new Date(),
      transcript: req.body.transcript || ""
    });
    await job.save();

    res.json({ message: 'Application submitted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to apply' });
  }
});

// Update a job (only by poster or admin)
router.put("/:id", auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });

    // allow if admin or owner
    if (req.user.role !== "admin" && job.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to edit this job" });
    }

    const { title, company, location, description, salary, jobType, requirements, minGrade, skills } = req.body;
    
    const updatedJob = await Job.findByIdAndUpdate(
      req.params.id,
      {
        title,
        company,
        location: location || "",
        description,
        salary,
        jobType,
        requirements: requirements || [],
        minGrade,
        skills: skills || [],
        updatedAt: Date.now()
      },
      { new: true }
    );

    res.json(updatedJob);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update job" });
  }
});

// Get applicants for a specific job (only by admin)
router.get("/:id/applicants", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const job = await Job.findById(req.params.id).populate("applicants.user", "name email");
    if (!job) return res.status(404).json({ message: "Job not found" });

    res.json(job.applicants);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch applicants" });
  }
});

// Get applied jobs for current user
router.get('/applied', auth, async (req, res) => {
  try {
    const jobs = await Job.find({ 'applicants.user': req.user.id }).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch applied jobs' });
  }
});

module.exports = router;