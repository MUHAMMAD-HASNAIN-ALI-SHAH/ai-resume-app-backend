const express = require("express");
const router = express.Router();
require("dotenv").config();
const {
  redirectGoogle,
  googleCallback,
  verifyUser,
  logout,
} = require("../controllers/user.controller");

// google authentication routes
router.get("/google", redirectGoogle);
router.get("/google/callback", googleCallback);

router.get("/verify", verifyUser);

router.get("/logout", logout);

module.exports = router;
