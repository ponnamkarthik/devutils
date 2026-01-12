import type { Metadata } from "next";

import { toolMetadata } from "@/lib/seo";
import { HashTool } from "@/tools/HashTool";

export const metadata: Metadata = toolMetadata({
  title: "Hash Generator",
  description:
    "Generate hashes (MD5, SHA-1, SHA-256, and more) for strings to verify integrity and debug checksums.",
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
