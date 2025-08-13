const express = require("express");
const {
  CreateResume,
  getMyResumes,
  getMyResumesById,
  deleteResumeById,
} = require("../controllers/create.resume.route");
const router = express.Router();

router.route("/").post(CreateResume);
router.route("/").get(getMyResumes);
router.route("/:resumeId").get(getMyResumesById);
router.route("/:resumeId").delete(deleteResumeById);

module.exports = router;
