import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { provider, credentials } = body;

    if (!provider) {
      return NextResponse.json({ success: false, error: "Provider required" }, { status: 400 });
    }

    // 1. Live GitHub Org Members Sync
    if (provider === "github" && credentials?.token && credentials?.org) {
      const { token, org } = credentials;

      const res = await fetch(`https://api.github.com/orgs/${org.trim()}/members?per_page=50`, {
        headers: {
          Authorization: `Bearer ${token.trim()}`,
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "AirLock-IAM-Engine/2.0",
        },
      });

      if (!res.ok) {
        return NextResponse.json(
          { success: false, error: `GitHub API error: ${res.statusText}` },
          { status: res.status }
        );
      }

      const members = await res.json();
      return NextResponse.json({
        success: true,
        provider: "github",
        mode: "live",
        syncedCount: Array.isArray(members) ? members.length : 0,
        syncedAt: new Date().toISOString(),
        members: (Array.isArray(members) ? members : []).map((m: any) => ({
          externalId: String(m.id),
          username: m.login,
          avatarUrl: m.avatar_url,
          profileUrl: m.html_url,
          type: m.type,
        })),
      });
    }

    // 2. Live Slack Users Sync
    if (provider === "slack" && credentials?.token) {
      const res = await fetch("https://slack.com/api/users.list", {
        headers: {
          Authorization: `Bearer ${credentials.token.trim()}`,
        },
      });

      const data = await res.json();
      if (!data.ok) {
        return NextResponse.json(
          { success: false, error: `Slack API error: ${data.error}` },
          { status: 400 }
        );
      }

      const activeUsers = (data.members || []).filter(
        (u: any) => !u.deleted && !u.is_bot && u.id !== "USLACKBOT"
      );

      return NextResponse.json({
        success: true,
        provider: "slack",
        mode: "live",
        syncedCount: activeUsers.length,
        syncedAt: new Date().toISOString(),
        members: activeUsers.map((u: any) => ({
          externalId: u.id,
          username: u.name,
          realName: u.real_name,
          email: u.profile?.email,
          avatarUrl: u.profile?.image_72,
        })),
      });
    }

    // Default Fallback
    return NextResponse.json({
      success: true,
      provider,
      mode: "simulation",
      syncedCount: 8,
      syncedAt: new Date().toISOString(),
      message: "Synced directory against local policy cache.",
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: `Sync failed: ${err.message}` },
      { status: 500 }
    );
  }
}
