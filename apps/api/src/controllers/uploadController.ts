import { Request, Response } from "express";
import * as cloudinaryService from "../services/cloudinaryService";
import * as imageUploadRepo from "../repositories/imageUploadRepository";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";

export const uploadImage = asyncHandler(async (req: Request, res: Response) => {
  const file = (req as Request & { file?: Express.Multer.File }).file;
  if (!file) throw ApiError.badRequest("IMAGE_REQUIRED", "Please select an image to upload.");
  const uploaded = await cloudinaryService.uploadImage(file.buffer, file.originalname);
  try {
    const record = await imageUploadRepo.create({ ownerId: (req as any).user.id, ...uploaded, url: uploaded.secureUrl });
    res.status(201).json({ success: true, data: { id: record.id, secureUrl: record.url, publicId: record.publicId } });
  } catch (error) {
    try { await cloudinaryService.deleteImage(uploaded.publicId); } catch {}
    throw error;
  }
});

export const deleteUploadedImage = asyncHandler(async (req: Request, res: Response) => {
  const record = await imageUploadRepo.findById(req.params.id);
  if (!record) throw ApiError.notFound("Photo upload not found");
  if (record.ownerId !== (req as any).user.id) throw ApiError.forbidden("You cannot remove this photo");
  await cloudinaryService.deleteImage(record.publicId);
  await imageUploadRepo.deleteById(record.id);
  res.json({ success: true, data: { removed: true } });
});
