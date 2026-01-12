import type { Metadata } from "next";
import { Layout as AppLayout } from "@/components/LayoutNext";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import "./globals.css";

export const viewport = {
  themeColor: "#000000",
  colorScheme: "dark light",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://devutils.karthikponnam.dev"),
  applicationName: "DevUtils",
  title: {
    default: "DevUtils - Developer Tools & Utilities Collection",
    template: "%s | DevUtils",
  },
  description:
    "Free online developer tools for formatting, converting, encoding, and debugging. JSON formatter, Base64 encoder, UUID generator, regex tester, and 20+ more utilities.",
  keywords: [
    "developer tools",
    "json formatter",
    "base64 encoder",
    "uuid generator",
    "regex tester",
    "code formatter",
    "hash generator",
    "url encoder",
    "yaml to json",
    "csv to json",
    "developer utilities",
    "web tools",
  ],
  authors: [{ name: "DevUtils" }],
  creator: "DevUtils",
  publisher: "DevUtils",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://devutils.karthikponnam.dev",
    title: "DevUtils - Developer Tools & Utilities",
    description:
      "Free online developer tools for formatting, converting, encoding, and debugging.",
    siteName: "DevUtils",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "DevUtils - Developer Tools & Utilities",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DevUtils - Developer Tools & Utilities",
    description:
      "Free online developer tools for formatting, converting, encoding, and debugging.",
    images: ["/twitter-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/icon-192.png",
    shortcut: "/icon.svg",
    apple: "/icon-192.png",
  },
  manifest: "/site.webmanifest",
  appleWebApp: {
    capable: true,
    title: "DevUtils",
    statusBarStyle: "default",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ServiceWorkerRegister />
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  );
}
