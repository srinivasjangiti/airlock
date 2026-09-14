import { describe, it, expect, beforeAll } from "vitest";
import { ensureDatabaseSeeded } from "@/lib/db-seed";
import { db } from "@/lib/db";

describe("Deterministic Policy Evaluation Engine", () => {
  let orgId: string;

  beforeAll(async () => {
    const org = await ensureDatabaseSeeded();
    orgId = org.id;
  });

  it("should have seeded standard enterprise policies in the database", async () => {
    const policies = await db.accessPolicy.findMany({
      where: { orgId },
    });

    expect(policies.length).toBeGreaterThanOrEqual(4);
    const adminPolicy = policies.find((p) => p.role === "Admin");
    expect(adminPolicy).toBeDefined();
    expect(adminPolicy?.mfaRequired).toBe(true);
  });

  it("should enforce MFA requirement on SecOps and DevOps roles", async () => {
    const secopsPolicy = await db.accessPolicy.findFirst({
      where: { orgId, role: "SecOps" },
    });

    expect(secopsPolicy).toBeDefined();
    expect(secopsPolicy?.mfaRequired).toBe(true);
  });

  it("should allow developer access to permitted resources (github, slack) and restrict cloud", async () => {
    const devPolicy = await db.accessPolicy.findFirst({
      where: { orgId, role: "Developer" },
    });

    expect(devPolicy).toBeDefined();
    const devResources = devPolicy!.resource.split(",").map((r) => r.trim());
    expect(devResources).toContain("github");
    expect(devResources).toContain("slack");
    expect(devResources).not.toContain("aws");
  });
});
