import { Router } from "express";
import * as c from "../controllers/listingController";
import * as o from "../controllers/offerController";

const router = Router();

router.get("/", c.listListings);
router.post("/", c.createListing);
router.get("/:id", c.getListing);
router.get("/:id/offers", o.listOffers);
router.post("/:id/offers", o.createOffer);

export default router;
