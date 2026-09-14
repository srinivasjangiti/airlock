import { db } from "./db";
import { hashApiKey } from "./crypto";
import { ensureDatabaseSeeded } from "./db-seed";

export async function authenticateApiKey(authHeader: string | null): Promise<{
  authenticated: boolean;
  apiKey?: any;
  orgId?: string;
  error?: string;
  status: number;
}> {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return {
      authenticated: false,
      error: "Missing or malformed Authorization header. Expected 'Bearer <api_key>'.",
      status: 401,
    };
  }

  const rawToken = authHeader.replace("Bearer ", "").trim();
  if (!rawToken.startsWith("ak_")) {
    return {
      authenticated: false,
      error: "Invalid API key format. Expected key starting with 'ak_live_' or 'ak_test_'.",
      status: 401,
    };
  }

  await ensureDatabaseSeeded();

  const keyHash = hashApiKey(rawToken);
  const apiKeyRecord = await db.apiKey.findUnique({
    where: { keyHash },
    include: { organization: true },
  });

  if (!apiKeyRecord) {
    return {
      authenticated: false,
      error: "API key is invalid or has been revoked.",
      status: 401,
    };
  }

  if (apiKeyRecord.expiresAt && apiKeyRecord.expiresAt < new Date()) {
    return {
      authenticated: false,
      error: "API key has expired.",
      status: 401,
    };
  }

  // Update lastUsedAt asynchronously
  db.apiKey
    .update({
      where: { id: apiKeyRecord.id },
      data: { lastUsedAt: new Date() },
    })
    .catch(() => {});

  return {
    authenticated: true,
    apiKey: apiKeyRecord,
    orgId: apiKeyRecord.orgId,
    status: 200,
  };
}
