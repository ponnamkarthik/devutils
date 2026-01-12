import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JSON Formatter & Validator - Format, Minify & Fix JSON Online",
  description:
    "Free online JSON formatter, validator, and beautifier. Format, minify, and fix broken JSON with syntax highlighting. Supports large files and provides detailed error messages.",
  keywords: [
    "json formatter",
    "json validator",
    "json beautifier",
    "json minifier",
    "json tool",
    "format json online",
    "validate json",
  ],
  openGraph: {
    title: "JSON Formatter & Validator - DevUtils",
    description:
      "Format, validate, and beautify JSON online with our free JSON formatter tool.",
    type: "website",
  },
  alternates: {
    canonical: "/json/format",
  },
};

export default function JsonFormatterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
