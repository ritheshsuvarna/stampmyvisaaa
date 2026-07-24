import { Router } from "express";
import { getSummary } from "../controllers/analyticsController.js";

const router = Router();

router.get("/summary", getSummary);

export default router;
