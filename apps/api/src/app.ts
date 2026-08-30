import "express-async-errors";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import session from "express-session";
import passport from "passport";
import { setupPassport } from "./lib/passport";
import { notFoundHandler, errorHandler } from "./middleware/errorHandler";
import { authenticateOptional } from "./middleware/auth";
import publicCategoriesRouter from "./routes/publicCategories";
import adminCategoriesRouter from "./routes/adminCategories";
import fieldsRouter from "./routes/fields";
import listingsRouter from "./routes/listings";
import authRouter from "./routes/auth";

export function createApp() {
  const app = express();
  const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

  app.use(
    cors({
      origin: [FRONTEND_URL, "http://localhost:5173"],
      credentials: true,
    })
  );
  app.use(express.json({ limit: "2mb" }));
  app.use(cookieParser());
  app.use(
    session({
      secret: process.env.JWT_SECRET || "dev-session-secret",
      resave: false,
      saveUninitialized: false,
    })
  );
  app.use(passport.initialize());
  app.use(passport.session());
  setupPassport();

  app.use(authenticateOptional as any);

  app.get("/api/health", (req, res) => {
    res.json({ success: true, data: { status: "ok" } });
  });

  app.use("/api/auth", authRouter);
  app.use("/api/categories", publicCategoriesRouter);
  app.use("/api/listings", listingsRouter);

  // Admin
  app.use("/api/admin/categories", adminCategoriesRouter);
  app.use("/api/admin/fields", fieldsRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
