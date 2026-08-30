import { Router } from "express";
import * as c from "../controllers/fieldController";
import { requireAdmin } from "../middleware/adminAuth";

const router = Router();
router.use(requireAdmin);

router.get("/", c.listFields);
router.post("/", c.createField);
router.get("/:id", c.getField);
router.patch("/:id", c.updateField);

export default router;
