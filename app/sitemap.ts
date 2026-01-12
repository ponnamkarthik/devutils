import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://devutils.app";
  const currentDate = new Date().toISOString();

  const routes = [
    "",
    "/json/format",
    "/json/minify",
    "/json/fix",
    "/json/graph",
    "/json/converter",
    "/base64/encode",
    "/base64/decode",
    "/uuid",
    "/hash",
    "/regex",
    "/url/parser",
    "/url/encode",
    "/url/decode",
    "/yaml/json",
    "/yaml/yaml",
    "/csv/json",
    "/csv/csv",
    "/sql",
    "/code/formatter",
    "/code/minifier",
    "/cron",
    "/password",
    "/fake-data",
    "/qr-code",
    "/diff",
    "/string-inspector",
    "/color",
    "/world-clock",
    "/unix-time",
    "/jwt",
    "/http-builder",
    "/markdown",
    "/privacy",
    "/terms",
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: currentDate,
    changeFrequency: "monthly" as const,
    priority: route === "" ? 1.0 : 0.8,
  }));
}
