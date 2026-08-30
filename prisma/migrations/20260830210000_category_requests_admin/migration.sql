ALTER TYPE "CategoryStatus" ADD VALUE IF NOT EXISTS 'DRAFT';

CREATE TYPE "CategoryRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

ALTER TABLE "Offer" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE TABLE "CategoryRequest" (
    "id" TEXT NOT NULL,
    "requestedBy" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "exampleProducts" TEXT,
    "status" "CategoryRequestStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "adminNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CategoryRequest_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "CategoryRequest_requestedBy_status_idx" ON "CategoryRequest"("requestedBy", "status");
CREATE INDEX "CategoryRequest_slug_status_idx" ON "CategoryRequest"("slug", "status");

ALTER TABLE "CategoryRequest" ADD CONSTRAINT "CategoryRequest_requestedBy_fkey"
  FOREIGN KEY ("requestedBy") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
