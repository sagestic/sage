#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
: "${SAGE_DEV_API_KEY:?Set SAGE_DEV_API_KEY from apps/web/.env.local before running}"
base="${SAGE_BASE_URL:-http://localhost:3000}"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT
request() {
  local name="$1" key="$2" description="$3"
  curl --silent --show-error --max-time 20 -o "$tmp/$name.json" -w '%{http_code}' \
    -X POST "$base/api/v1/ai/recovery" \
    -H 'Content-Type: application/json' -H "Authorization: Bearer $key" \
    --data "$(python3 -c 'import json,sys; print(json.dumps({"description":sys.argv[1]}))' "$description")"
}
fixture="Rider rdr_apex_1 has broken down and cannot complete assigned deliveries."
test "$(request unauthorized invalid-test-key "$fixture")" = "401" || { echo "FAIL invalid credential"; exit 1; }
test "$(request malformed "$SAGE_DEV_API_KEY" "Please investigate")" = "422" || { echo "FAIL ambiguous mock input"; exit 1; }
code="$(request recovery "$SAGE_DEV_API_KEY" "$fixture")"
test "$code" = "200" || { echo "FAIL recovery HTTP $code"; cat "$tmp/recovery.json"; exit 1; }
python3 - "$tmp/recovery.json" <<'PY'
import json,sys
p=json.load(open(sys.argv[1]))
assert p["success"] is True and p["simulation"] is True, p
assert p["applied"] is False and p["requiresDispatcherApproval"] is True, p
assert p["interpretation"]["incident"]["vehicleId"] == "rdr_apex_1", p
assert any(o["id"] == "ord_apex_101" for o in p["affectedOrders"]), p
assert "recommendation" in p and p["recommendation"], p
print("PASS: auth rejection, ambiguous-input rejection, simulated incident, order lookup, OR-Tools recommendation, approval gate")
print("NOTE: This verifies a preview only; no real Gemini call or physical handover was tested.")
PY
