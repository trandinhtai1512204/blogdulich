-- ============================================================================
-- Phase 2 — Drop global Post.slug unique, switch to composite (categoryId, slug).
--
-- Why: URL semantics already differentiate posts by category prefix
--   (/lich-trinh-du-lich-ha-noi/3-ngay-2-dem vs
--    /lich-trinh-du-lich-da-nang/3-ngay-2-dem are distinct URLs).
-- The global slug unique was over-restrictive and blocked legitimate
-- cross-category reuse of short slugs.
--
-- Postgres NULL semantics (NULL != NULL) means posts with categoryId=NULL
-- are not constrained against each other; this matches current expectation
-- since orphan posts are not URL-routable and only redirect via /posts/{slug}.
-- ============================================================================

-- ============================================================================
-- UP
-- ============================================================================
BEGIN;

-- Drop the global slug unique. Try both forms — newer schemas store it as
-- a CONSTRAINT, older as a bare INDEX with the same `posts_slug_key` name.
ALTER TABLE "posts" DROP CONSTRAINT IF EXISTS "posts_slug_key";
DROP INDEX IF EXISTS "posts_slug_key";

-- Composite unique on (categoryId, slug). Matches URL-level uniqueness.
CREATE UNIQUE INDEX IF NOT EXISTS "posts_categoryId_slug_key"
  ON "posts"("categoryId", "slug");

COMMIT;

-- ============================================================================
-- DOWN (rollback) — only run if you need to revert.
-- ============================================================================
-- BEGIN;
-- DROP INDEX IF EXISTS "posts_categoryId_slug_key";
-- ALTER TABLE "posts" ADD CONSTRAINT "posts_slug_key" UNIQUE (slug);
-- COMMIT;
