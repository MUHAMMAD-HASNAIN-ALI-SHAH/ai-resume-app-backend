const express = require("express");
const {
  CreateResume,
  getMyResumes,
} = require("../controllers/create.resume.route");
const router = express.Router();

router.route("/").post(CreateResume);
router.route("/").get(getMyResumes);

module.exports = router;
