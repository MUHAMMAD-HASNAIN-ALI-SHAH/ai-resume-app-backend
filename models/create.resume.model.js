const mongoose = require("mongoose");

const resumeSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      required: true,
    },
    jobtitle: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    summary: {
      type: String,
    },
    experience: [
      {
        positiontitle: { type: String, required: true },
        companyname: { type: String, required: true },
        city: { type: String },
        state: { type: String },
        startdate: { type: String, required: true },
        enddate: { type: String },
        summary: { type: String },
      },
    ],
    education: [
      {
        universityname: { type: String, required: true },
        degree: { type: String, required: true },
        major: { type: String },
        startdate: { type: String, required: true },
        enddate: { type: String },
        summary: { type: String },
      },
    ],
    projects: [
      {
        projectname: { type: String, required: true },
        description: { type: String },
        startdate: { type: String },
        enddate: { type: String },
      },
    ],
    skills: [
      {
        name: { type: String, required: true },
      },
    ],
    userEmail: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Resume = mongoose.model("Resume", resumeSchema);

module.exports = Resume;
