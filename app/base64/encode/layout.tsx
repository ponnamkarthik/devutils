import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Base64 Encoder & Decoder - Encode and Decode Base64 Online",
  description:
    "Free online Base64 encoder and decoder. Convert text to Base64 or decode Base64 to text. Supports file encoding and decoding with instant results.",
  keywords: [
    "base64 encoder",
    "base64 decoder",
    "base64 converter",
    "encode base64",
    "decode base64",
    "base64 tool",
  ],
  openGraph: {
    title: "Base64 Encoder & Decoder - DevUtils",
    description:
      "Encode and decode Base64 strings instantly with our free online tool.",
  },
  alternates: {
    canonical: "/base64/encode",
  },
};

export default function Base64Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
