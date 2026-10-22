import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  InterstatePlanSchema,
  ParkDropoffSchema,
  ParkRetrievedSchema,
  RetrievalAssignSchema,
} from "./index.ts";

const validDropoff = {
  originPark: "Jibowu Motor Park",
  transportCompany: "ABC Motors",
  vehiclePlate: "LAG-482-XQ",
  waybillNumber: "ABC-88412",
  waybillPhotoUrl: "waybill_abc_88412.jpg",
  photoUrls: ["parcel_sealed.jpg"],
};

describe("interstate park-handoff schemas", () => {
  it("accepts a complete park drop-off without any driver details", () => {
    const parsed = ParkDropoffSchema.safeParse(validDropoff);
    assert.equal(parsed.success, true);
  });

  it("accepts bus description when the plate is unreadable", () => {
    const { vehiclePlate: _plate, ...rest } = validDropoff;
    const parsed = ParkDropoffSchema.safeParse({
      ...rest,
      vehicleDescription: "White 14-seater Hiace",
    });
    assert.equal(parsed.success, true);
  });

  it("rejects drop-off with neither plate nor description", () => {
    const { vehiclePlate: _plate, ...rest } = validDropoff;
    const parsed = ParkDropoffSchema.safeParse(rest);
    assert.equal(parsed.success, false);
  });

  it("rejects drop-off missing waybill number or photos", () => {
    const { waybillNumber: _wb, ...noWaybill } = validDropoff;
    assert.equal(ParkDropoffSchema.safeParse(noWaybill).success, false);

    const { waybillPhotoUrl: _photo, ...noWaybillPhoto } = validDropoff;
    assert.equal(ParkDropoffSchema.safeParse(noWaybillPhoto).success, false);

    assert.equal(
      ParkDropoffSchema.safeParse({ ...validDropoff, photoUrls: [] }).success,
      false,
    );
  });

  it("requires a retrieval photo and seal check", () => {
    assert.equal(
      ParkRetrievedSchema.safeParse({ photoUrls: [], sealCheck: "INTACT" }).success,
      false,
    );
    assert.equal(
      ParkRetrievedSchema.safeParse({ photoUrls: ["retrieved.jpg"], sealCheck: "BROKEN" })
        .success,
      true,
    );
  });

  it("requires origin and destination states to plan", () => {
    assert.equal(
      InterstatePlanSchema.safeParse({ originState: "Lagos" }).success,
      false,
    );
    assert.equal(
      InterstatePlanSchema.safeParse({ originState: "Lagos", destState: "FCT Abuja" })
        .success,
      true,
    );
  });

  it("accepts rider or partner retrieval assignment", () => {
    assert.equal(RetrievalAssignSchema.safeParse({}).success, true);
    assert.equal(
      RetrievalAssignSchema.safeParse({ partnerName: "Speedaf Abuja" }).success,
      true,
    );
  });
});
