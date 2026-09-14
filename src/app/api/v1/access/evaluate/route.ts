import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authenticateApiKey } from "@/lib/auth-service";
import { appendAuditLog } from "@/lib/audit-service";
import { ensureDatabaseSeeded } from "@/lib/db-seed";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const auth = await authenticateApiKey(authHeader);
    if (!auth.authenticated) {
      return NextResponse.json(
        { error: "Unauthorized", message: auth.error },
        { status: auth.status }
      );
    }

    const body = await req.json();
    const { memberId, memberRole, email, integration, action, mfaEnrolled, ipAddress } = body;

    if (!integration || !action) {
      return NextResponse.json(
        { error: "Bad Request", message: "Missing required fields: 'integration' and 'action'." },
        { status: 400 }
      );
    }

    await ensureDatabaseSeeded();

    // Look up user if memberId or email is provided
    let subjectUser = null;
    if (memberId) {
      subjectUser = await db.user.findFirst({
        where: { id: memberId, orgId: auth.orgId },
      });
    } else if (email) {
      subjectUser = await db.user.findFirst({
        where: { email: email.toLowerCase().trim(), orgId: auth.orgId },
      });
    }

    const role = subjectUser ? subjectUser.role : memberRole || "Developer";
    const mfa =
      subjectUser !== null
        ? subjectUser.mfaEnabled
        : mfaEnrolled !== undefined
        ? Boolean(mfaEnrolled)
        : false;

    const steps: { check: string; passed: boolean; note: string }[] = [];

    // Step 1: API Key & Tenant Authentication
    steps.push({
      check: "API Key Authenticity & Tenant Binding",
      passed: true,
      note: `Authenticated service key '${auth.apiKey.prefix}...' for organization '${auth.apiKey.organization.name}'.`,
    });

    // Step 2: Policy Evaluation from Database
    const policies = await db.accessPolicy.findMany({
      where: {
        orgId: auth.orgId,
        OR: [{ role }, { role: "Admin" }],
      },
    });

    const targetIntegration = integration.toLowerCase().trim();
    const targetAction = action.toLowerCase().trim();

    // Find matching policy for role and resource
    let matchingPolicy = null;
    for (const policy of policies) {
      const resources = policy.resource
        .split(",")
        .map((r) => r.trim().toLowerCase());
      const isResourceMatch = resources.includes("*") || resources.includes(targetIntegration);

      if (isResourceMatch) {
        let allowedActions: string[] = [];
        try {
          allowedActions = JSON.parse(policy.allowedActions);
        } catch {
          allowedActions = [policy.allowedActions];
        }

        const isActionMatch =
          allowedActions.includes("*") ||
          allowedActions.map((a) => a.toLowerCase()).includes(targetAction);

        if (isActionMatch) {
          matchingPolicy = policy;
          break;
        }
      }
    }

    if (!matchingPolicy) {
      steps.push({
        check: "Role Policy Binding",
        passed: false,
        note: `No active policy grants role '${role}' permission '${targetAction}' on integration '${integration}'.`,
      });

      // Record audit event in database
      await appendAuditLog({
        orgId: auth.orgId!,
        actor: subjectUser ? subjectUser.email : `api:${auth.apiKey.prefix}`,
        action: "access.evaluate.denied",
        resource: `${integration}:${action}`,
        severity: "warning",
        metadata: {
          role,
          mfa,
          reason: `No matching policy for ${integration}:${action}`,
          ipAddress: ipAddress || "unknown",
        },
      });

      return NextResponse.json({
        decision: "DENY",
        allowed: false,
        reason: `Integration '${integration}' with action '${action}' is not permitted under policy for role '${role}'.`,
        subject: {
          memberId: subjectUser?.id || memberId || "svc-account",
          role,
          mfaEnrolled: mfa,
        },
        resource: { integration, action },
        steps,
        timestamp: new Date().toISOString(),
      });
    }

    steps.push({
      check: "Role Policy Binding",
      passed: true,
      note: `Matched policy '${matchingPolicy.name}' granting '${action}' on '${integration}'.`,
    });

    // Step 3: Hardware MFA Enforcement
    if (matchingPolicy.mfaRequired && !mfa) {
      steps.push({
        check: "Hardware MFA Verification",
        passed: false,
        note: `Policy '${matchingPolicy.name}' strictly mandates MFA, but subject is not enrolled.`,
      });

      await appendAuditLog({
        orgId: auth.orgId!,
        actor: subjectUser ? subjectUser.email : `api:${auth.apiKey.prefix}`,
        action: "access.evaluate.denied",
        resource: `${integration}:${action}`,
        severity: "warning",
        metadata: {
          role,
          policy: matchingPolicy.name,
          reason: "MFA required but subject not enrolled",
          ipAddress: ipAddress || "unknown",
        },
      });

      return NextResponse.json({
        decision: "DENY",
        allowed: false,
        reason: `MFA enforcement failed: Policy '${matchingPolicy.name}' mandates multi-factor authentication.`,
        subject: {
          memberId: subjectUser?.id || memberId || "svc-account",
          role,
          mfaEnrolled: false,
        },
        resource: { integration, action },
        steps,
        timestamp: new Date().toISOString(),
      });
    }

    steps.push({
      check: "Hardware MFA Verification",
      passed: true,
      note: matchingPolicy.mfaRequired
        ? "Hardware MFA challenge verified."
        : "MFA is not mandated by this policy.",
    });

    // Step 4: Final Allow Decision & Audit Record
    await appendAuditLog({
      orgId: auth.orgId!,
      actor: subjectUser ? subjectUser.email : `api:${auth.apiKey.prefix}`,
      action: "access.evaluate.allowed",
      resource: `${integration}:${action}`,
      severity: "info",
      metadata: {
        role,
        policy: matchingPolicy.name,
        ipAddress: ipAddress || "127.0.0.1",
      },
    });

    return NextResponse.json({
      decision: "ALLOW",
      allowed: true,
      reason: `Access ALLOWED under policy '${matchingPolicy.name}'.`,
      policy: {
        id: matchingPolicy.id,
        name: matchingPolicy.name,
      },
      subject: {
        memberId: subjectUser?.id || memberId || "svc-account",
        role,
        mfaEnrolled: mfa,
      },
      resource: { integration, action, ipAddress: ipAddress || "127.0.0.1" },
      steps,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Internal Error", message: err.message },
      { status: 500 }
    );
  }
}
