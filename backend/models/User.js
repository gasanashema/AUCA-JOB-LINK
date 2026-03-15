const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ["job_seeker", "student", "employer", "admin"], default: "job_seeker" }
});

module.exports = mongoose.model("User", UserSchema);