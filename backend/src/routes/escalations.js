import { Router } from "express";
import { listEscalations, acknowledgeEscalation } from "../controllers/escalationsController.js";

const router = Router();

router.get("/", listEscalations);
router.post("/:id/acknowledge", acknowledgeEscalation);

export default router;
