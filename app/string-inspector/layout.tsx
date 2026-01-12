import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "String Inspector",
  description:
    "Analyze text with grapheme-aware character counts, bytes, word frequency, and Unicode details.",
  alternates: {
    canonical: "/string-inspector",
  },
  openGraph: {
    title: "String Inspector",
    description:
      "Analyze text with grapheme-aware character counts, bytes, word frequency, and Unicode details.",
    url: "/string-inspector",
  },
};

export default function StringInspectorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
