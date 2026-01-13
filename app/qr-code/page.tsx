import type { Metadata } from "next";

import { toolMetadata } from "@/lib/seo";
import { QrCodeTool } from "@/tools/QrCodeTool";

export const metadata: Metadata = toolMetadata({
  title: "QR Code Generator",
  description:
    "Generate customizable QR codes (text/URL) with size, colors, and error correction. Export as PNG or SVG.",
  path: "/qr-code",
  keywords: [
    "qr code generator",
    "qr code maker",
    "generate qr",
    "qr code",
    "qr code for url",
    "qr code online",
  ],
});

export default function QrCodePage() {
  return <QrCodeTool />;
}
