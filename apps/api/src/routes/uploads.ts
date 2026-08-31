import { NextFunction, Request, Response, Router } from "express";
import multer from "multer";
import { authenticateRequired } from "../middleware/auth";
import { ApiError } from "../utils/ApiError";
import * as c from "../controllers/uploadController";

const router = Router();
const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!allowedTypes.has(file.mimetype)) return cb(ApiError.badRequest("UNSUPPORTED_IMAGE_TYPE", "Please upload a JPG, PNG, or WEBP image."));
    cb(null, true);
  },
});

function singleImage(req: Request, res: Response, next: NextFunction) {
  upload.single("image")(req, res, (error) => {
    if (!error) return next();
    if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") return next(ApiError.badRequest("IMAGE_TOO_LARGE", "Image must be smaller than 10 MB."));
    next(error);
  });
}

router.post("/images", authenticateRequired as any, singleImage, c.uploadImage);
router.delete("/images/:id", authenticateRequired as any, c.deleteUploadedImage);

export default router;
