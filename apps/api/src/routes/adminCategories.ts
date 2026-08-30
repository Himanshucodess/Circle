import { Router } from "express";
import * as c from "../controllers/categoryController";
import * as cf from "../controllers/categoryFieldController";
import * as s from "../controllers/schemaController";
import { requireAdmin } from "../middleware/adminAuth";

const router = Router();
router.use(requireAdmin);

router.get("/", c.listCategoriesAdmin);
router.get("/stats", c.dashboardStats);
router.post("/", c.createCategory);
router.get("/:id", c.getCategoryAdmin);
router.patch("/:id", c.updateCategory);
router.delete("/:id", c.archiveCategory);

// Category fields
router.get("/:id/fields", cf.listCategoryFields);
router.post("/:id/fields", cf.attachField);
router.patch("/:id/fields/:fieldId", cf.updateCategoryField);
router.delete("/:id/fields/:fieldId", cf.removeCategoryField);
router.post("/:id/fields/reorder", cf.reorderCategoryFields);

// Schemas
router.get("/:id/schema", s.getSellerSchema);
router.get("/:id/draft-schema", s.getDraftSchema);
router.get("/:id/schemas", s.getSchemaVersions);
router.post("/:id/schema/draft", s.saveDraft);
router.post("/:id/schema/publish", s.publishSchema);

export default router;
