#!/bin/bash
# Mi Casa — Upload Photos Script
# Run this from the folder containing all your photos
# Usage: bash upload-photos.sh

ENDPOINT="https://dhwppkevuquwtavvqaan.supabase.co/functions/v1/upload-media"

upload() {
  local FILE="$1"
  local LISTING_ID="$2"
  local CAPTION="$3"
  local ORDER="$4"
  echo "Uploading: $(basename $FILE) → $CAPTION"
  curl -s -X POST "$ENDPOINT" \
    -F "file=@${FILE}" \
    -F "listing_id=${LISTING_ID}" \
    -F "caption=${CAPTION}" \
    -F "display_order=${ORDER}" | python3 -c "import sys,json; d=json.load(sys.stdin); print('  ✓ ' + d.get('url','') if d.get('success') else '  ✗ ' + d.get('error',''))"
}

# ─── NASEEM #21 ──────────────────────────────────────────────────────────────
NASEEM="646d1195-92f3-443f-b9f7-571be6064572"
upload "1775722375595_PHOTO-2026-04-09-09-59-59.jpg" "$NASEEM" "Villa 021 - App view closeup" 1
upload "1775722375596_PHOTO-2026-04-09-09-59-59.jpg" "$NASEEM" "Villa 021 - Development overview" 2
upload "1775722375597_PHOTO-2026-04-09-09-59-59.jpg" "$NASEEM" "Hudayriyat Naseem site plan" 3

# ─── AVANI PALM #3605 ────────────────────────────────────────────────────────
AVANI="95896134-b177-4ac4-ae8b-4a329fe1521e"
upload "1775722634008_PHOTO-2026-04-09-10-02-01.jpg" "$AVANI" "Title deed" 1
upload "1775722634008_PHOTO-2026-04-09-10-02-02.jpg" "$AVANI" "Entrance hallway" 2
upload "1775722634009_PHOTO-2026-04-09-10-02-03.jpg" "$AVANI" "Gallery corridor" 3
upload "1775722634009_PHOTO-2026-04-09-10-02-04.jpg" "$AVANI" "Laundry room" 4
upload "1775722634009_PHOTO-2026-04-09-10-02-05.jpg" "$AVANI" "Built-in wardrobes" 5
upload "1775722634009_PHOTO-2026-04-09-10-02-06.jpg" "$AVANI" "Bathroom ensuite" 6
upload "1775722634010_PHOTO-2026-04-09-10-02-06.jpg" "$AVANI" "Master bathroom double vanity" 7
# Add remaining Avani photos here with the same pattern
# Files: 10-02-03 through 10-02-06 variants

echo ""
echo "Done. Refresh the CRM to see uploaded photos."
