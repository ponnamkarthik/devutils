import type { Metadata } from "next";

import { toolMetadata } from "@/lib/seo";
import { CsvJsonTool } from "@/tools/CsvJsonTool";

export const metadata: Metadata = toolMetadata({
  title: "JSON to CSV Converter",
  description:
    "Convert JSON arrays/objects to CSV (via PapaParse) for spreadsheet export, with file upload and copy/download options.",
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
