import { NextRequest, NextResponse } from "next/server";
import { appendAuditLog } from "@/lib/audit-service";
import { db } from "@/lib/db";
import { ensureDatabaseSeeded } from "@/lib/db-seed";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { provider, action, member, credentials } = body;

    if (!provider || !action || !member) {
      return NextResponse.json(
        { success: false, error: "Missing required parameters: provider, action, member." },
        { status: 400 }
      );
    }

    await ensureDatabaseSeeded();
    const org = await db.organization.findFirst();
    const orgId = org ? org.id : "default-org";

    const normProvider = provider.toLowerCase().trim();

    // 1. Live GitHub Membership Provisioning / Deprovisioning
    if (normProvider === "github") {
      const { token, org: githubOrg } = credentials || {};

      if (!token || !githubOrg) {
        return NextResponse.json(
          {
            success: false,
            error: "GitHub provisioning requires both a Personal Access Token (PAT) and an Organization name.",
            status: "MISSING_CREDENTIALS",
          },
          { status: 400 }
        );
      }

      const username = member.githubUsername || member.email.split("@")[0];

      if (action === "grant" || action === "invite") {
        const res = await fetch(`https://api.github.com/orgs/${githubOrg.trim()}/memberships/${username}`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token.trim()}`,
            Accept: "application/vnd.github.v3+json",
            "Content-Type": "application/json",
            "User-Agent": "AirLock-IAM-Production-Engine/2.0",
          },
          body: JSON.stringify({ role: member.role === "Admin" ? "admin" : "member" }),
        });

        const data = await res.json().catch(() => ({}));

        await appendAuditLog({
          orgId,
          actor: "airlock:provisioner",
          action: res.ok ? "integration.github.invited" : "integration.github.invite_failed",
          resource: `github:${githubOrg}:${username}`,
          severity: res.ok ? "info" : "warning",
          metadata: { memberEmail: member.email, httpStatus: res.status, error: data.message },
        });

        return NextResponse.json({
          success: res.ok,
          provider: "github",
          action: "grant",
          target: username,
          response: data,
          status: res.status,
          message: res.ok
            ? `Successfully issued GitHub organization invitation to @${username}.`
            : `GitHub API error: ${data.message || res.statusText}`,
        });
      } else if (action === "revoke") {
        const res = await fetch(`https://api.github.com/orgs/${githubOrg.trim()}/memberships/${username}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token.trim()}`,
            Accept: "application/vnd.github.v3+json",
            "User-Agent": "AirLock-IAM-Production-Engine/2.0",
          },
        });

        await appendAuditLog({
          orgId,
          actor: "airlock:provisioner",
          action: "integration.github.revoked",
          resource: `github:${githubOrg}:${username}`,
          severity: "warning",
          metadata: { memberEmail: member.email, httpStatus: res.status },
        });

        return NextResponse.json({
          success: res.ok || res.status === 404,
          provider: "github",
          action: "revoke",
          target: username,
          status: res.status,
          message: `Revoked GitHub membership for @${username}.`,
        });
      }
    }

    // 2. Custom Webhook Dispatcher
    if (credentials?.webhookUrl) {
      try {
        const hookRes = await fetch(credentials.webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event: `airlock.member.${action}`,
            provider,
            member: {
              name: member.name,
              email: member.email,
              role: member.role,
            },
            timestamp: new Date().toISOString(),
          }),
        });

        await appendAuditLog({
          orgId,
          actor: "airlock:provisioner",
          action: `integration.${provider}.webhook_dispatched`,
          resource: `${provider}:${member.email}`,
          severity: hookRes.ok ? "info" : "warning",
          metadata: { statusCode: hookRes.status },
        });

        return NextResponse.json({
          success: hookRes.ok,
          provider,
          action,
          mode: "webhook",
          message: `Dispatched provisioning webhook to ${credentials.webhookUrl} (HTTP ${hookRes.status}).`,
        });
      } catch (err: any) {
        return NextResponse.json({
          success: false,
          error: `Webhook delivery failed: ${err.message}`,
        });
      }
    }

    // If no credentials or adapter:
    return NextResponse.json(
      {
        success: false,
        error: `Cannot provision member '${member.name}' on '${provider}': No live integration credentials configured. Configure credentials in Integration Settings.`,
        status: "UNCONFIGURED",
      },
      { status: 400 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: `Provisioning error: ${err.message}` },
      { status: 500 }
    );
  }
}
