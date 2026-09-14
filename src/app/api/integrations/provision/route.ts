import { NextRequest, NextResponse } from "next/server";

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

    // 1. Live GitHub Membership Provisioning
    if (provider === "github" && credentials?.token && credentials?.org) {
      const { token, org } = credentials;
      const username = member.githubUsername || member.email.split("@")[0];

      if (action === "grant" || action === "invite") {
        const res = await fetch(`https://api.github.com/orgs/${org.trim()}/memberships/${username}`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token.trim()}`,
            Accept: "application/vnd.github.v3+json",
            "Content-Type": "application/json",
            "User-Agent": "AirLock-IAM-Engine/2.0",
          },
          body: JSON.stringify({ role: member.role === "Admin" ? "admin" : "member" }),
        });

        const data = await res.json();
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
        const res = await fetch(`https://api.github.com/orgs/${org.trim()}/memberships/${username}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token.trim()}`,
            Accept: "application/vnd.github.v3+json",
            "User-Agent": "AirLock-IAM-Engine/2.0",
          },
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

    // 2. Custom Webhook / Event Dispatcher
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

        return NextResponse.json({
          success: hookRes.ok,
          provider,
          action,
          mode: "webhook",
          message: `Dispatched provisioning webhook (${hookRes.status}).`,
        });
      } catch (err: any) {
        return NextResponse.json({
          success: false,
          error: `Webhook delivery failed: ${err.message}`,
        });
      }
    }

    // 3. Fallback Simulation (Sandbox Mode)
    return NextResponse.json({
      success: true,
      provider,
      action,
      mode: "simulation",
      target: member.email,
      timestamp: new Date().toISOString(),
      message: `Simulated provisioning of ${member.name} (${member.email}) on ${provider}.`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: `Provisioning error: ${err.message}` },
      { status: 500 }
    );
  }
}
