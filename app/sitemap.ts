import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://devutils.karthikponnam.dev";
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
    "/hex",
    "/regex",
    "/url/parser",
    "/url/encode",
    "/url/decode",
    "/yaml/json",
    "/yaml/yaml",
    "/toml/json",
    "/toml/toml",
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
    "/api-docs",
    "/log-inspector",
    "/string-inspector",
    "/color",
    "/svg",
    "/css-units",
    "/css-grid",
    "/world-clock",
    "/unix-time",
    "/jwt",
    "/http-builder",
    "/markdown",
    "/speed-test",
    "/link-preview",
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
