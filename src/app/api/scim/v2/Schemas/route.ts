import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      schemas: ["urn:ietf:params:scim:api:messages:2.0:ListResponse"],
      totalResults: 1,
      itemsPerPage: 1,
      startIndex: 1,
      Resources: [
        {
          id: "urn:ietf:params:scim:schemas:core:2.0:User",
          name: "User",
          description: "User Account Resource Schema",
          attributes: [
            { name: "userName", type: "string", required: true, mutability: "readWrite" },
            { name: "name", type: "complex", required: false, mutability: "readWrite" },
            { name: "emails", type: "complex", multiValued: true, required: true },
            { name: "active", type: "boolean", required: false, mutability: "readWrite" },
            { name: "department", type: "string", required: false, mutability: "readWrite" },
            { name: "userType", type: "string", required: false, mutability: "readWrite" },
          ],
        },
      ],
    },
    { status: 200, headers: { "Content-Type": "application/scim+json" } }
  );
}
