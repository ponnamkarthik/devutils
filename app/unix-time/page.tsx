import type { Metadata } from "next";

import { toolMetadata } from "@/lib/seo";
import { UnixTimeTool } from "@/tools/UnixTimeTool";

export const metadata: Metadata = toolMetadata({
  title: "Unix Time Converter",
  description:
    "Convert Unix timestamps (seconds or milliseconds) to UTC/local/ISO with relative time, and convert dates back to epoch time.",
  path: "/unix-time",
  keywords: [
    "unix time",
    "unix timestamp",
    "timestamp converter",
    "epoch",
    "epoch converter",
    "date to timestamp",
    "timestamp to date",
  ],
});

export default function UnixTimePage() {
  return <UnixTimeTool />;
}
