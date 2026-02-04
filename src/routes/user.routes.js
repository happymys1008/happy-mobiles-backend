import express from "express";
import { updateCustomerProfile } from "../controllers/user.controller.js";

const router = express.Router();

router.put("/customer/profile", updateCustomerProfile);

export default router;