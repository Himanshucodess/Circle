import "express-async-errors";
import express from "express";
import cors from "cors";
import { notFoundHandler, errorHandler } from "./middleware/errorHandler";
import publicCategoriesRouter from "./routes/publicCategories";
import adminCategoriesRouter from "./routes/adminCategories";
import fieldsRouter from "./routes/fields";
import listingsRouter from "./routes/listings";

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: "2mb" }));

  app.get("/api/health", (req, res) => {
    res.json({ success: true, data: { status: "ok" } });
  });

  app.use("/api/categories", publicCategoriesRouter);
  app.use("/api/listings", listingsRouter);

  // Admin
  app.use("/api/admin/categories", adminCategoriesRouter);
  app.use("/api/admin/fields", fieldsRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
