-- ============================================================================
-- Phase 1.5 — Drop global slug unique, switch to composite (parentId, slug).
-- Same Category(slug='ha-noi') can exist under destination root, review-tour,
-- review-khach-san, etc. — each parent has its own slug namespace.
-- ============================================================================

BEGIN;

-- Drop global unique constraint on slug
ALTER TABLE "categories" DROP CONSTRAINT IF EXISTS "categories_slug_key";

-- Composite unique (parentId, slug). Postgres NULL semantics (NULL != NULL)
-- means this allows multiple ROOTs with parentId=NULL. Code-level
-- ensureSystemRoots prevents duplicate ROOT slugs.
CREATE UNIQUE INDEX IF NOT EXISTS "categories_parentId_slug_key"
  ON "categories"("parentId", "slug");

COMMIT;
