import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Code Tools - Format & Minify Code",
  description:
    "Code formatting and minification tools for JavaScript, TypeScript, HTML, CSS, and more. Beautify or compress your code instantly.",
  keywords: [
    "code formatter",
    "code minifier",
    "javascript formatter",
    "css formatter",
    "html formatter",
    "code beautifier",
  ],
  openGraph: {
    title: "Code Tools - Format & Minify Code",
    description:
      "Format and minify your code with support for multiple programming languages.",
  },
};

export default function CodeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
