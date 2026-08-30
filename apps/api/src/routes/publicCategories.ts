import { Router } from "express";
import * as c from "../controllers/categoryController";
import * as s from "../controllers/schemaController";

const router = Router();

router.get("/", c.listCategories);
router.get("/:id/schema", s.getSellerSchema);
router.get("/:id", c.getCategory);

export default router;
