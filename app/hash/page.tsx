import type { Metadata } from "next";

import { toolMetadata } from "@/lib/seo";
import { HashTool } from "@/tools/HashTool";

export const metadata: Metadata = toolMetadata({
  title: "Hash Generator",
  description:
    "Generate SHA hashes (SHA-1, SHA-256, SHA-384, SHA-512) for text or files using native browser crypto APIs.",
  path: "/hash",
  keywords: [
    "hash generator",
    "hash calculator",
    "checksum tool",
    "md5",
    "sha1",
    "sha256",
    "sha512",
  ],
});

export default function HashPage() {
  return <HashTool />;
}
