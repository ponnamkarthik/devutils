import type { Metadata } from "next";

import { toolMetadata } from "@/lib/seo";
import { JwtDebuggerTool } from "@/tools/JwtDebuggerTool";

export const metadata: Metadata = toolMetadata({
  title: "JWT Debugger",
  description:
    "Decode and inspect JWT header/payload (Base64URL) and view claims like exp/iat. Note: this tool does not verify signatures.",
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
