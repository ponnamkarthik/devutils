import type { Metadata } from "next";

import { toolMetadata } from "@/lib/seo";
import { PrivacyPolicy } from "@/tools/PrivacyPolicy";

export const metadata: Metadata = toolMetadata({
  title: "Privacy Policy",
  description: "Privacy policy for DevUtils.",
  path: "/privacy",
  keywords: [
    "privacy policy",
    "data privacy",
    "user privacy",
    "devutils privacy",
    "developer tools privacy",
  ],
});

export default function PrivacyPage() {
  return <PrivacyPolicy />;
}
