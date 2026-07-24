import { Router } from "express";
import rateLimit from "express-rate-limit";
import { parseUpdate, draftMessage } from "../controllers/aiController.js";

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { message: "Too many AI requests — wait a moment and try again.", code: "rate_limited" } },
});

const router = Router();

router.use(aiLimiter);
router.post("/relocations/:id/parse-update", parseUpdate);
router.post("/relocations/:id/draft-message", draftMessage);

export default router;
