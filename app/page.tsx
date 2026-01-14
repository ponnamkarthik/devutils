import type { Metadata } from "next";

import { toolMetadata } from "@/lib/seo";
import { Home } from "@/tools/Home";

export const metadata: Metadata = toolMetadata({
  title: "Developer Tools & Utilities (JSON, Base64, UUID, Regex)",
  description:
    "Fast, privacy-friendly developer utilities: JSON format/minify/fix/graph, Base64 encode/decode, URL parse/encode/decode, JWT decode, SQL format, HTTP request builder, regex tester, UUIDs, timestamps, and more.",
  path: "/",
  keywords: [
    "developer tools",
    "developer utilities",
    "offline developer tools",
    "web developer tools",
    "online tools",
    "dev utils",
    "json formatter",
    "uuid generator",
  ],
});

export default function HomePage() {
  return <Home />;
}
