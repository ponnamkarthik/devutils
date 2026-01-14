import type { Metadata } from "next";

const SITE_NAME = "DevUtils";
const TITLE_SUFFIX = "Free Online Developer Tools";
const META_DESCRIPTION_MAX_LENGTH = 160;
const DEFAULT_OG_IMAGE = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: "DevUtils - Developer Tools & Utilities",
} as const;

function normalizeMetaDescription(description: string): string {
  const normalized = description.replace(/\s+/g, " ").trim();
  if (normalized.length <= META_DESCRIPTION_MAX_LENGTH) return normalized;

  // Prefer a natural first sentence when possible.
  const sentenceEndIndex = normalized.search(/[.!?]\s/);
  if (sentenceEndIndex > 0) {
    const firstSentence = normalized.slice(0, sentenceEndIndex + 1).trim();
    if (
      firstSentence.length >= 60 &&
      firstSentence.length <= META_DESCRIPTION_MAX_LENGTH
    ) {
      return firstSentence;
    }
  }

  // Fallback: truncate at a word boundary and add an ellipsis.
  const hardLimit = META_DESCRIPTION_MAX_LENGTH - 1; // for …
  const truncated = normalized.slice(0, hardLimit);
  const lastSpace = truncated.lastIndexOf(" ");
  const safe = lastSpace > 80 ? truncated.slice(0, lastSpace) : truncated;
  return `${safe}…`;
}

export function toolMetadata(params: {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
}): Metadata {
  const { title, description, path, keywords } = params;

  // Ensure the HTML <title> is long enough for SEO and consistently branded.
  // Example: "JWT Debugger | DevUtils – Free Online Developer Tools"
  const seoTitle = `${title} | ${SITE_NAME} – ${TITLE_SUFFIX}`;
  const metaDescription = normalizeMetaDescription(description);

  return {
    title: {
      absolute: seoTitle,
    },
    description: metaDescription,
    ...(keywords && keywords.length > 0 ? { keywords } : {}),
    alternates: {
      canonical: path,
    },
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description: metaDescription,
      url: path,
      siteName: SITE_NAME,
      type: "website",
      images: [DEFAULT_OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${SITE_NAME}`,
      description: metaDescription,
      images: ["/twitter-image"],
    },
  };
}
