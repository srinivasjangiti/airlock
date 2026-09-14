import { describe, it, expect } from "vitest";
import {
  generateApiKey,
  hashApiKey,
  signJitToken,
  verifyJitToken,
  computeAuditHash,
  verifyAuditChain,
  GENESIS_HASH,
} from "@/lib/crypto";

describe("Cryptographic Security Primitives", () => {
  describe("API Key Cryptography", () => {
    it("should generate a secure high-entropy API key and accurate SHA-256 hash", () => {
      const { rawKey, keyHash, prefix } = generateApiKey("live");

      expect(rawKey).toMatch(/^ak_live_[A-Za-z0-9_-]{32,}$/);
      expect(prefix).toBe(rawKey.slice(0, 14));
      expect(keyHash).toHaveLength(64); // SHA-256 hex string

      // Verifying deterministic hashing
      expect(hashApiKey(rawKey)).toBe(keyHash);
    });

    it("should produce distinct hashes for different keys", () => {
      const key1 = generateApiKey("live");
      const key2 = generateApiKey("live");

      expect(key1.rawKey).not.toBe(key2.rawKey);
      expect(key1.keyHash).not.toBe(key2.keyHash);
    });
  });

  describe("JIT Access Tokens (HMAC-SHA256 Signed JWT)", () => {
    it("should sign and verify a valid JIT ephemeral token", () => {
      const nowSeconds = Math.floor(Date.now() / 1000);
      const token = signJitToken({
        gid: "grant-test-123",
        sub: "user-456",
        org: "org-789",
        tgt: "aws",
        scp: "admin",
        exp: nowSeconds + 3600, // 1 hour validity
      });

      expect(typeof token).toBe("string");
      expect(token.split(".")).toHaveLength(3);

      const verification = verifyJitToken(token);
      expect(verification.valid).toBe(true);
      expect(verification.payload?.gid).toBe("grant-test-123");
      expect(verification.payload?.tgt).toBe("aws");
      expect(verification.payload?.scp).toBe("admin");
    });

    it("should reject tampered JIT tokens with modified signatures", () => {
      const nowSeconds = Math.floor(Date.now() / 1000);
      const token = signJitToken({
        gid: "grant-test-tamper",
        sub: "user-123",
        org: "org-123",
        tgt: "github",
        scp: "repo",
        exp: nowSeconds + 3600,
      });

      const parts = token.split(".");
      // Tamper with the signature
      const tamperedToken = `${parts[0]}.${parts[1]}.bad_signature_tampered_12345`;

      const verification = verifyJitToken(tamperedToken);
      expect(verification.valid).toBe(false);
      expect(verification.error).toContain("signature verification failed");
    });

    it("should reject expired JIT tokens", () => {
      const pastSeconds = Math.floor(Date.now() / 1000) - 100; // Expired 100s ago
      const expiredToken = signJitToken({
        gid: "grant-expired",
        sub: "user-expired",
        org: "org-1",
        tgt: "slack",
        scp: "channels:write",
        exp: pastSeconds,
      });

      const verification = verifyJitToken(expiredToken);
      expect(verification.valid).toBe(false);
      expect(verification.error).toBe("Token expired.");
    });
  });

  describe("Merkle-Chained Tamper-Evident Audit Ledger", () => {
    it("should mathematically verify an intact cryptographic audit chain", () => {
      const block1Ts = "2026-09-01T00:00:00.000Z";
      const block1Hash = computeAuditHash({
        previousHash: GENESIS_HASH,
        sequence: 1,
        timestamp: block1Ts,
        actor: "system",
        action: "ledger.genesis",
        resource: "airlock:merkle-chain",
      });

      const block2Ts = "2026-09-01T00:01:00.000Z";
      const block2Hash = computeAuditHash({
        previousHash: block1Hash,
        sequence: 2,
        timestamp: block2Ts,
        actor: "admin@acme.io",
        action: "org.created",
        resource: "org:acme",
      });

      const block3Ts = "2026-09-01T00:02:00.000Z";
      const block3Hash = computeAuditHash({
        previousHash: block2Hash,
        sequence: 3,
        timestamp: block3Ts,
        actor: "admin@acme.io",
        action: "jit.grant.issued",
        resource: "aws:production",
      });

      const chain = [
        {
          sequence: 1,
          previousHash: GENESIS_HASH,
          currentHash: block1Hash,
          timestamp: block1Ts,
          actor: "system",
          action: "ledger.genesis",
          resource: "airlock:merkle-chain",
        },
        {
          sequence: 2,
          previousHash: block1Hash,
          currentHash: block2Hash,
          timestamp: block2Ts,
          actor: "admin@acme.io",
          action: "org.created",
          resource: "org:acme",
        },
        {
          sequence: 3,
          previousHash: block2Hash,
          currentHash: block3Hash,
          timestamp: block3Ts,
          actor: "admin@acme.io",
          action: "jit.grant.issued",
          resource: "aws:production",
        },
      ];

      const result = verifyAuditChain(chain);
      expect(result.valid).toBe(true);
      expect(result.totalBlocks).toBe(3);
    });

    it("should detect tampering if an audit record payload is altered", () => {
      const block1Ts = "2026-09-01T00:00:00.000Z";
      const block1Hash = computeAuditHash({
        previousHash: GENESIS_HASH,
        sequence: 1,
        timestamp: block1Ts,
        actor: "system",
        action: "ledger.genesis",
        resource: "airlock:merkle-chain",
      });

      const block2Ts = "2026-09-01T00:01:00.000Z";
      const block2Hash = computeAuditHash({
        previousHash: block1Hash,
        sequence: 2,
        timestamp: block2Ts,
        actor: "admin@acme.io",
        action: "org.created",
        resource: "org:acme",
      });

      const chain = [
        {
          sequence: 1,
          previousHash: GENESIS_HASH,
          currentHash: block1Hash,
          timestamp: block1Ts,
          actor: "system",
          action: "ledger.genesis",
          resource: "airlock:merkle-chain",
        },
        {
          sequence: 2,
          previousHash: block1Hash,
          currentHash: block2Hash,
          timestamp: block2Ts,
          actor: "attacker@malicious.com", // TAMPERED ACTOR!
          action: "org.created",
          resource: "org:acme",
        },
      ];

      const result = verifyAuditChain(chain);
      expect(result.valid).toBe(false);
      expect(result.brokenAtSequence).toBe(2);
      expect(result.error).toContain("Payload tamper detected");
    });
  });
});
