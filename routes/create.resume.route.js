const express = require("express");
const {
  CreateResume,
  getMyResumes,
  getMyResumesById,
} = require("../controllers/create.resume.route");
const router = express.Router();

router.route("/").post(CreateResume);
router.route("/").get(getMyResumes);
router.route("/:resumeId").get(getMyResumesById);

module.exports = router;
