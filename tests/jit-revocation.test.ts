import { describe, it, expect, beforeAll } from "vitest";
import { ensureDatabaseSeeded } from "@/lib/db-seed";
import { db } from "@/lib/db";
import { signJitToken } from "@/lib/crypto";

describe("JIT Access Lifecycle & Auto-Revocation Engine", () => {
  let orgId: string;
  let userId: string;

  beforeAll(async () => {
    const org = await ensureDatabaseSeeded();
    orgId = org.id;
    const user = await db.user.findFirst({ where: { orgId } });
    userId = user!.id;
  });

  it("should issue an active JIT grant with an HMAC signed token", async () => {
    const expiresAt = new Date(Date.now() + 3600000);
    const grant = await db.jitGrant.create({
      data: {
        orgId,
        userId,
        userName: "Srinivas Jangiti",
        userEmail: "srinivasajan.work@gmail.com",
        integration: "aws",
        scope: "iam:AdministratorAccess",
        reason: "Emergency production cluster debugging",
        durationHours: 1,
        status: "ACTIVE",
        expiresAt,
      },
    });

    const token = signJitToken({
      gid: grant.id,
      sub: userId,
      org: orgId,
      tgt: "aws",
      scp: "iam:AdministratorAccess",
      exp: Math.floor(expiresAt.getTime() / 1000),
    });

    await db.jitGrant.update({
      where: { id: grant.id },
      data: { signedToken: token },
    });

    expect(grant.id).toBeDefined();
    expect(grant.status).toBe("ACTIVE");
    expect(token).toBeDefined();
    expect(token.split(".")).toHaveLength(3);
  });

  it("should query expired active grants and transition them to EXPIRED", async () => {
    // Create an already-expired grant in the database
    const pastExpiresAt = new Date(Date.now() - 60000); // 1 minute ago
    const expiredGrant = await db.jitGrant.create({
      data: {
        orgId,
        userId,
        userName: "Srinivas Jangiti",
        userEmail: "srinivasajan.work@gmail.com",
        integration: "github",
        scope: "repo:admin",
        reason: "Temporary deployment fix",
        durationHours: 1,
        status: "ACTIVE",
        expiresAt: pastExpiresAt,
      },
    });

    // Simulate auto-revocation worker pass
    const candidates = await db.jitGrant.findMany({
      where: {
        status: "ACTIVE",
        expiresAt: { lte: new Date() },
      },
    });

    const target = candidates.find((c) => c.id === expiredGrant.id);
    expect(target).toBeDefined();

    // Perform revocation
    await db.jitGrant.update({
      where: { id: expiredGrant.id },
      data: { status: "EXPIRED", revokedAt: new Date() },
    });

    const refreshed = await db.jitGrant.findUnique({
      where: { id: expiredGrant.id },
    });

    expect(refreshed?.status).toBe("EXPIRED");
    expect(refreshed?.revokedAt).toBeDefined();

    // Clean up
    await db.jitGrant.delete({ where: { id: expiredGrant.id } });
  });
});
