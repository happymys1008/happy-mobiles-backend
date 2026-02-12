import imagekit from "../config/imagekit.js";

export const uploadTestImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const result = await imagekit.upload({
      file: req.file.buffer,
      fileName: req.file.originalname,
      folder: "test-uploads",
    });

    res.json({
      success: true,
      url: result.url,
      fileId: result.fileId,
    });

  } catch (error) {
    console.error("ImageKit Upload Error:", error);
    res.status(500).json({ message: "Upload failed" });
  }
};
