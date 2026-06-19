DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'FaqTargetType') THEN
    CREATE TYPE "FaqTargetType" AS ENUM ('global', 'category', 'city', 'post');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "faqs" (
  "id" TEXT NOT NULL,
  "targetType" "FaqTargetType" NOT NULL,
  "targetId" TEXT,
  "module" "CategoryType",
  "question" TEXT NOT NULL,
  "answer" TEXT NOT NULL,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "published" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "faqs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "faqs_targetType_targetId_idx" ON "faqs"("targetType", "targetId");
CREATE INDEX IF NOT EXISTS "faqs_module_idx" ON "faqs"("module");
CREATE INDEX IF NOT EXISTS "faqs_published_idx" ON "faqs"("published");
