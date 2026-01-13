import type { Metadata } from "next";

import { toolMetadata } from "@/lib/seo";
import { CsvJsonTool } from "@/tools/CsvJsonTool";

export const metadata: Metadata = toolMetadata({
  title: "CSV to JSON Converter",
  description:
    "Convert CSV files to JSON with parsing via PapaParse, plus copy/download helpers and basic conversion stats.",
  path: "/csv/json",
  keywords: [
    "csv to json",
    "convert csv",
    "csv converter",
    "csv parser",
    "parse csv",
    "csv to json online",
  ],
});

export default function CsvJsonPage() {
  return <CsvJsonTool mode="json" />;
}
