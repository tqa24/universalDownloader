const express = require("express");
const router = express.Router();
const { handleTeraboxDownload } = require("../controllers/teraboxController");

router.get("/download", handleTeraboxDownload);

module.exports = router;
