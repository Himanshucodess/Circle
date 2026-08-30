import { Router } from "express";
import * as c from "../controllers/categoryRequestController";
import { authenticateRequired } from "../middleware/auth";
import { requireAdmin } from "../middleware/adminAuth";

const router = Router();
router.post("/", authenticateRequired as any, c.createRequest);
router.get("/my", authenticateRequired as any, c.listMine);
router.get("/admin", requireAdmin, c.listAdmin);
router.patch("/admin/:id", requireAdmin, c.review);
export default router;
