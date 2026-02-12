import express from "express";
import multer from "multer";
import { uploadTestImage } from "../controllers/imagekit.controller.js";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/test-upload", upload.single("image"), uploadTestImage);

export default router;
