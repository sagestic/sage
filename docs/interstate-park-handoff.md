# Interstate Park Handoff — Spec (no driver cooperation required)

## 0. Constraint

Bus / cab drivers at the park are unaffiliated. The design must work when the driver:

- gives no phone number,
- receives no SMS / code,
- installs nothing,
- cannot be called back.

All app actions are performed by affiliated actors only: origin rider, dispatcher, destination rider / partner depot staff. The driver is a free-text observation, never a verification step.

## 1. Current model (what exists)

Prisma today (`packages/db/prisma/schema.prisma`):

- `Order`: single pickup address → single delivery address, `status: PENDING | ASSIGNED | IN_TRANSIT | DELIVERED | FAILED | CANCELLED`.
- `DeliveryAssignment`: one rider ↔ one order, `status: OFFERED … COMPLETED`.
- Web `sage-repo.ts` mirrors this with `assignedRiderId` + `recordHandover()` for rider-to-rider relay.
- Tracking page (`apps/web/src/app/track/[id]`) maps those 4 statuses to a linear progress bar.

This works for intra-city. It has no concept of legs, parks, third-party linehaul, or custody gaps.

## 2. Proposed model (additive, no breaking change)

Keep `Order.status` as the customer-facing coarse state. Add legs underneath for interstate detail.

### 2.1 New fields on `Order`

```prisma
isInterstate      Boolean @default(false)
originState       String?   // e.g. "Lagos"
destState         String?   // e.g. "FCT Abuja"
```

If `isInterstate = false`, everything behaves as today.

### 2.2 New model `InterstateLeg`

One order has 2–3 legs in sequence:

| seq | type | owner | meaning |
|-----|------|-------|---------|
| 0 | `FIRST_MILE` | origin rider | pickup → origin park |
| 1 | `LINEHAUL_BUS` | nobody (gap) | origin park → dest park via public bus/cab |
| 2 | `LAST_MILE` | dest rider | dest park → recipient, or dest park → partner depot → recipient |

```prisma
enum LegType { FIRST_MILE  LINEHAUL_BUS  LAST_MILE  PARTNER_HANDOFF }
enum LegStatus { PENDING  ACTIVE  COMPLETED  OVERDUE  FAILED }

model InterstateLeg {
  id              String    @id @default(cuid())
  organizationId  String
  orderId         String
  sequenceIndex   Int       // 0, 1, 2
  type            LegType
  status          LegStatus @default(PENDING)

  // Park / carrier observations (all nullable except originPark on LINEHAUL_BUS)
  originPark      String?
  destPark        String?
  transportCompany String?  // "ABC Motors", "God Is Good", free text
  vehiclePlate    String?
  vehicleDescription String? // "white 14-seater Hiace" when plate unreadable
  driverPhone     String?   // OPTIONAL, volunteered only. Never required.
  driverNote      String?   // "driver in red cap" — free text

  // Paperwork / money trail
  waybillNumber   String?
  waybillPhotoUrl String?
  sealNumber      String?   // tamper-bag serial
  fareAmountNgn   Int?
  fareReceiptPhotoUrl String?

  // Times
  droppedAt       DateTime? // origin rider handed to park
  departedAt      DateTime? // bus left (observed or told by park staff)
  expectedArrivalAt DateTime?
  retrievedAt     DateTime? // dest rider collected at dest park

  // Assignment (legs 0 and 2 only)
  riderProfileId  String?

  // Photos (parcel sealed, loaded, retrieved)
  photoUrls       String[]

  notes           String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([organizationId])
  @@index([orderId])
}
```

Key rule: `LINEHAUL_BUS` has **no assignee, no OTP, no required driver phone**. Its completion proof is the destination rider's retrieval, not the driver's action.

### 2.3 New model `CustodyEvent` (append-only timeline)

```prisma
model CustodyEvent {
  id             String   @id @default(cuid())
  organizationId String
  orderId        String
  legId          String?
  eventType      String   // PARK_DROPOFF | DEPARTED | RETRIEVAL_ASSIGNED | PARK_RETRIEVED | SEAL_BROKEN | OVERDUE_FLAGGED …
  actorType      String   // RIDER | DISPATCHER | SYSTEM | PARTNER
  actorId        String?
  latitude       Float?
  longitude      Float?
  photoUrls      String[]
  note           String?
  createdAt      DateTime @default(now())

  @@index([organizationId])
  @@index([orderId])
}
```

The customer timeline renders from these events, not from `Order.status` alone when `isInterstate = true`.

### 2.4 Park directory (lightweight, learned over time)

```prisma
model Park {
  id             String @id @default(cuid())
  organizationId String
  name           String // "Jibowu Motor Park"
  city           String // "Lagos"
  state          String
  address        String?
  notes          String? // "ABC office is block C, ask for Mama Nkechi"
  useCount       Int    @default(0)

  @@unique([organizationId, name, city])
}
```

Rider picks from directory or types free text; free text auto-creates a directory entry. No onboarding of park staff required.

## 3. Operational flow

### 3.1 Dispatcher plans interstate (once per order)

1. Marks order `isInterstate = true`, sets `originState` / `destState`.
2. System creates legs 0–2 (or 0,1,2+partner).
3. Assigns leg 0 to origin rider. Leg 2 stays `PENDING` until linehaul departs (avoids premature assignment).

### 3.2 Origin rider: park drop-off checklist (rider PWA)

Leg 0 completion form. Required vs optional is the core of this spec:

**Required (blocks submission):**

- [ ] Origin park (directory pick or free text)
- [ ] Transport company (free text)
- [ ] Bus identifier: plate number OR description + bus photo (at least one photo mandatory)
- [ ] Waybill / ticket number + photo of stub
- [ ] Parcel sealed photo (seal number visible or entered)
- [ ] Fare paid (₦, for accounting; receipt photo if given)

**Optional (never blocks):**

- Driver phone / name / description
- Loader / agent name
- Departure time if known

On submit: leg 0 → `COMPLETED`, leg 1 → `ACTIVE`, `CustodyEvent(PARK_DROPOFF)` + `CustodyEvent(DEPARTED)` written, `Order.status` stays `IN_TRANSIT`. ETA auto-set from corridor table (§5).

### 3.3 Destination rider: park retrieval task

When leg 1 becomes `ACTIVE`, dispatcher (or auto-dispatch) assigns leg 2 to a destination-city rider. The retrieval task shows:

- Parcel photos + description + seal number (what to look for)
- Origin park / company / waybill number / sender name (what to tell the park office)
- Dest park name + address + any directory notes
- SOP hint: "Go to [company] office at [park]. Show waybill photo. Collect by sender name + waybill number. Photograph parcel before leaving."
- One-tap call to origin rider / dispatcher for help

**To complete retrieval (required):**

- [ ] Photo of retrieved parcel at park
- [ ] Seal check: `INTACT | BROKEN | NO_SEAL`
- [ ] Auto timestamp + GPS

On submit: leg 1 → `COMPLETED`, leg 2 → `ACTIVE`, `CustodyEvent(PARK_RETRIEVED)` written. If seal is `BROKEN`, also write `CustodyEvent(SEAL_BROKEN)` and auto-open an `Incident` (severity HIGH) but do NOT block last-mile — rider proceeds and notes it.

### 3.4 Partner-depot variant

If dest city has no rider but a partner depot: leg 2 type = `PARTNER_HANDOFF`, assigned to partner, not rider. Partner confirms receipt via tracking-code magic link (affiliated → codes OK here). Customer then either picks up with a pickup code or partner runs last-mile. Same entry/exit proof pattern.

## 4. Customer tracking copy (honest, no fake GPS)

When `isInterstate = true`, replace the 4-step bar with a 5-step timeline driven by `CustodyEvent`:

1. `Received` — order created
2. `At origin park` — "Handed to ABC Motors, Jibowu. Waybill #123."
3. `On the road` — "Jibowu → Abuja. Departed ~2pm. Our Abuja team retrieves on arrival. Expected tonight." (no map pin, no countdown precision beyond the ETA window)
4. `With destination courier` — "Retrieved at Utako park 8:40pm. Seal intact."
5. `Delivered`

Remove the "LIVE GPS" badge on interstate linehaul legs. Showing a live dot you don't have destroys trust when it freezes for 10 hours.

## 5. Corridor ETAs + overdue rules

Seed table (dispatcher-editable), used only to set `expectedArrivalAt`:

| corridor | road hours | buffer | example |
|----------|-----------|--------|---------|
| Lagos → Abuja | 12 | +4 | depart 2pm → expect by 6am |
| Lagos → PH | 10 | +4 | |
| Abuja → Kano | 7 | +3 | |

Overdue job (cron, e.g. every 30 min): any `LINEHAUL_BUS` leg `ACTIVE` past `expectedArrivalAt + buffer` → `OVERDUE`, write `CustodyEvent(OVERDUE_FLAGGED)`, notify dispatcher, suggest SOP: call origin park office with waybill number → call dest park office → open `Incident` if unresolved in 12h.

## 6. API surface (backend)

```
POST /orders/:id/interstate/plan
  { originState, destState, originPark?, destPark?, destRiderId? }
  → creates legs 0–2

POST /legs/:id/park-dropoff        (origin rider)
  { originPark, transportCompany, vehiclePlate?, vehicleDescription?,
    waybillNumber, sealNumber?, fareAmountNgn?, photoUrls[3+],
    driverPhone?, driverNote?, departedAt? }

POST /legs/:id/assign-retrieval    (dispatcher)
  { riderProfileId }  // or { partnerId }

POST /legs/:id/park-retrieved      (dest rider)
  { photoUrls[1+], sealCheck: INTACT|BROKEN|NO_SEAL, note? }

GET  /orders/:id/timeline          (tracking page)
  → ordered CustodyEvents + leg states
```

Validation: `park-dropoff` rejects when any required checklist item is missing; `driverPhone` is never validated as required. `park-retrieved` rejects without photo.

## 7. Site-schema additions (zod)

- `InterstatePlanSchema`, `ParkDropoffSchema` (required/optional split above), `ParkRetrievedSchema`, `LegTypeSchema`, `LegStatusSchema`, `SealCheckSchema`.
- Extend `CreateOrderSchema` / `IngestOrderSchema` with optional `isInterstate`, `originState`, `destState` so Shopify/API orders can arrive pre-flagged.

## 8. Migration / rollout

1. Prisma migration adds 3 models + 3 order columns; existing orders default `isInterstate = false`, unaffected.
2. `sage-repo.ts` gains in-memory `legs` / `custodyEvents` + the four methods above (keeps demo UI working before backend exists).
3. Rider PWA: leg-0 checklist form + leg-2 retrieval task view.
4. Tracking page: interstate timeline branch.
5. Dispatcher board: interstate filter + overdue queue.
6. Corridor ETA seed + overdue cron.

## 9. Out of scope (deliberate)

- No driver app, driver SMS, or driver OTP.
- No live GPS on linehaul (no device on the bus).
- No automatic park-office integration — phone calls remain manual, logged as notes.
- High-value GPS trackers (AirTag-style) are a future add-on, not part of this spec.

## 10. Acceptance checks

- [ ] Origin rider can complete drop-off with zero driver phone/cooperation.
- [ ] Drop-off is rejected when waybill number or parcel photo is missing.
- [ ] Destination rider sees everything needed to collect without calling anyone (but can call).
- [ ] Retrieval is rejected without photo; broken seal opens incident without blocking delivery.
- [ ] Tracking page never shows fake live position during linehaul.
- [ ] Overdue leg flags automatically and notifies dispatcher.
- [ ] All existing intra-city orders and tests pass unchanged.
