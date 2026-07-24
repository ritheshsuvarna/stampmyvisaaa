import { Router } from "express";
import {
  listRelocations,
  getRelocation,
  createRelocation,
  updateRelocation,
  deleteRelocation,
} from "../controllers/relocationsController.js";
import { updateChecklistItem, applySuggestions } from "../controllers/checklistController.js";

const router = Router();

router.get("/", listRelocations);
router.post("/", createRelocation);
router.get("/:id", getRelocation);
router.patch("/:id", updateRelocation);
router.delete("/:id", deleteRelocation);

router.patch("/:id/checklist/:itemKey", updateChecklistItem);
router.post("/:id/checklist/apply-suggestions", applySuggestions);

export default router;
