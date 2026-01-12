import type { Metadata } from "next";

import { toolMetadata } from "@/lib/seo";
import { TermsOfService } from "@/tools/TermsOfService";

export const metadata: Metadata = toolMetadata({
  title: "Terms of Service",
  description: "Terms of service for DevUtils.",
  path: "/terms",
  keywords: [
    "terms of service",
    "terms and conditions",
    "devutils terms",
    "legal",
    "developer tools terms",
  ],
});

export default function TermsPage() {
  return <TermsOfService />;
}
