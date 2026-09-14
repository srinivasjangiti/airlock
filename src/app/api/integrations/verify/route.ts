import { NextRequest, NextResponse } from "next/server";
import { STSClient, GetCallerIdentityCommand } from "@aws-sdk/client-sts";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { provider, credentials } = body;

    if (!provider) {
      return NextResponse.json(
        { success: false, error: "Missing required 'provider' parameter." },
        { status: 400 }
      );
    }

    const normProvider = provider.toLowerCase().trim();

    // 1. Live GitHub Authentication & Scope Verification
    if (normProvider === "github") {
      const { token, org } = credentials || {};

      if (!token) {
        return NextResponse.json(
          {
            success: false,
            error: "GitHub requires a valid Personal Access Token (PAT) with 'read:org' or 'admin:org' scopes.",
            status: "MISSING_CREDENTIALS",
          },
          { status: 400 }
        );
      }

      // Outbound call to GitHub REST API
      const userRes = await fetch("https://api.github.com/user", {
        headers: {
          Authorization: `Bearer ${token.trim()}`,
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "AirLock-IAM-Production-Engine/2.0",
        },
      });

      if (!userRes.ok) {
        const errorData = await userRes.json().catch(() => ({}));
        return NextResponse.json(
          {
            success: false,
            error: `GitHub API Authentication Failed (${userRes.status}): ${errorData.message || "Bad credentials"}`,
            upstreamStatus: userRes.status,
          },
          { status: 401 }
        );
      }

      const userData = await userRes.json();
      const rawScopes = userRes.headers.get("x-oauth-scopes") || "";
      const scopes = rawScopes.split(",").map((s) => s.trim()).filter(Boolean);

      let orgData: any = null;
      if (org) {
        const orgRes = await fetch(`https://api.github.com/orgs/${org.trim()}`, {
          headers: {
            Authorization: `Bearer ${token.trim()}`,
            Accept: "application/vnd.github.v3+json",
            "User-Agent": "AirLock-IAM-Production-Engine/2.0",
          },
        });

        if (orgRes.ok) {
          orgData = await orgRes.json();
        } else {
          return NextResponse.json(
            {
              success: false,
              error: `Token authenticated as @${userData.login}, but organization '${org}' could not be accessed (${orgRes.status}). Verify organization membership and SSO authorization.`,
              authenticatedUser: userData.login,
            },
            { status: 403 }
          );
        }
      }

      return NextResponse.json({
        success: true,
        provider: "github",
        mode: "live",
        verifiedAt: new Date().toISOString(),
        authenticatedUser: {
          login: userData.login,
          name: userData.name,
          avatarUrl: userData.avatar_url,
          id: userData.id,
        },
        organization: orgData
          ? {
              login: orgData.login,
              name: orgData.name,
              plan: orgData.plan?.name || "Enterprise / Team",
              publicRepos: orgData.public_repos || 0,
            }
          : null,
        scopes,
      });
    }

    // 2. Live Slack Web API Verification
    if (normProvider === "slack") {
      const { token, webhookUrl } = credentials || {};

      if (token) {
        const slackRes = await fetch("https://slack.com/api/auth.test", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token.trim()}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
        });

        const slackData = await slackRes.json();

        if (!slackData.ok) {
          return NextResponse.json(
            {
              success: false,
              error: `Slack Authentication Failed: ${slackData.error || "invalid_auth"}`,
              slackErrorCode: slackData.error,
            },
            { status: 401 }
          );
        }

        return NextResponse.json({
          success: true,
          provider: "slack",
          mode: "live",
          verifiedAt: new Date().toISOString(),
          team: {
            id: slackData.team_id,
            name: slackData.team,
            url: slackData.url,
          },
          botUser: {
            id: slackData.user_id,
            user: slackData.user,
          },
        });
      } else if (webhookUrl) {
        if (!webhookUrl.startsWith("https://hooks.slack.com/")) {
          return NextResponse.json(
            { success: false, error: "Invalid Slack incoming webhook URL format. Must begin with https://hooks.slack.com/." },
            { status: 400 }
          );
        }

        return NextResponse.json({
          success: true,
          provider: "slack",
          mode: "webhook",
          verifiedAt: new Date().toISOString(),
          webhookUrl,
        });
      }

      return NextResponse.json(
        { success: false, error: "Slack requires either a Bot User OAuth Token ('xoxb-...') or an Incoming Webhook URL." },
        { status: 400 }
      );
    }

    // 3. Real AWS STS (GetCallerIdentity) Verification via AWS SDK v3
    if (normProvider === "aws") {
      const { accessKeyId, secretAccessKey, sessionToken, region } = credentials || {};

      if (!accessKeyId || !secretAccessKey) {
        return NextResponse.json(
          {
            success: false,
            error: "AWS integration requires valid 'accessKeyId' and 'secretAccessKey' to execute STS GetCallerIdentity verification.",
            status: "MISSING_AWS_CREDENTIALS",
          },
          { status: 400 }
        );
      }

      try {
        const stsClient = new STSClient({
          region: region || "us-east-1",
          credentials: {
            accessKeyId: accessKeyId.trim(),
            secretAccessKey: secretAccessKey.trim(),
            sessionToken: sessionToken ? sessionToken.trim() : undefined,
          },
        });

        const command = new GetCallerIdentityCommand({});
        const response = await stsClient.send(command);

        return NextResponse.json({
          success: true,
          provider: "aws",
          mode: "live",
          verifiedAt: new Date().toISOString(),
          identity: {
            account: response.Account,
            arn: response.Arn,
            userId: response.UserId,
          },
          region: region || "us-east-1",
        });
      } catch (awsErr: any) {
        return NextResponse.json(
          {
            success: false,
            error: `AWS STS Authentication Failed: ${awsErr.name || "Error"} - ${awsErr.message}`,
            awsErrorCode: awsErr.name || "AuthFailure",
          },
          { status: 401 }
        );
      }
    }

    // 4. Custom Webhook Handshake Verification
    if (normProvider === "webhook" || normProvider === "custom") {
      const { endpointUrl, apiKey } = credentials || {};

      if (!endpointUrl) {
        return NextResponse.json(
          { success: false, error: "Missing required endpoint URL for custom webhook integration." },
          { status: 400 }
        );
      }

      try {
        const pingRes = await fetch(endpointUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
            "User-Agent": "AirLock-IAM-Ping/2.0",
          },
          body: JSON.stringify({
            event: "airlock.handshake.test",
            timestamp: new Date().toISOString(),
          }),
        });

        return NextResponse.json({
          success: pingRes.ok,
          provider: "custom",
          mode: "live",
          statusCode: pingRes.status,
          verifiedAt: new Date().toISOString(),
          message: pingRes.ok
            ? "Custom webhook endpoint acknowledged handshake successfully."
            : `Endpoint returned HTTP status ${pingRes.status}.`,
        });
      } catch (pingErr: any) {
        return NextResponse.json(
          {
            success: false,
            error: `Failed to connect to webhook endpoint: ${pingErr.message}`,
          },
          { status: 502 }
        );
      }
    }

    // For any unconfigured provider without live adapter credentials:
    return NextResponse.json(
      {
        success: false,
        error: `Integration '${provider}' is not configured. Provide live API credentials to verify connectivity.`,
        status: "UNCONFIGURED",
      },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: `Internal verification error: ${error.message}`,
      },
      { status: 500 }
    );
  }
}
