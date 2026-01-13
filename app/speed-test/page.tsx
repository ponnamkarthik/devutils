import type { Metadata } from "next";

import { toolMetadata } from "@/lib/seo";
import { SpeedTestTool } from "@/tools/SpeedTestTool";

export const metadata: Metadata = toolMetadata({
  title: "Internet Speed Test",
  description:
    "Estimate latency (HEAD request) and download speed by fetching a large file directly in the browser. No installs needed.",
  path: "/speed-test",
  keywords: [
    "internet speed test",
    "download speed",
    "latency test",
    "ping test",
    "network speed",
  ],
});

export default function SpeedTestPage() {
  return <SpeedTestTool />;
}
