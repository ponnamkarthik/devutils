import { Metadata } from "next";

export const metadata: Metadata = {
  title: "JSON Tools - Format, Minify, Validate & Convert",
  description:
    "Comprehensive JSON tools for formatting, minifying, validating, fixing errors, visualizing as graphs, and converting JSON data structures. Free online JSON utilities.",
  keywords: [
    "json formatter",
    "json validator",
    "json minifier",
    "json beautifier",
    "json converter",
    "json graph",
    "json tree viewer",
  ],
  openGraph: {
    title: "JSON Tools - Format, Minify, Validate & Convert",
    description:
      "Comprehensive JSON tools for formatting, minifying, validating, fixing errors, and visualizing JSON data.",
  },
};

export default function JsonLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
