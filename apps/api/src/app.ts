import "express-async-errors";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { clerkMiddleware } from "@clerk/express";
import { notFoundHandler, errorHandler } from "./middleware/errorHandler";
import { authenticateOptional } from "./middleware/auth";
import publicCategoriesRouter from "./routes/publicCategories";
import adminCategoriesRouter from "./routes/adminCategories";
import fieldsRouter from "./routes/fields";
import listingsRouter from "./routes/listings";
import authRouter from "./routes/auth";
import adminAuthRouter from "./routes/adminAuth";
import categoryRequestsRouter from "./routes/categoryRequests";
import uploadsRouter from "./routes/uploads";

export function createApp() {
  const app = express();
  app.disable("x-powered-by");
  if (process.env.NODE_ENV === "production") app.set("trust proxy", 1);
  const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
  const allowedOrigins = process.env.NODE_ENV === "production" ? [FRONTEND_URL] : [FRONTEND_URL, "http://localhost:5173"];

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
        return callback(new Error("Origin not allowed"));
      },
      credentials: true,
    })
  );
  app.use(express.json({ limit: "2mb" }));
  app.use(cookieParser());
  app.use((_req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    if (process.env.NODE_ENV === "production") res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
    next();
  });
  // Clerk — only enable if keys look valid; invalid/dummy keys would crash middleware, so guard
  const clerkSecret = process.env.CLERK_SECRET_KEY || "";
  const clerkPub = process.env.CLERK_PUBLISHABLE_KEY || "";
  const clerkKeysValid =
    !!clerkSecret &&
    /^sk_(test|live)_[A-Za-z0-9_\-]{10,}$/.test(clerkSecret) &&
    !!clerkPub &&
    /^pk_(test|live)_[A-Za-z0-9_\-]{10,}$/.test(clerkPub);
  if (clerkKeysValid) {
    try {
      const mw = clerkMiddleware();
      app.use((req, _res, next) => {
        try {
          // Clerk middleware calls next(err) on invalid key/session — swallow to allow demo/JWT fallback
          (mw as any)(req, _res, (err: any) => {
            if (err) {
              console.warn("[clerk] middleware error — falling back to JWT:", err?.message || err);
              return next();
            }
            next();
          });
        } catch (e: any) {
          console.warn("[clerk] middleware sync error — fallback:", e?.message);
          next();
        }
      });
    } catch (e: any) {
      console.warn("[clerk] failed to init, disabling Clerk:", e?.message);
    }
  } else if (clerkSecret || clerkPub) {
    console.warn("[auth] CLERK keys set but invalid format — Clerk disabled. Use pk_test_/sk_test_ from dashboard or leave empty for demo mode.");
  } else {
    console.warn("[auth] CLERK_SECRET_KEY not set — Clerk disabled, using JWT/demo only");
  }
  // Global optional auth — populates req.user from Clerk (if present) or JWT/demo
  app.use(authenticateOptional as any);

  app.get("/api/health", (req, res) => {
    res.json({ success: true, data: { status: "ok" } });
  });

  app.use("/api/auth", authRouter);
  app.use("/api/admin/auth", adminAuthRouter);
  app.use("/api/categories", publicCategoriesRouter);
  app.use("/api/listings", listingsRouter);
  app.use("/api/uploads", uploadsRouter);
  app.use("/api/category-requests", categoryRequestsRouter);

  // Admin
  app.use("/api/admin/categories", adminCategoriesRouter);
  app.use("/api/admin/fields", fieldsRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
