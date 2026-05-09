-- ============================================================================
-- Fix legacy destination data: re-parent SUB-as-CITY entries under proper city.
--
-- Before:
--   ROOT diem-den
--   ├─ chùa            (level=CITY, cityId=ha-noi, slug=chua)
--   ├─ Ha Noi Pagoda   (level=CITY, cityId=ha-noi, ...)
--   └─ ...
--
-- After:
--   ROOT diem-den
--   └─ Hà Nội  (level=CITY, slug=ha-noi)            ← AUTO-CREATED if missing
--      ├─ chùa            (level=SUB)
--      ├─ Ha Noi Pagoda   (level=SUB)
--      └─ ...
--
-- Detection rule: a Category is "legacy SUB-as-CITY" if:
--   parentId = destination root  AND  level = 'CITY'  AND  cityId IS NOT NULL
--   AND  slug != city.slug   (slug doesn't match the City record — so it's
--                             not the proper cityCat).
-- ============================================================================

BEGIN;

DO $$
DECLARE
  v_dest_root_id text;
  v_city_record RECORD;
  v_citycat_id text;
BEGIN
  SELECT id INTO v_dest_root_id
  FROM categories
  WHERE slug = 'diem-den' AND "parentId" IS NULL AND level = 'ROOT';

  IF v_dest_root_id IS NULL THEN
    RAISE EXCEPTION 'destination ROOT not found';
  END IF;

  -- For each city that has any "legacy" entries directly under destRoot,
  -- ensure the proper cityCat exists, then re-parent legacies under it.
  FOR v_city_record IN
    SELECT DISTINCT ci.id AS city_id, ci.slug AS city_slug, ci.name AS city_name
    FROM categories c
    JOIN cities ci ON c."cityId" = ci.id
    WHERE c."parentId" = v_dest_root_id
      AND c.level = 'CITY'
      AND c.slug != ci.slug
  LOOP
    -- 1. Find or create cityCat (slug = city.slug under destRoot)
    SELECT id INTO v_citycat_id
    FROM categories
    WHERE slug = v_city_record.city_slug
      AND "parentId" = v_dest_root_id
      AND level = 'CITY'
    LIMIT 1;

    IF v_citycat_id IS NULL THEN
      INSERT INTO categories (id, name, slug, type, level, "parentId", "cityId", "createdAt")
      VALUES (
        'cmig' || substr(md5(random()::text || v_city_record.city_id), 1, 21),
        v_city_record.city_name,
        v_city_record.city_slug,
        'destination',
        'CITY',
        v_dest_root_id,
        v_city_record.city_id,
        NOW()
      )
      RETURNING id INTO v_citycat_id;
      RAISE NOTICE 'Created cityCat for %: %', v_city_record.city_name, v_citycat_id;
    END IF;

    -- 2. Re-parent legacy entries under this cityCat, set level = SUB
    UPDATE categories
    SET "parentId" = v_citycat_id, level = 'SUB'
    WHERE "parentId" = v_dest_root_id
      AND level = 'CITY'
      AND "cityId" = v_city_record.city_id
      AND slug != v_city_record.city_slug;

    RAISE NOTICE 'Re-parented legacies for city % (slug=%)', v_city_record.city_name, v_city_record.city_slug;
  END LOOP;
END $$;

COMMIT;
