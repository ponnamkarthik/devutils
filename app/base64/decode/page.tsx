import type { Metadata } from "next";

import { toolMetadata } from "@/lib/seo";
import { Base64Tool } from "@/tools/Base64Tool";

export const metadata: Metadata = toolMetadata({
  title: "Base64 Decode",
  description:
    "Decode Base64 to text instantly. Useful for debugging tokens, payloads, and encoded content.",
  path: "/base64/decode",
  keywords: [
    "base64 decode",
    "base64 decoder",
    "decode base64",
    "base64 to text",
    "base64 to string",
    "base64 online",
  ],
});

export default function Base64DecodePage() {
  return <Base64Tool mode="decode" />;
}
