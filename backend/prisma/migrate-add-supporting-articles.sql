-- L5 supporting articles:
-- - posts.kind separates normal L4/pillar posts from L5/supporting posts.
-- - posts.supportingUrlSlug stores the independent root-level L5 URL slug.
-- - supporting_article_links is the many-to-many internal-link relation.

DO $$ BEGIN
  CREATE TYPE "PostKind" AS ENUM ('standard', 'supporting');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "posts"
  ADD COLUMN IF NOT EXISTS "kind" "PostKind" NOT NULL DEFAULT 'standard',
  ADD COLUMN IF NOT EXISTS "supportingUrlSlug" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "posts_supportingUrlSlug_key"
  ON "posts"("supportingUrlSlug");

CREATE INDEX IF NOT EXISTS "posts_kind_idx"
  ON "posts"("kind");

CREATE INDEX IF NOT EXISTS "posts_supportingUrlSlug_idx"
  ON "posts"("supportingUrlSlug");

CREATE TABLE IF NOT EXISTS "supporting_article_links" (
  "id" TEXT NOT NULL,
  "mainPostId" TEXT NOT NULL,
  "supportPostId" TEXT NOT NULL,
  "anchorText" TEXT,
  "secondaryKeywords" TEXT,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "isPrimary" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "supporting_article_links_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "supporting_article_links_mainPostId_fkey"
    FOREIGN KEY ("mainPostId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "supporting_article_links_supportPostId_fkey"
    FOREIGN KEY ("supportPostId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "supporting_article_links_mainPostId_supportPostId_key"
  ON "supporting_article_links"("mainPostId", "supportPostId");

CREATE INDEX IF NOT EXISTS "supporting_article_links_mainPostId_sortOrder_idx"
  ON "supporting_article_links"("mainPostId", "sortOrder");

CREATE INDEX IF NOT EXISTS "supporting_article_links_supportPostId_isPrimary_idx"
  ON "supporting_article_links"("supportPostId", "isPrimary");
