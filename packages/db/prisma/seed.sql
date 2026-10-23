BEGIN;

-- 1. Organizations (Tenants)
INSERT INTO "Organization" ("id", "name", "slug", "createdAt", "updatedAt")
VALUES
  ('org_apex_logistics', 'Apex Express Logistics', 'apex-logistics', NOW(), NOW()),
  ('org_metro_swift', 'MetroSwift Delivery Co', 'metro-swift', NOW(), NOW())
ON CONFLICT ("id") DO UPDATE SET
  "name" = EXCLUDED."name",
  "slug" = EXCLUDED."slug",
  "updatedAt" = NOW();

-- 2. Demo Users (Business Owners, Dispatchers, Riders)
INSERT INTO "User" ("id", "email", "name", "phone", "createdAt", "updatedAt")
VALUES
  ('usr_apex_admin', 'alex.admin@apexlogistics.com', 'Alex Vance', '+44 7700 900100', NOW(), NOW()),
  ('usr_apex_dispatcher', 'sarah.dispatch@apexlogistics.com', 'Sarah Chen', '+44 7700 900101', NOW(), NOW()),
  ('usr_apex_rider_1', 'marcus.rider@apexlogistics.com', 'Marcus Thorne', '+44 7700 900142', NOW(), NOW()),
  ('usr_metro_admin', 'elena@metroswift.com', 'Elena Rostova', '+1 415 555 0100', NOW(), NOW()),
  ('usr_metro_dispatcher', 'david@metroswift.com', 'David Kim', '+1 415 555 0101', NOW(), NOW()),
  ('usr_metro_rider_1', 'leo.rider@metroswift.com', 'Leo Rivera', '+1 415 555 0192', NOW(), NOW())
ON CONFLICT ("id") DO UPDATE SET
  "email" = EXCLUDED."email",
  "name" = EXCLUDED."name",
  "phone" = EXCLUDED."phone",
  "updatedAt" = NOW();

-- 3. Organization Memberships
INSERT INTO "OrganizationMembership" ("id", "organizationId", "userId", "role", "isDefault", "status", "createdAt", "updatedAt")
VALUES
  ('mem_apex_admin', 'org_apex_logistics', 'usr_apex_admin', 'ORG_ADMIN', true, 'ACTIVE', NOW(), NOW()),
  ('mem_apex_dispatcher', 'org_apex_logistics', 'usr_apex_dispatcher', 'DISPATCHER', true, 'ACTIVE', NOW(), NOW()),
  ('mem_apex_rider_1', 'org_apex_logistics', 'usr_apex_rider_1', 'RIDER', true, 'ACTIVE', NOW(), NOW()),
  ('mem_metro_admin', 'org_metro_swift', 'usr_metro_admin', 'ORG_ADMIN', true, 'ACTIVE', NOW(), NOW()),
  ('mem_metro_dispatcher', 'org_metro_swift', 'usr_metro_dispatcher', 'DISPATCHER', true, 'ACTIVE', NOW(), NOW()),
  ('mem_metro_rider_1', 'org_metro_swift', 'usr_metro_rider_1', 'RIDER', true, 'ACTIVE', NOW(), NOW())
ON CONFLICT ("organizationId", "userId") DO UPDATE SET
  "role" = EXCLUDED."role",
  "isDefault" = EXCLUDED."isDefault",
  "status" = EXCLUDED."status",
  "updatedAt" = NOW();

-- 4. Rider Profiles
INSERT INTO "RiderProfile" (
  "id", "organizationId", "userId", "name", "phone", "email",
  "vehicleType", "capacityScore", "status",
  "currentLatitude", "currentLongitude", "batteryLevel", "lastActiveAt",
  "createdAt", "updatedAt"
)
VALUES
  ('rdr_apex_1', 'org_apex_logistics', 'usr_apex_rider_1', 'Marcus Thorne', '+44 7700 900142', 'marcus.rider@apexlogistics.com', 'MOTORCYCLE', 85, 'BUSY', 51.5074, -0.1278, 92, NOW(), NOW(), NOW()),
  ('rdr_apex_2', 'org_apex_logistics', NULL, 'Amina Al-Mansoor', '+44 7700 900213', 'amina.rdr@apexlogistics.com', 'BICYCLE', 60, 'AVAILABLE', 51.5134, -0.1012, 78, NOW(), NOW(), NOW()),
  ('rdr_apex_3', 'org_apex_logistics', NULL, 'Lucas Meyer', '+44 7700 900388', 'lucas.m@apexlogistics.com', 'VAN', 180, 'BUSY', 51.4921, -0.1542, 65, NOW(), NOW(), NOW()),
  ('rdr_apex_4', 'org_apex_logistics', NULL, 'Chloe Dupont', '+44 7700 900499', 'chloe.d@apexlogistics.com', 'CAR', 120, 'AVAILABLE', 51.5225, -0.0899, 88, NOW(), NOW(), NOW()),
  ('rdr_apex_5', 'org_apex_logistics', NULL, 'Tariq Bradley', '+44 7700 900677', 'tariq.b@apexlogistics.com', 'MOTORCYCLE', 90, 'ON_BREAK', 51.5010, -0.1410, 45, NOW(), NOW(), NOW()),
  ('rdr_apex_6', 'org_apex_logistics', NULL, 'Kenji Sato', '+44 7700 900822', NULL, 'MOTORCYCLE', 90, 'OFFLINE', 51.4850, -0.1180, 100, NOW(), NOW(), NOW()),
  ('rdr_metro_1', 'org_metro_swift', 'usr_metro_rider_1', 'Leo Rivera', '+1 415 555 0192', 'leo.rider@metroswift.com', 'VAN', 200, 'BUSY', 37.7749, -122.4194, 82, NOW(), NOW(), NOW())
ON CONFLICT ("id") DO UPDATE SET
  "name" = EXCLUDED."name",
  "phone" = EXCLUDED."phone",
  "email" = EXCLUDED."email",
  "vehicleType" = EXCLUDED."vehicleType",
  "capacityScore" = EXCLUDED."capacityScore",
  "status" = EXCLUDED."status",
  "currentLatitude" = EXCLUDED."currentLatitude",
  "currentLongitude" = EXCLUDED."currentLongitude",
  "batteryLevel" = EXCLUDED."batteryLevel",
  "lastActiveAt" = NOW(),
  "updatedAt" = NOW();

-- 5. Motor Parks
INSERT INTO "Park" ("id", "organizationId", "name", "city", "state", "address", "notes", "useCount", "createdAt", "updatedAt")
VALUES
  ('park_jibowu', 'org_apex_logistics', 'Jibowu Motor Park', 'Lagos', 'Lagos', 'Jibowu, Yaba, Lagos', 'ABC Motors office is block C. Mile 2 bound buses load from bay 4.', 34, NOW(), NOW()),
  ('park_utako', 'org_apex_logistics', 'Utako Motor Park', 'Abuja', 'FCT Abuja', 'Utako District, Abuja', 'Lagos arrivals park at the north wing. Waybill office closes 10pm.', 21, NOW(), NOW()),
  ('park_ojota', 'org_apex_logistics', 'Ojota Motor Park', 'Lagos', 'Lagos', 'Ojota, Ikorodu Road, Lagos', NULL, 12, NOW(), NOW())
ON CONFLICT ("id") DO UPDATE SET
  "name" = EXCLUDED."name",
  "city" = EXCLUDED."city",
  "state" = EXCLUDED."state",
  "address" = EXCLUDED."address",
  "notes" = EXCLUDED."notes",
  "useCount" = EXCLUDED."useCount",
  "updatedAt" = NOW();

-- 6. Orders
INSERT INTO "Order" (
  "id", "organizationId", "orderNumber", "source", "externalReference",
  "customerName", "customerPhone", "customerEmail",
  "pickupAddress", "pickupLat", "pickupLng",
  "deliveryAddress", "deliveryLat", "deliveryLng",
  "status", "priority", "packageSize",
  "estimatedDeliveryAt", "deliveredAt", "notes",
  "isInterstate", "originState", "destState",
  "createdAt", "updatedAt"
)
VALUES
  (
    'ord_apex_101', 'org_apex_logistics', 'ORD-9421', 'SHOPIFY', 'SHPF-88421',
    'Eleanor Sterling', '+44 7700 900551', 'eleanor.s@gmail.com',
    '124 Oxford Street, London W1D 1LT', 51.5152, -0.1337,
    '45 Kensington High St, London W8 5EB', 51.5015, -0.1925,
    'IN_TRANSIT', 'RUSH', 'SMALL',
    NOW() + INTERVAL '18 minutes', NULL, 'Express parcel. Require payment verification before parcel release.',
    false, NULL, NULL,
    NOW() - INTERVAL '42 minutes', NOW()
  ),
  (
    'ord_apex_102', 'org_apex_logistics', 'ORD-9422', 'WOOCOMMERCE', 'WOO-3011',
    'Dr. Vikram Patel', '+44 7700 900552', 'dr.patel@cityclinic.co.uk',
    '88 Commercial Street, Shoreditch, E1 6LY', 51.5204, -0.0743,
    '12 St. Mary Axe, City of London, EC3A 8EP', 51.5144, -0.0803,
    'ASSIGNED', 'STANDARD', 'MEDIUM',
    NOW() + INTERVAL '35 minutes', NULL, 'Fragile optics equipment.',
    false, NULL, NULL,
    NOW() - INTERVAL '55 minutes', NOW()
  ),
  (
    'ord_apex_103', 'org_apex_logistics', 'ORD-9423', 'WEBSITE_API', 'API-7721',
    'Harriet Green', '+44 7700 900553', NULL,
    'Unit 4, Docklands Hub, London E14 9GE', 51.5050, -0.0150,
    '78 Canary Wharf Way, London E14 5HP', 51.5045, -0.0195,
    'PENDING', 'EXPRESS', 'MEDIUM',
    NOW() + INTERVAL '45 minutes', NULL, 'Pending assignment. Requires bike or motorcycle for quick bypass.',
    false, NULL, NULL,
    NOW() - INTERVAL '12 minutes', NOW()
  ),
  (
    'ord_apex_104', 'org_apex_logistics', 'ORD-9424', 'SHOPIFY', 'SHPF-88429',
    'Oliver James', '+44 7700 900554', NULL,
    '15 Piccadilly, London W1J 0TR', 51.5085, -0.1380,
    '92 Fleet Street, London EC4Y 1DH', 51.5140, -0.1060,
    'FAILED', 'STANDARD', 'LARGE',
    NOW() - INTERVAL '15 minutes', NULL, 'Delayed due to vehicle breakdown on Westminster Bridge.',
    false, NULL, NULL,
    NOW() - INTERVAL '90 minutes', NOW()
  ),
  (
    'ord_apex_105', 'org_apex_logistics', 'ORD-9425', 'MANUAL', NULL,
    'Sophie Martin', '+44 7700 900555', NULL,
    '22 Regent Street, London SW1Y 4PH', 51.5090, -0.1340,
    '30 Victoria Street, London SW1H 0TL', 51.4980, -0.1330,
    'DELIVERED', 'STANDARD', 'SMALL',
    NOW() - INTERVAL '30 minutes', NOW() - INTERVAL '28 minutes', 'Successfully delivered. Signed by recipient.',
    false, NULL, NULL,
    NOW() - INTERVAL '110 minutes', NOW()
  ),
  (
    'ord_apex_201', 'org_apex_logistics', 'ORD-9501', 'WEBSITE_API', NULL,
    'Ngozi Okafor', '+234 803 555 0142', NULL,
    '14 Admiralty Way, Lekki Phase 1, Lagos', 6.4281, 3.4219,
    'Plot 22, Garki Area 11, Abuja', 9.0360, 7.4890,
    'IN_TRANSIT', 'EXPRESS', 'MEDIUM',
    NOW() + INTERVAL '10 hours', NULL, 'Interstate: Lagos -> Abuja via Jibowu park.',
    true, 'Lagos', 'FCT Abuja',
    NOW() - INTERVAL '320 minutes', NOW()
  )
ON CONFLICT ("id") DO UPDATE SET
  "status" = EXCLUDED."status",
  "priority" = EXCLUDED."priority",
  "notes" = EXCLUDED."notes",
  "updatedAt" = NOW();

-- 7. Delivery Assignments
INSERT INTO "DeliveryAssignment" (
  "id", "organizationId", "orderId", "riderProfileId", "assignedById", "status", "sequenceIndex", "createdAt", "updatedAt"
)
VALUES
  ('asg_ord_apex_101', 'org_apex_logistics', 'ord_apex_101', 'rdr_apex_1', 'usr_apex_dispatcher', 'EN_ROUTE_DROPOFF', 0, NOW(), NOW()),
  ('asg_ord_apex_102', 'org_apex_logistics', 'ord_apex_102', 'rdr_apex_3', 'usr_apex_dispatcher', 'ACCEPTED', 0, NOW(), NOW()),
  ('asg_ord_apex_104', 'org_apex_logistics', 'ord_apex_104', 'rdr_apex_1', 'usr_apex_dispatcher', 'PICKED_UP', 0, NOW(), NOW()),
  ('asg_ord_apex_105', 'org_apex_logistics', 'ord_apex_105', 'rdr_apex_2', 'usr_apex_dispatcher', 'COMPLETED', 0, NOW(), NOW()),
  ('asg_ord_apex_201', 'org_apex_logistics', 'ord_apex_201', 'rdr_apex_1', 'usr_apex_dispatcher', 'COMPLETED', 0, NOW(), NOW())
ON CONFLICT ("id") DO UPDATE SET
  "riderProfileId" = EXCLUDED."riderProfileId",
  "status" = EXCLUDED."status",
  "updatedAt" = NOW();

-- 8. Interstate Legs
INSERT INTO "InterstateLeg" (
  "id", "organizationId", "orderId", "sequenceIndex", "type", "status",
  "originPark", "destPark", "transportCompany", "vehiclePlate",
  "waybillNumber", "waybillPhotoUrl", "sealNumber", "fareAmountNgn",
  "droppedAt", "departedAt", "expectedArrivalAt", "riderProfileId", "photoUrls",
  "createdAt", "updatedAt"
)
VALUES
  (
    'leg_9501_0', 'org_apex_logistics', 'ord_apex_201', 0, 'FIRST_MILE', 'COMPLETED',
    'Jibowu Motor Park', NULL, NULL, NULL,
    NULL, NULL, NULL, NULL,
    NULL, NULL, NULL, 'rdr_apex_1', ARRAY[]::TEXT[],
    NOW() - INTERVAL '300 minutes', NOW() - INTERVAL '240 minutes'
  ),
  (
    'leg_9501_1', 'org_apex_logistics', 'ord_apex_201', 1, 'LINEHAUL_BUS', 'ACTIVE',
    'Jibowu Motor Park', 'Utako Motor Park', 'ABC Motors', 'LAG-482-XQ',
    'ABC-88412', 'waybill_abc_88412.jpg', 'SEAL-2201', 8000,
    NOW() - INTERVAL '240 minutes', NOW() - INTERVAL '200 minutes', NOW() + INTERVAL '520 minutes', NULL,
    ARRAY['parcel_sealed_9501.jpg', 'bus_loaded_9501.jpg'],
    NOW() - INTERVAL '240 minutes', NOW() - INTERVAL '200 minutes'
  ),
  (
    'leg_9501_2', 'org_apex_logistics', 'ord_apex_201', 2, 'LAST_MILE', 'PENDING',
    'Utako Motor Park', NULL, NULL, NULL,
    NULL, NULL, NULL, NULL,
    NULL, NULL, NULL, NULL, ARRAY[]::TEXT[],
    NOW() - INTERVAL '240 minutes', NOW() - INTERVAL '240 minutes'
  )
ON CONFLICT ("id") DO UPDATE SET
  "status" = EXCLUDED."status",
  "updatedAt" = NOW();

-- 9. Custody Events
INSERT INTO "CustodyEvent" (
  "id", "organizationId", "orderId", "legId", "eventType", "actorType", "actorId", "photoUrls", "note", "createdAt"
)
VALUES
  ('cev_9501_1', 'org_apex_logistics', 'ord_apex_201', NULL, 'ORDER_CREATED', 'DISPATCHER', 'usr_apex_dispatcher', ARRAY[]::TEXT[], 'Interstate order Lagos -> FCT Abuja created.', NOW() - INTERVAL '320 minutes'),
  ('cev_9501_2', 'org_apex_logistics', 'ord_apex_201', NULL, 'INTERSTATE_PLANNED', 'DISPATCHER', 'usr_apex_dispatcher', ARRAY[]::TEXT[], '3 legs planned: first-mile, Jibowu -> Utako linehaul, last-mile.', NOW() - INTERVAL '310 minutes'),
  ('cev_9501_3', 'org_apex_logistics', 'ord_apex_201', 'leg_9501_1', 'PARK_DROPOFF', 'RIDER', 'rdr_apex_1', ARRAY['parcel_sealed_9501.jpg', 'waybill_abc_88412.jpg'], 'Handed to ABC Motors at Jibowu. Waybill ABC-88412. Fare ₦8,000.', NOW() - INTERVAL '240 minutes'),
  ('cev_9501_4', 'org_apex_logistics', 'ord_apex_201', 'leg_9501_1', 'DEPARTED', 'RIDER', 'rdr_apex_1', ARRAY['bus_loaded_9501.jpg'], 'Bus LAG-482-XQ departed Jibowu. Expected Utako tonight.', NOW() - INTERVAL '200 minutes')
ON CONFLICT ("id") DO UPDATE SET
  "note" = EXCLUDED."note";

-- 10. Incidents & AI Recommendations
INSERT INTO "Incident" (
  "id", "organizationId", "orderId", "riderProfileId",
  "title", "description", "severity", "status", "category",
  "aiDetected", "aiConfidence", "createdAt", "updatedAt"
)
VALUES
  (
    'inc_apex_1', 'org_apex_logistics', 'ord_apex_104', 'rdr_apex_1',
    'Motorcycle Mechanical Breakdown',
    'Rider reported engine stall and flat rear tire near Westminster Bridge. Order ORD-9424 cannot proceed without reassignment.',
    'CRITICAL', 'OPEN', 'VEHICLE_BREAKDOWN',
    true, 0.96, NOW() - INTERVAL '20 minutes', NOW()
  )
ON CONFLICT ("id") DO UPDATE SET
  "status" = EXCLUDED."status",
  "updatedAt" = NOW();

INSERT INTO "Recommendation" (
  "id", "organizationId", "incidentId", "orderId",
  "title", "explanation", "actionType", "proposedPayload",
  "confidence", "status", "createdAt", "updatedAt"
)
VALUES
  (
    'rec_apex_1', 'org_apex_logistics', 'inc_apex_1', 'ord_apex_104',
    'Immediate Reassignment: Transfer ORD-9424 to Chloe Dupont',
    'Rider Chloe Dupont (Car) is currently AVAILABLE and positioned 1.1 km away at Piccadilly. Reassignment resolves delay within 8 minutes and preserves order SLA.',
    'REASSIGN_RIDER',
    '{"targetRiderId":"rdr_apex_4","targetRiderName":"Chloe Dupont","estimatedTimeSavedMinutes":24}'::JSONB,
    0.94, 'PENDING', NOW() - INTERVAL '18 minutes', NOW()
  )
ON CONFLICT ("id") DO UPDATE SET
  "status" = EXCLUDED."status",
  "updatedAt" = NOW();

-- 11. Integrations & API Credentials
INSERT INTO "Integration" (
  "id", "organizationId", "provider", "name", "status", "lastSyncAt", "lastSyncStatus", "createdAt", "updatedAt"
)
VALUES
  ('int_apex_shopify', 'org_apex_logistics', 'SHOPIFY', 'Shopify Storefront Webhook', 'ACTIVE', NOW(), 'SUCCESS (200 OK)', NOW(), NOW())
ON CONFLICT ("id") DO UPDATE SET
  "status" = EXCLUDED."status",
  "lastSyncAt" = NOW(),
  "updatedAt" = NOW();

INSERT INTO "ApiCredential" (
  "id", "organizationId", "integrationId", "name", "keyPrefix", "secretHash", "scopes",
  "lastUsedAt", "expiresAt", "isRevoked", "createdAt", "updatedAt"
)
VALUES
  (
    'cred_apex_1', 'org_apex_logistics', 'int_apex_shopify',
    'Production Dispatcher Bot', 'sage_live_948a', 'demo_sha256_sage_live_948a',
    ARRAY['orders:read', 'orders:write', 'riders:read', 'incidents:read', 'incidents:write', 'recommendations:read'],
    NOW(), NOW() + INTERVAL '180 days', false, NOW(), NOW()
  )
ON CONFLICT ("id") DO UPDATE SET
  "keyPrefix" = EXCLUDED."keyPrefix",
  "isRevoked" = EXCLUDED."isRevoked",
  "updatedAt" = NOW();

COMMIT;
