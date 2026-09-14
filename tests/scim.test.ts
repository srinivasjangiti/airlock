import { describe, it, expect, beforeAll } from "vitest";
import { ensureDatabaseSeeded } from "@/lib/db-seed";
import { db } from "@/lib/db";

describe("SCIM 2.0 Identity Lifecycle", () => {
  let orgId: string;

  beforeAll(async () => {
    const org = await ensureDatabaseSeeded();
    orgId = org.id;
  });

  it("should provision a new user in the database with standard SCIM attributes", async () => {
    const testEmail = `scim-test-${Date.now()}@acme.io`;
    const user = await db.user.create({
      data: {
        orgId,
        email: testEmail,
        name: "Test SCIM Engineer",
        role: "Developer",
        department: "Platform Infrastructure",
        status: "active",
        mfaEnabled: true,
      },
    });

    expect(user.id).toBeDefined();
    expect(user.email).toBe(testEmail);
    expect(user.status).toBe("active");

    // Test deprovisioning (status: suspended)
    const deprovisioned = await db.user.update({
      where: { id: user.id },
      data: { status: "suspended" },
    });

    expect(deprovisioned.status).toBe("suspended");

    // Clean up
    await db.user.delete({ where: { id: user.id } });
  });

  it("should prevent duplicate user provisioning", async () => {
    const existing = await db.user.findFirst({ where: { orgId } });
    expect(existing).toBeDefined();

    await expect(
      db.user.create({
        data: {
          orgId,
          email: existing!.email, // Duplicate email
          name: "Duplicate User",
          role: "Developer",
        },
      })
    ).rejects.toThrow();
  });
});
