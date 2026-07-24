import { Router } from "express";
import { listCities, listOpsUsers } from "../controllers/metaController.js";

const router = Router();

router.get("/cities", listCities);
router.get("/ops-users", listOpsUsers);

export default router;
