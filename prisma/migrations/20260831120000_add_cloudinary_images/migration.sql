ALTER TABLE "ListingImage" ADD COLUMN "publicId" TEXT;

CREATE TABLE "ImageUpload" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ImageUpload_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ImageUpload_publicId_key" ON "ImageUpload"("publicId");
CREATE INDEX "ImageUpload_ownerId_idx" ON "ImageUpload"("ownerId");
ALTER TABLE "ImageUpload" ADD CONSTRAINT "ImageUpload_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
