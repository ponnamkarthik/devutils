import type { Metadata } from "next";

import { toolMetadata } from "@/lib/seo";
import { SqlTool } from "@/tools/SqlTool";

export const metadata: Metadata = toolMetadata({
  title: "SQL Formatter",
  description:
    "Format SQL for readability with dialect support (PostgreSQL, MySQL/MariaDB, SQLite, SQL Server T-SQL, Oracle PL/SQL).",
  path: "/sql",
  keywords: [
    "sql formatter",
    "format sql",
    "sql beautifier",
    "sql pretty print",
    "sql prettify",
    "sql formatter online",
  ],
});

export default function SqlPage() {
  return <SqlTool />;
}
