import type { Metadata } from "next";

import { toolMetadata } from "@/lib/seo";
import { QrCodeTool } from "@/tools/QrCodeTool";

export const metadata: Metadata = toolMetadata({
  title: "QR Code Generator",
  description:
    "Generate QR codes for text and URLs instantly. Download as an image for sharing or printing.",
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
