const Resume = require("../models/create.resume.model");

const CreateResume = async (req, res) => {
  try {
    const { email } = req.session.user;
    if (!email) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const resumeData = {
      userEmail: email,
      ...req.body,
    };

    const requiredFields = ["fullname", "jobtitle", "phone", "email"];
    for (const field of requiredFields) {
      if (!resumeData[field]) {
        return res.status(400).json({ message: `${field} is required` });
      }
    }

    // Create the resume
    const newResume = new Resume(resumeData);
    await newResume.save();
    return res.status(201).json({
      message: "Resume created successfully",
      resume: newResume,
    });
  } catch (error) {
    console.error("Error creating resume:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getMyResumes = async (req, res) => {
  try {
    const { email } = req.session.user;
    if (!email) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const resumes = await Resume.find({ userEmail: email });
    return res.status(200).json(resumes);
  } catch (error) {
    console.error("Error fetching resumes:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getMyResumesById = async (req, res) => {
  try {
    const { resumeId } = req.params;
    const { email } = req.session.user;
    if (!email) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const resume = await Resume.findOne({ _id: resumeId, userEmail: email });
    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    return res.status(200).json(resume);
  } catch (error) {
    console.error("Error fetching resume by ID:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { CreateResume, getMyResumes, getMyResumesById };
