import type { Metadata } from "next";

import { toolMetadata } from "@/lib/seo";
import { JwtDebuggerTool } from "@/tools/JwtDebuggerTool";

export const metadata: Metadata = toolMetadata({
  title: "JWT Debugger",
  description:
    "Decode and inspect JWT headers and payloads. Verify expiration and claims quickly.",
  path: "/jwt",
  keywords: [
    "jwt debugger",
    "jwt decoder",
    "decode jwt",
    "jwt parser",
    "jwt validator",
    "jwt claims",
    "json web token",
  ],
});

export default function JwtPage() {
  return <JwtDebuggerTool />;
}
