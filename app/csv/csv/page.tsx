import type { Metadata } from "next";

import { toolMetadata } from "@/lib/seo";
import { CsvJsonTool } from "@/tools/CsvJsonTool";

export const metadata: Metadata = toolMetadata({
  title: "JSON to CSV Converter",
  description:
    "Convert JSON to CSV instantly. Export API payloads into spreadsheet-friendly CSV.",
  path: "/csv/csv",
  keywords: [
    "json to csv",
    "convert json",
    "csv export",
    "json to csv online",
    "csv generator",
    "json converter",
  ],
});

export default function CsvPage() {
  return <CsvJsonTool mode="csv" />;
}
