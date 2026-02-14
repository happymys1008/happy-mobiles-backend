import jwt from "jsonwebtoken";
import User from "../models/User.model.js";

const adminAuth = async (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({ message: "No token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Not admin" });
    }

    const admin = await User.findById(decoded.id);

    if (!admin) {
      return res.status(401).json({ message: "Admin not found" });
    }

    req.admin = admin;
    next();

  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

export default adminAuth;
