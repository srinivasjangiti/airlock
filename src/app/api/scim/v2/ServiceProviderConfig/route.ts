import { NextResponse } from "next/server";

export async function GET() {
  const config = {
    schemas: ["urn:ietf:params:scim:schemas:core:2.0:ServiceProviderConfig"],
    documentationUri: "https://github.com/srinivasjangiti/airlock",
    patch: {
      supported: true,
    },
    bulk: {
      supported: false,
      maxOperations: 0,
      maxPayloadSize: 0,
    },
    filter: {
      supported: true,
      maxResults: 100,
    },
    changePassword: {
      supported: false,
    },
    sort: {
      supported: true,
    },
    etag: {
      supported: false,
    },
    authenticationSchemes: [
      {
        name: "OAuth Bearer Token",
        description: "Authentication scheme using the OAuth Bearer Token Standard",
        specUri: "http://www.rfc-editor.org/info/rfc6750",
        type: "oauthbearertoken",
        primary: true,
      },
    ],
    meta: {
      resourceType: "ServiceProviderConfig",
      location: "/api/scim/v2/ServiceProviderConfig",
    },
  };

  return NextResponse.json(config, {
    status: 200,
    headers: { "Content-Type": "application/scim+json" },
  });
}
