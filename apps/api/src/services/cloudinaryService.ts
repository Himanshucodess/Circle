import { v2 as cloudinary } from "cloudinary";
import { ApiError } from "../utils/ApiError";

let configured = false;

function configure() {
  if (configured) return;
  const cloudinaryUrl = process.env.CLOUDINARY_URL;
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (cloudinaryUrl) {
    cloudinary.config({ cloudinary_url: cloudinaryUrl, secure: true });
  } else if (cloudName && apiKey && apiSecret) {
    cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret, secure: true });
  } else {
    throw ApiError.internal("Photo upload failed.");
  }
  configured = true;
}

export interface UploadedCloudinaryImage {
  secureUrl: string;
  publicId: string;
}

export async function uploadImage(buffer: Buffer, originalName: string): Promise<UploadedCloudinaryImage> {
  try {
    configure();
    return await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "circlestore/listings",
          resource_type: "image",
          use_filename: true,
          unique_filename: true,
          overwrite: false,
          transformation: [{ width: 2000, height: 2000, crop: "limit", quality: "auto", fetch_format: "auto" }],
        },
        (error, result) => {
          if (error || !result?.secure_url || !result.public_id) return reject(error || new Error("Cloudinary returned no image"));
          resolve({ secureUrl: result.secure_url, publicId: result.public_id });
        }
      );
      stream.on("error", reject);
      stream.end(buffer);
    });
  } catch (error) {
    console.error("[cloudinary] upload failed", { originalName, error });
    if (error instanceof ApiError) throw error;
    throw ApiError.internal("Photo upload failed.");
  }
}

export async function deleteImage(publicId: string) {
  try {
    configure();
    await cloudinary.uploader.destroy(publicId, { resource_type: "image", invalidate: true });
  } catch (error) {
    console.error("[cloudinary] delete failed", { publicId, error });
    throw ApiError.internal("Photo removal failed.");
  }
}

export function optimizedImageUrl(url: string, width: number) {
  if (!url.includes("res.cloudinary.com") || !url.includes("/upload/")) return url;
  return url.replace("/upload/", `/upload/f_auto,q_auto,w_${width}/`);
}
