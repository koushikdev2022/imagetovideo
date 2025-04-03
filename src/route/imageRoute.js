const express = require("express");
const imageRouter = express.Router()
const multer = require("multer");

const fs = require("fs");
const path = require("path");

// Set up Multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, "../../public/uploads/images/");
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const upload = multer({ storage });

const imageController = require("../controller/api/image/image.controller")


imageRouter.post("/data", upload.single("image"), imageController.videoConvert);

module.exports = imageRouter