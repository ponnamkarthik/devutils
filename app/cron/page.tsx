import type { Metadata } from "next";

import { toolMetadata } from "@/lib/seo";
import { CronTool } from "@/tools/CronTool";

export const metadata: Metadata = toolMetadata({
  title: "Cron Expression Tool",
  description:
    "Build and validate 5-field cron expressions with presets, field-by-field controls, and human-readable schedule descriptions.",
  path: "/cron",
  keywords: [
    "cron",
    "cron expression",
    "crontab",
    "schedule",
    "cron parser",
    "cron generator",
    "cron to human",
  ],
});

export default function CronPage() {
  return <CronTool />;
}
