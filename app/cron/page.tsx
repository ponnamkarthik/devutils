import type { Metadata } from "next";

import { toolMetadata } from "@/lib/seo";
import { CronTool } from "@/tools/CronTool";

export const metadata: Metadata = toolMetadata({
  title: "Cron Expression Tool",
  description:
    "Build and validate cron expressions with readable schedules. Preview upcoming run times quickly.",
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
