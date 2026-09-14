import crypto from "crypto";

const SIGNING_SECRET =
  process.env.AIRLOCK_SIGNING_SECRET || "airlock_default_dev_secret_key_change_in_prod";

export const GENESIS_HASH =
  "0000000000000000000000000000000000000000000000000000000000000000";

// --- API Key Primitives ---

export function hashApiKey(rawKey: string): string {
  return crypto.createHash("sha256").update(rawKey.trim()).digest("hex");
}

export function generateApiKey(environment: "live" | "test" = "live"): {
  rawKey: string;
  keyHash: string;
  prefix: string;
} {
  const randomEntropy = crypto.randomBytes(24).toString("base64url");
  const rawKey = `ak_${environment}_${randomEntropy}`;
  const keyHash = hashApiKey(rawKey);
  const prefix = rawKey.slice(0, 14); // e.g. "ak_live_Ab12Cd"

  return { rawKey, keyHash, prefix };
}

// --- JIT Ephemeral Tokens (HMAC-SHA256 Signed JWT) ---

export interface JitTokenPayload {
  gid: string; // Grant ID
  sub: string; // User ID
  org: string; // Org ID
  tgt: string; // Target integration
  scp: string; // Scope / permission
  iat: number; // Issued at (seconds)
  exp: number; // Expires at (seconds)
  iss: string; // Issuer
}

function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function base64UrlDecode(str: string): string {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4) {
    str += "=";
  }
  return Buffer.from(str, "base64").toString("utf8");
}

export function signJitToken(payload: Omit<JitTokenPayload, "iat" | "iss">): string {
  const header = { alg: "HS256", typ: "JWT" };
  const fullPayload: JitTokenPayload = {
    ...payload,
    iat: Math.floor(Date.now() / 1000),
    iss: "airlock-iam-governance",
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));
  const data = `${encodedHeader}.${encodedPayload}`;

  const signature = crypto
    .createHmac("sha256", SIGNING_SECRET)
    .update(data)
    .digest("base64url");

  return `${data}.${signature}`;
}

export function verifyJitToken(token: string): {
  valid: boolean;
  payload?: JitTokenPayload;
  error?: string;
} {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      return { valid: false, error: "Malformed token format. Expected 3 segments." };
    }

    const [encodedHeader, encodedPayload, receivedSignature] = parts;
    const data = `${encodedHeader}.${encodedPayload}`;

    const expectedSignature = crypto
      .createHmac("sha256", SIGNING_SECRET)
      .update(data)
      .digest("base64url");

    // Timing-safe comparison to mitigate timing attacks
    const sigA = Buffer.from(receivedSignature);
    const sigB = Buffer.from(expectedSignature);

    if (sigA.length !== sigB.length || !crypto.timingSafeEqual(sigA, sigB)) {
      return { valid: false, error: "Cryptographic signature verification failed." };
    }

    const payload: JitTokenPayload = JSON.parse(base64UrlDecode(encodedPayload));
    const nowInSeconds = Math.floor(Date.now() / 1000);

    if (payload.exp <= nowInSeconds) {
      return { valid: false, payload, error: "Token expired." };
    }

    return { valid: true, payload };
  } catch (err: any) {
    return { valid: false, error: `Token decode error: ${err.message}` };
  }
}

// --- Cryptographic Tamper-Evident Audit Ledger (Merkle Chained) ---

export interface AuditEntryData {
  previousHash: string;
  sequence: number;
  timestamp: string;
  actor: string;
  action: string;
  resource: string;
  metadata?: string | null;
}

export function computeAuditHash(entry: AuditEntryData): string {
  const canonicalString = [
    entry.previousHash,
    entry.sequence.toString(),
    entry.timestamp,
    entry.actor,
    entry.action,
    entry.resource,
    entry.metadata || "",
  ].join("|");

  return crypto.createHash("sha256").update(canonicalString).digest("hex");
}

export function verifyAuditChain(
  logs: Array<{
    sequence: number;
    previousHash: string;
    currentHash: string;
    timestamp: Date | string;
    actor: string;
    action: string;
    resource: string;
    metadata?: string | null;
  }>
): {
  valid: boolean;
  totalBlocks: number;
  brokenAtSequence?: number;
  error?: string;
} {
  if (logs.length === 0) {
    return { valid: true, totalBlocks: 0 };
  }

  // Sort ascending by sequence
  const sorted = [...logs].sort((a, b) => a.sequence - b.sequence);

  for (let i = 0; i < sorted.length; i++) {
    const current = sorted[i];
    const tsString =
      current.timestamp instanceof Date
        ? current.timestamp.toISOString()
        : new Date(current.timestamp).toISOString();

    // Check sequence continuity
    if (i === 0) {
      if (current.sequence !== 1 || current.previousHash !== GENESIS_HASH) {
        return {
          valid: false,
          totalBlocks: logs.length,
          brokenAtSequence: current.sequence,
          error: `Genesis block mismatch. Expected sequence 1 and previousHash ${GENESIS_HASH}`,
        };
      }
    } else {
      const prev = sorted[i - 1];
      if (current.sequence !== prev.sequence + 1) {
        return {
          valid: false,
          totalBlocks: logs.length,
          brokenAtSequence: current.sequence,
          error: `Sequence gap detected between ${prev.sequence} and ${current.sequence}`,
        };
      }
      if (current.previousHash !== prev.currentHash) {
        return {
          valid: false,
          totalBlocks: logs.length,
          brokenAtSequence: current.sequence,
          error: `Hash chain broken at sequence ${current.sequence}. Previous hash does not match block ${prev.sequence}`,
        };
      }
    }

    // Recompute current hash
    const expectedHash = computeAuditHash({
      previousHash: current.previousHash,
      sequence: current.sequence,
      timestamp: tsString,
      actor: current.actor,
      action: current.action,
      resource: current.resource,
      metadata: current.metadata,
    });

    if (current.currentHash !== expectedHash) {
      return {
        valid: false,
        totalBlocks: logs.length,
        brokenAtSequence: current.sequence,
        error: `Payload tamper detected at sequence ${current.sequence}. Hash mismatch: recorded ${current.currentHash}, calculated ${expectedHash}`,
      };
    }
  }

  return { valid: true, totalBlocks: sorted.length };
}
