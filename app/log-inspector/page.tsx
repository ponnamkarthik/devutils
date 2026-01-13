import type { Metadata } from "next";

import { toolMetadata } from "@/lib/seo";
import { LogInspectorTool } from "@/tools/LogInspectorTool";

export const metadata: Metadata = toolMetadata({
  title: "Log Inspector",
  description:
    "Inspect and filter logs in your browser: JSON logs (auto-detected fields) and Common Log Format (CLF) with level filtering and search.",
  path: "/log-inspector",
  keywords: [
    "log inspector",
    "log viewer",
    "json logs",
    "structured logs",
    "clf logs",
    "apache logs",
    "nginx logs",
    "log filter",
  ],
});

export default function LogInspectorPage() {
  return <LogInspectorTool />;
}
