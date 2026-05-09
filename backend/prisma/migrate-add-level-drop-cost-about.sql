-- ============================================================================
-- Phase 1 migration — Add CategoryLevel, drop 'cost' and 'about' from CategoryType
-- ============================================================================
--
-- Run order:
--   1. pg_dump backup first (irreversible).
--   2. psql -f migrate-add-level-drop-cost-about.sql
--   3. npx prisma generate    (regen client to match new schema.prisma)
--   4. Restart backend so onModuleInit re-asserts SYSTEM_ROOTS with level=ROOT.
--   5. (optional) npm run seed to upsert per-city verticals + review subtypes.
--
-- Idempotency: each step guarded so re-runs are safe.
-- Atomicity: wrapped in a single transaction. Any error → full rollback.

BEGIN;

-- ----------------------------------------------------------------------------
-- 1. Add CategoryLevel enum
-- ----------------------------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE "CategoryLevel" AS ENUM ('ROOT', 'SUBTYPE', 'CITY', 'SUB');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ----------------------------------------------------------------------------
-- 2. Add level column nullable (so backfill can populate before NOT NULL)
-- ----------------------------------------------------------------------------
ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "level" "CategoryLevel";

-- ----------------------------------------------------------------------------
-- 3. Backfill level by deterministic rules (run in order — each rule fills
--    rows still NULL, so later rules don't overwrite earlier classifications)
-- ----------------------------------------------------------------------------

-- 3a. ROOT: top-level taxonomy roots (matches sitemap v2)
UPDATE "categories"
   SET "level" = 'ROOT'
 WHERE "parentId" IS NULL
   AND "slug" IN ('diem-den', 'lich-trinh-du-lich', 'kinh-nghiem', 'review');

-- 3b. SUBTYPE: review subtypes (review-tour, review-khach-san, review-combo, ...)
UPDATE "categories" c
   SET "level" = 'SUBTYPE'
  FROM "categories" p
 WHERE c."parentId" = p.id
   AND p.slug = 'review'
   AND c.slug LIKE 'review-%'
   AND c."level" IS NULL;

-- 3c. CITY: directly under destination/itinerary/experience root
UPDATE "categories" c
   SET "level" = 'CITY'
  FROM "categories" p
 WHERE c."parentId" = p.id
   AND p.slug IN ('diem-den', 'lich-trinh-du-lich', 'kinh-nghiem')
   AND c."level" IS NULL;

-- 3d. CITY: under review SUBTYPE
UPDATE "categories" c
   SET "level" = 'CITY'
  FROM "categories" p
 WHERE c."parentId" = p.id
   AND p."level" = 'SUBTYPE'
   AND c."level" IS NULL;

-- 3e. SUB: under any CITY (only valid in destination + review-tour + review-khach-san)
UPDATE "categories" c
   SET "level" = 'SUB'
  FROM "categories" p
 WHERE c."parentId" = p.id
   AND p."level" = 'CITY'
   AND c."level" IS NULL;

-- ----------------------------------------------------------------------------
-- 4. Delete cost + about trees (posts first, then categories)
-- ----------------------------------------------------------------------------

-- 4a. Delete posts attached to cost subtree
WITH RECURSIVE cost_tree AS (
  SELECT id FROM "categories" WHERE slug = 'chi-phi-du-lich' OR type = 'cost'
  UNION
  SELECT c.id FROM "categories" c JOIN cost_tree t ON c."parentId" = t.id
)
DELETE FROM "posts" WHERE "categoryId" IN (SELECT id FROM cost_tree);

-- 4b. Delete cost categories themselves (children first via depth)
WITH RECURSIVE cost_tree AS (
  SELECT id, 0 AS depth FROM "categories" WHERE slug = 'chi-phi-du-lich' OR type = 'cost'
  UNION ALL
  SELECT c.id, t.depth + 1 FROM "categories" c JOIN cost_tree t ON c."parentId" = t.id
)
DELETE FROM "categories" WHERE id IN (SELECT id FROM cost_tree);

-- 4c. Delete posts attached to about subtree
WITH RECURSIVE about_tree AS (
  SELECT id FROM "categories" WHERE slug = 'about' OR type = 'about'
  UNION
  SELECT c.id FROM "categories" c JOIN about_tree t ON c."parentId" = t.id
)
DELETE FROM "posts" WHERE "categoryId" IN (SELECT id FROM about_tree);

-- 4d. Delete about categories
WITH RECURSIVE about_tree AS (
  SELECT id, 0 AS depth FROM "categories" WHERE slug = 'about' OR type = 'about'
  UNION ALL
  SELECT c.id, t.depth + 1 FROM "categories" c JOIN about_tree t ON c."parentId" = t.id
)
DELETE FROM "categories" WHERE id IN (SELECT id FROM about_tree);

-- ----------------------------------------------------------------------------
-- 5. Sanity check: any category still NULL level? Should be 0 after cleanup.
-- ----------------------------------------------------------------------------
DO $$
DECLARE
  null_count INT;
BEGIN
  SELECT COUNT(*) INTO null_count FROM "categories" WHERE "level" IS NULL;
  IF null_count > 0 THEN
    RAISE EXCEPTION 'Migration aborted: % categories still have NULL level after backfill. Inspect manually before retrying.', null_count;
  END IF;
END $$;

-- ----------------------------------------------------------------------------
-- 6. Set level NOT NULL
-- ----------------------------------------------------------------------------
ALTER TABLE "categories" ALTER COLUMN "level" SET NOT NULL;

-- ----------------------------------------------------------------------------
-- 7. Drop 'cost' and 'about' values from CategoryType enum
--    (Postgres can't drop enum values directly — recreate enum.)
-- ----------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'CategoryType' AND e.enumlabel IN ('cost', 'about')
  ) THEN
    -- Create new enum without cost/about
    CREATE TYPE "CategoryType_new" AS ENUM ('destination', 'itinerary', 'review', 'experience');

    -- Drop default before column type change (Postgres requires this)
    ALTER TABLE "categories" ALTER COLUMN "type" DROP DEFAULT;

    -- Cast column to new enum (will fail if any cost/about rows remain — they shouldn't)
    ALTER TABLE "categories"
      ALTER COLUMN "type" TYPE "CategoryType_new"
      USING "type"::text::"CategoryType_new";

    -- Restore default
    ALTER TABLE "categories" ALTER COLUMN "type" SET DEFAULT 'destination';

    -- Drop old, rename new
    DROP TYPE "CategoryType";
    ALTER TYPE "CategoryType_new" RENAME TO "CategoryType";
  END IF;
END $$;

-- ----------------------------------------------------------------------------
-- 8. Add index on level (matches schema.prisma @@index([level]))
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS "categories_level_idx" ON "categories"("level");

COMMIT;

-- ============================================================================
-- After this script:
--   - schema.prisma matches DB exactly.
--   - DO NOT run `prisma db push` immediately after; just `prisma generate`.
--   - If any drift, `prisma db push` will surface it.
-- ============================================================================
