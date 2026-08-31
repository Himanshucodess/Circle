import { Router } from "express";
import * as c from "../controllers/listingController";
import * as o from "../controllers/offerController";
import { authenticateRequired } from "../middleware/auth";

const router = Router();

router.get("/", c.listListings);
router.post("/", authenticateRequired as any, c.createListing);
router.get("/mine", authenticateRequired as any, c.myListings);
router.delete("/:id", authenticateRequired as any, c.deleteListing);
router.post("/:id/view", c.recordView);
router.get("/:id", c.getListing);
router.get("/:id/offer-competitiveness", o.competitiveness);
router.get("/:id/offers", authenticateRequired as any, o.listOffers);
router.post("/:id/offers", authenticateRequired as any, o.createOffer);
router.delete("/:id/images/:imageId", authenticateRequired as any, c.deleteListingImage);
router.patch("/:id/images/order", authenticateRequired as any, c.reorderListingImages);

export default router;
