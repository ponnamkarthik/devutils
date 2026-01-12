import type { Metadata } from "next";

import { toolMetadata } from "@/lib/seo";
import { UnixTimeTool } from "@/tools/UnixTimeTool";

export const metadata: Metadata = toolMetadata({
  title: "Unix Time Converter",
  description:
    "Convert between Unix timestamps and human-readable dates. Works in seconds and milliseconds.",
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
