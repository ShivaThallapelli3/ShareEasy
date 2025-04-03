const express = require("express");
const multer = require("multer");
const path = require("path");
const QRCode = require("qrcode");
const File = require("../models/File");

const router = express.Router();

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage });

// File Upload Route
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const fileUrl = `https://shareeasy-frontend.onrender.com/files/${req.file.filename}`;

    console.log("endpoint reached");
    const qrCodeUrl = await QRCode.toDataURL(fileUrl);

    const newFile = new File({
      filename: req.file.filename,
      fileUrl,
      qrCodeUrl,
    });
    await newFile.save();

    res.json({ fileUrl, qrCodeUrl });
  } catch (error) {
    res.status(500).json({ error: "Upload failed" });
  }
});

// Serve Uploaded Files
router.use("/files", express.static("uploads"));

module.exports = router;
