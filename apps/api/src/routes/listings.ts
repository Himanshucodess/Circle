import { Router } from "express";
import * as c from "../controllers/listingController";

const router = Router();

router.get("/", c.listListings);
router.post("/", c.createListing);
router.get("/:id", c.getListing);

export default router;
