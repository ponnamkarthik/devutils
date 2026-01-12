import { Metadata } from "next";

export const metadata: Metadata = {
  title: "URL Tools - Parse, Encode & Decode URLs",
  description:
    "URL utilities for parsing, encoding, and decoding URLs. Extract URL components, encode/decode URL parameters safely. Free online URL tools.",
  keywords: [
    "url parser",
    "url encoder",
    "url decoder",
    "query string parser",
    "url encode",
    "url decode",
  ],
  openGraph: {
    title: "URL Tools - Parse, Encode & Decode URLs",
    description:
      "URL utilities for parsing, encoding, and decoding URLs and query parameters.",
  },
};

export default function UrlLayout({ children }: { children: React.ReactNode }) {
  return children;
}
