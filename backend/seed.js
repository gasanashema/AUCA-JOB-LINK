const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const Job = require("./models/Job");
const User = require("./models/User");

const sampleJobs = [
  {
    title: "Junior Software Developer",
    company: "AC Group Ltd",
    location: "Kigali, Rwanda",
    description:
      "Join our innovative team at AC Group developing digital transport solutions. Work on backend and frontend systems for Tap&Go payment platform.",
    salary: "$800 - $1,200/month",
    jobType: "full-time",
    requirements: ["JavaScript", "Node.js", "React", "MongoDB"],
    minGrade: 14,
    skills: ["Problem-solving", "Team collaboration", "Quick learner"],
  },
  {
    title: "Full Stack Web Developer",
    company: "Irembo",
    location: "Kigali, Rwanda",
    description:
      "Build government e-services platforms. Work on scalable web applications that serve millions of Rwandans.",
    salary: "$1,000 - $1,500/month",
    jobType: "full-time",
    requirements: ["Vue.js", "Node.js", "PostgreSQL", "Docker"],
    minGrade: 15,
    skills: ["API design", "Database optimization", "Security awareness"],
  },
  // ... add all other jobs here as before
];

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("✅ Connected to MongoDB");

    const employerPassword = await bcrypt.hash("password123", 10);
    const adminPassword = await bcrypt.hash("admin123", 10);
    const studentPassword = await bcrypt.hash("student123", 10);

    let employer = await User.findOne({ email: "employer@auca.rw" });
    if (!employer) {
      employer = await User.create({
        name: "AUCA Employer",
        email: "employer@auca.rw",
        password: employerPassword,
        role: "employer",
      });
      console.log("✅ Created demo employer user");
    } else {
      employer.password = employerPassword;
      await employer.save();
      console.log("✅ Updated demo employer password");
    }

    // Create admin user for testing
    const adminExists = await User.findOne({ email: 'admin@auca.rw' });
    if (!adminExists) {
      await User.create({
        name: 'System Admin',
        email: 'admin@auca.rw',
        password: adminPassword,
        role: 'admin'
      });
      console.log("✅ Created admin user");
    } else {
      adminExists.password = adminPassword;
      await adminExists.save();
      console.log("✅ Updated admin password");
    }

    // Create student user for testing
    const studentExists = await User.findOne({ email: 'student@auca.ac.rw' });
    if (!studentExists) {
      await User.create({
        name: 'Demo Student',
        email: 'student@auca.ac.rw',
        password: studentPassword,
        role: 'job_seeker'
      });
      console.log("✅ Created demo student user");
    } else {
      studentExists.password = studentPassword;
      await studentExists.save();
      console.log("✅ Updated demo student password");
    }

    // Check and insert jobs only if they don't exist
    let addedCount = 0;
    for (const job of sampleJobs) {
      const exists = await Job.findOne({ title: job.title, company: job.company });
      if (!exists) {
        await Job.create({
          ...job,
          postedBy: employer._id,
        });
        addedCount++;
      }
    }

    console.log(`✅ Added ${addedCount} new jobs (skipped duplicates)`);

    const totalJobs = await Job.countDocuments();
    console.log(`📊 Total Jobs: ${totalJobs}`);
    console.log(`Posted By: ${employer.name}`);

    console.log("🚀 Seeding completed successfully!");

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

seedDatabase();