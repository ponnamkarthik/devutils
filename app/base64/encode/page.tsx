import type { Metadata } from "next";

import { toolMetadata } from "@/lib/seo";
import { Base64Tool } from "@/tools/Base64Tool";

export const metadata: Metadata = toolMetadata({
  title: "Base64 Encode",
  description:
    "Encode text or files to Base64 (Data URL input supported). Copy results instantly for APIs, headers, and debugging.",
  path: "/base64/encode",
  keywords: [
    "base64 encode",
    "base64 encoder",
    "encode base64",
    "text to base64",
    "string to base64",
    "base64 online",
  ],
});

export default function Base64EncodePage() {
  return <Base64Tool mode="encode" />;
}
