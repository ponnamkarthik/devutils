import type { Metadata } from "next";

import { toolMetadata } from "@/lib/seo";
import { ApiDocsTool } from "@/tools/ApiDocsTool";

export const metadata: Metadata = toolMetadata({
  title: "API Docs Generator",
  description:
    "Generate clean HTML API documentation from Postman Collection v2.1 or OpenAPI (Swagger) v3 specs (JSON or YAML). Preview endpoints and export a single self-contained HTML file.",
  path: "/api-docs",
  keywords: [
    "api docs generator",
    "postman collection",
    "postman v2.1",
    "openapi",
    "swagger",
    "openapi v3",
    "yaml to html",
    "api documentation",
  ],
});

export default function ApiDocsPage() {
  return <ApiDocsTool />;
}
