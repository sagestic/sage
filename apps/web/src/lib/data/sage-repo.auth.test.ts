import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import test from "node:test";
import { sageRepo } from "./sage-repo";

const orgId = "org_apex_logistics";

test("generated credential accepts only the complete secret", () => {
  const { credential, rawSecret } = sageRepo.createApiCredential(orgId, "test", ["orders:write"]);
  assert.equal(sageRepo.authenticateApiKey(rawSecret).valid, true);
  assert.equal(sageRepo.authenticateApiKey(credential.keyPrefix).valid, false);
  assert.equal(sageRepo.authenticateApiKey(rawSecret + "tampered").valid, false);
  assert.equal(credential.secretHash.includes(rawSecret), false);
});

test("unknown and revoked credentials are rejected", () => {
  assert.equal(sageRepo.authenticateApiKey("invalid-test-key").valid, false);
  const { credential, rawSecret } = sageRepo.createApiCredential(orgId, "revoke-test", ["orders:read"]);
  credential.isRevoked = true;
  assert.equal(sageRepo.authenticateApiKey(rawSecret).valid, false);
});

test("expired credentials are rejected", () => {
  const { credential, rawSecret } = sageRepo.createApiCredential(orgId, "expire-test", ["orders:read"]);
  credential.expiresAt = new Date(Date.now() - 1000).toISOString();
  assert.equal(sageRepo.authenticateApiKey(rawSecret).valid, false);
});

test("development credential requires exact match and does not work in production", () => {
  const originalKey = process.env.SAGE_DEV_API_KEY;
  const originalEnv = process.env.NODE_ENV;
  const key = randomBytes(32).toString("hex");
  try {
    process.env.NODE_ENV = "development";
    process.env.SAGE_DEV_API_KEY = key;
    const result = sageRepo.authenticateApiKey(key);
    assert.equal(result.valid, true);
    assert.equal(result.organizationId, orgId);
    assert.deepEqual(result.scopes, ["orders:write"]);
    assert.equal(sageRepo.authenticateApiKey(key + "x").valid, false);
    process.env.NODE_ENV = "production";
    assert.equal(sageRepo.authenticateApiKey(key).valid, false);
  } finally {
    if (originalKey === undefined) delete process.env.SAGE_DEV_API_KEY;
    else process.env.SAGE_DEV_API_KEY = originalKey;
    if (originalEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = originalEnv;
  }
});
