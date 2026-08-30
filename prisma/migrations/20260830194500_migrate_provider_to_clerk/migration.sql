-- Align the auth table with the Clerk-backed User model.
-- providerId was the old generic OAuth identifier; Clerk IDs are stored in clerkId.
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = current_schema()
          AND table_name = 'User'
          AND column_name = 'providerId'
    ) AND NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = current_schema()
          AND table_name = 'User'
          AND column_name = 'clerkId'
    ) THEN
        ALTER TABLE "User" RENAME COLUMN "providerId" TO "clerkId";
    END IF;
END $$;

ALTER TABLE "User" DROP COLUMN IF EXISTS "provider";

CREATE UNIQUE INDEX IF NOT EXISTS "User_clerkId_key" ON "User"("clerkId");
