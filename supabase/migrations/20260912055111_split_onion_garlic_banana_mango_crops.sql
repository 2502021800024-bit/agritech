/*
# Split combined crop entries in cold_storages

1. Changes
- cs2: replace 'fruits' with 'banana','mango' in supported_crops
- cs1, cs3: add 'garlic' alongside existing 'onion' in supported_crops
- This matches the frontend where Onion/Garlic and Banana/Mango are now separate crop options.

2. Notes
- Non-destructive: only adds/updates array elements, no data loss.
*/

UPDATE cold_storages
SET supported_crops = ARRAY(
  SELECT DISTINCT unnest(
    CASE
      WHEN id = 'cs2' THEN array_replace(supported_crops, 'fruits', 'banana') || ARRAY['mango']
      WHEN id IN ('cs1','cs3') THEN supported_crops || ARRAY['garlic']
      ELSE supported_crops
    END
  )
)
WHERE id IN ('cs1','cs2','cs3');
