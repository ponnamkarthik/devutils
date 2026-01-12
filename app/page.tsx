import type { Metadata } from "next";

import { toolMetadata } from "@/lib/seo";
import { Home } from "@/tools/Home";

export const metadata: Metadata = toolMetadata({
  title: "Developer Tools",
  description:
    "Free online developer tools for formatting, converting, encoding, and debugging. Fast, private, and browser-based utilities.",
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
