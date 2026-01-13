import type { Metadata } from "next";

import { toolMetadata } from "@/lib/seo";
import { LinkPreviewTool } from "@/tools/LinkPreviewTool";

export const metadata: Metadata = toolMetadata({
  title: "Link Preview",
  description:
    "Preview Open Graph/Twitter Card metadata for any URL and generate the meta tags needed for rich link embeds.",
  path: "/link-preview",
  keywords: [
    "link preview",
    "meta tags generator",
    "open graph",
    "twitter card",
    "seo preview",
  ],
});

export default function LinkPreviewPage() {
  return <LinkPreviewTool />;
}
