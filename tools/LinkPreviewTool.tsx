"use client";

import React, { useState, useEffect } from "react";
import { Button, Card, Input } from "../components/UI";
import { MonacoEditor } from "../components/MonacoEditor";
import {
  Search,
  Globe,
  Image as ImageIcon,
  Link as LinkIcon,
  Share2,
  Loader2,
  Trash2,
  Code,
  Download,
  RefreshCw,
  AlertTriangle,
  Eye,
  Copy,
  Check,
  MessageSquare,
  Layout,
} from "lucide-react";
import { useLocalStorage } from "../hooks/useLocalStorage";

export const LinkPreviewTool: React.FC = () => {
  const [url, setUrl] = useLocalStorage(
    "meta-url",
    "https://devutils.karthikponnam.dev/"
  );
  const [title, setTitle] = useLocalStorage(
    "meta-title",
    "DevUtils - Offline Developer Tools"
  );
  const [description, setDescription] = useLocalStorage(
    "meta-desc",
    "A suite of offline-first, client-side developer tools including JSON formatters, SQL beautifiers, and more."
  );
  const [image, setImage] = useLocalStorage(
    "meta-image",
    "https://devutils.karthikponnam.dev/opengraph-image"
  );
  const [siteName, setSiteName] = useLocalStorage("meta-sitename", "DevUtils");

  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "social" | "search" | "chat" | "code"
  >("social");
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    document.title = "Link Preview & Meta Tags - DevUtils";
  }, []);

  const extractMetadata = (doc: Document) => {
    const getMeta = (prop: string) =>
      doc.querySelector(`meta[property="${prop}"]`)?.getAttribute("content") ||
      doc.querySelector(`meta[name="${prop}"]`)?.getAttribute("content");

    const extractedTitle =
      getMeta("og:title") ||
      getMeta("twitter:title") ||
      doc.querySelector("title")?.innerText;
    const extractedDesc =
      getMeta("og:description") ||
      getMeta("twitter:description") ||
      getMeta("description");
    const extractedImage = getMeta("og:image") || getMeta("twitter:image");
    const extractedUrl =
      getMeta("og:url") ||
      doc.querySelector('link[rel="canonical"]')?.getAttribute("href");
    const extractedSite = getMeta("og:site_name");

    if (extractedTitle) setTitle(extractedTitle);
    if (extractedDesc) setDescription(extractedDesc);
    if (extractedImage) {
      // Handle relative URLs for images if possible (proxy context makes this tricky, but we try best effort)
      try {
        if (!extractedImage.startsWith("http")) {
          // Best guess reconstruction if we have the original URL context
          const baseUrl = new URL(url).origin;
          // Remove leading slash if both have it to avoid double slash issues, or join carefully
          const cleanPath = extractedImage.startsWith("/")
            ? extractedImage
            : "/" + extractedImage;
          setImage(baseUrl + cleanPath);
        } else {
          setImage(extractedImage);
        }
      } catch {
        setImage(extractedImage);
      }
    }
    if (extractedUrl) setUrl(extractedUrl);
    if (extractedSite) setSiteName(extractedSite);
  };

  const fetchMetadata = async () => {
    if (!url) return;
    setIsLoading(true);
    setFetchError(null);

    try {
      let targetUrl = url;
      if (!targetUrl.startsWith("http")) {
        targetUrl = "https://" + targetUrl;
        setUrl(targetUrl);
      }

      // Use AllOrigins Proxy to bypass CORS
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;

      const response = await fetch(proxyUrl);
      if (!response.ok) throw new Error("Network response was not ok");

      const data = await response.json();
      const html = data.contents;

      if (!html)
        throw new Error("No content returned (or site blocks proxies)");

      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");

      extractMetadata(doc);
    } catch (err: any) {
      console.error(err);
      setFetchError(
        "Failed to fetch. The URL might be invalid or the site blocks automated access."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getDomain = (u: string) => {
    try {
      return new URL(u).hostname.replace("www.", "");
    } catch {
      return "example.com";
    }
  };

  const domain = getDomain(url);

  // Generate HTML Meta Tags
  const generatedCode = `<!-- Primary Meta Tags -->
<title>${title}</title>
<meta name="title" content="${title}" />
<meta name="description" content="${description}" />

<!-- Open Graph / Facebook -->
<meta property="og:type" content="website" />
<meta property="og:url" content="${url}" />
<meta property="og:title" content="${title}" />
<meta property="og:description" content="${description}" />
<meta property="og:image" content="${image}" />
${siteName ? `<meta property="og:site_name" content="${siteName}" />` : ""}

<!-- Twitter -->
<meta property="twitter:card" content="summary_large_image" />
<meta property="twitter:url" content="${url}" />
<meta property="twitter:title" content="${title}" />
<meta property="twitter:description" content="${description}" />
<meta property="twitter:image" content="${image}" />`;

  const copyCode = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    // Responsive container: Auto height on mobile, fixed calc height on desktop
    <div className="flex flex-col gap-4 lg:gap-6 h-auto lg:h-[calc(100vh-10rem)] min-h-[600px] w-full">
      {/* Top Action Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 bg-card p-4 rounded-xl border border-border shadow-sm flex-none">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-lg shrink-0">
            <Share2 className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-foreground">
              Link Preview
            </h1>
            <p className="text-xs text-muted-foreground hidden sm:block">
              Generate meta tags & preview social cards.
            </p>
          </div>
        </div>

        <div className="flex-1 flex gap-2 relative">
          <div className="relative flex-1">
            <Globe className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              className="w-full h-9 pl-9 pr-3 rounded-md border border-input bg-background text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary placeholder:text-muted-foreground"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              onKeyDown={(e) => e.key === "Enter" && fetchMetadata()}
            />
          </div>
          <Button
            onClick={fetchMetadata}
            disabled={isLoading}
            className="shrink-0"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Fetch
          </Button>
        </div>
      </div>

      {fetchError && (
        <div className="flex items-start gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-lg border border-destructive/20 animate-in fade-in slide-in-from-top-2">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          <span className="leading-tight">{fetchError}</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
        {/* Left: Editor Panel */}
        {/* On mobile: auto height. On desktop: full height with scroll */}
        <div className="lg:col-span-4 flex flex-col gap-4 lg:overflow-y-auto pr-1 custom-scrollbar h-auto lg:h-full">
          <Card className="flex flex-col gap-5 p-4 border-border/60 shadow-sm h-fit">
            <div className="flex items-center justify-between pb-2 border-b border-border/40">
              <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Metadata
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setTitle("");
                  setDescription("");
                  setImage("");
                  setSiteName("");
                }}
                className="h-6 text-xs text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-3 w-3 mr-1" /> Clear
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-foreground mb-1.5 block">
                  Title
                </label>
                <input
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Page Title"
                />
                <div className="flex justify-end mt-1">
                  <span
                    className={`text-[10px] ${title.length > 60 ? "text-amber-500" : "text-muted-foreground"}`}
                  >
                    {title.length}/60 recommended
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-foreground mb-1.5 block">
                  Description
                </label>
                <textarea
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary resize-y min-h-[100px]"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Page description..."
                />
                <div className="flex justify-end mt-1">
                  <span
                    className={`text-[10px] ${description.length > 160 ? "text-amber-500" : "text-muted-foreground"}`}
                  >
                    {description.length}/160 recommended
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-foreground mb-1.5 block">
                  Image URL
                </label>
                <div className="flex gap-2">
                  <input
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="https://..."
                  />
                </div>
                {image && (
                  <div className="mt-2 rounded-lg overflow-hidden border border-border bg-muted/20 aspect-video relative group">
                    <img
                      src={image}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-white text-xs font-medium">
                        Image Preview
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-medium text-foreground mb-1.5 block">
                  Site Name
                </label>
                <input
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  placeholder="Brand Name"
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Right: Previews */}
        <div className="lg:col-span-8 flex flex-col gap-4 h-auto lg:h-full min-h-0">
          {/* Tabs - Scrollable on mobile */}
          <div className="flex bg-muted rounded-lg p-1 self-start overflow-x-auto max-w-full no-scrollbar">
            {[
              { id: "social", label: "Social Cards", icon: Share2 },
              { id: "search", label: "Search Result", icon: Search },
              { id: "chat", label: "Chat Apps", icon: MessageSquare },
              { id: "code", label: "Get Code", icon: Code },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`
                              flex items-center gap-2 px-4 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap
                              ${
                                activeTab === tab.id
                                  ? "bg-background shadow-sm text-foreground"
                                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                              }
                          `}
              >
                <tab.icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Preview Content Area */}
          <div className="lg:flex-1 lg:overflow-y-auto custom-scrollbar p-1">
            {/* --- Social Cards --- */}
            {activeTab === "social" && (
              <div className="space-y-8 max-w-xl mx-auto lg:mx-0">
                {/* Facebook / Open Graph */}
                <div className="space-y-2 w-full">
                  <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <Layout className="h-3.5 w-3.5" /> Facebook / Open Graph
                  </div>
                  <div className="rounded-lg border border-[#dadde1] bg-[#f0f2f5] dark:bg-[#242526] dark:border-[#3e4042] overflow-hidden w-full max-w-[524px]">
                    <div className="aspect-[1.91/1] bg-gray-200 dark:bg-gray-800 relative overflow-hidden flex items-center justify-center">
                      {image ? (
                        <img
                          src={image}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="h-12 w-12 text-gray-400" />
                      )}
                    </div>
                    <div className="p-3 bg-[#f2f3f5] dark:bg-[#242526] border-t border-[#dadde1] dark:border-[#3e4042]">
                      <div className="text-[12px] text-[#606770] dark:text-[#b0b3b8] uppercase truncate mb-0.5">
                        {domain}
                      </div>
                      <div className="text-[16px] font-bold text-[#1d2129] dark:text-[#e4e6eb] leading-tight mb-1 line-clamp-2">
                        {title || "No Title"}
                      </div>
                      <div className="text-[14px] text-[#606770] dark:text-[#b0b3b8] line-clamp-1">
                        {description || "No description"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Twitter Large Card */}
                <div className="space-y-2 w-full">
                  <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <Share2 className="h-3.5 w-3.5" /> Twitter / X (Large)
                  </div>
                  <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-black overflow-hidden w-full max-w-[500px]">
                    <div className="aspect-[2/1] bg-gray-100 dark:bg-gray-900 relative overflow-hidden flex items-center justify-center">
                      {image ? (
                        <img
                          src={image}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="h-12 w-12 text-gray-400" />
                      )}
                      <div className="absolute bottom-3 left-3 bg-black/60 text-white text-[11px] font-medium px-1.5 py-0.5 rounded">
                        {domain}
                      </div>
                    </div>
                    <div className="p-3 bg-white dark:bg-black text-left">
                      <div className="text-[15px] text-gray-900 dark:text-[#e7e9ea] leading-5 mb-0.5 font-sans truncate">
                        {title || "No Title"}
                      </div>
                      <div className="text-[15px] text-[#536471] dark:text-[#71767b] leading-5 font-sans line-clamp-2">
                        {description || "No description"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* --- Search Result --- */}
            {activeTab === "search" && (
              <div className="space-y-8 max-w-xl mx-auto lg:mx-0">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <Search className="h-3.5 w-3.5" /> Google Search
                  </div>
                  <div className="p-4 bg-white dark:bg-[#202124] border-transparent shadow-none font-sans rounded-xl overflow-hidden">
                    <div className="flex flex-col gap-1 max-w-full">
                      <div className="flex items-center gap-3 text-sm text-[#202124] dark:text-[#dadce0] mb-1">
                        <div className="w-7 h-7 shrink-0 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden border border-gray-200 dark:border-gray-600">
                          {image ? (
                            <img
                              src={image}
                              className="w-full h-full object-cover"
                              alt=""
                              onError={(e) =>
                                (e.currentTarget.style.display = "none")
                              }
                            />
                          ) : (
                            <Globe className="h-4 w-4 text-gray-400" />
                          )}
                        </div>
                        <div className="flex flex-col leading-tight min-w-0">
                          <span className="font-medium text-[14px] truncate">
                            {siteName || domain}
                          </span>
                          <span className="text-[12px] opacity-70 truncate">
                            {url}
                          </span>
                        </div>
                      </div>
                      <div className="text-[#1a0dab] dark:text-[#8ab4f8] text-[20px] leading-[26px] font-medium hover:underline cursor-pointer truncate">
                        {title || "No Title"}
                      </div>
                      <div className="text-[14px] leading-[22px] text-[#4d5156] dark:text-[#bdc1c6] line-clamp-2 break-words">
                        {description ||
                          "No description available for this page."}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* --- Chat Apps --- */}
            {activeTab === "chat" && (
              <div className="space-y-8 max-w-xl mx-auto lg:mx-0">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <MessageSquare className="h-3.5 w-3.5" /> Discord / Slack
                  </div>
                  <div className="pl-3 border-l-4 border-l-[#e3e5e8] dark:border-l-[#4f545c] bg-[#f2f3f5] dark:bg-[#2f3136] p-3 rounded-r w-full max-w-[400px]">
                    <div className="text-xs text-indigo-500 dark:text-indigo-400 mb-1 font-medium hover:underline cursor-pointer truncate">
                      {siteName || domain}
                    </div>
                    <div className="text-[14px] font-semibold text-[#060607] dark:text-[#dcddde] mb-1 hover:underline cursor-pointer hover:text-[#00b0f4] truncate">
                      {title || "No Title"}
                    </div>
                    <div className="text-[13px] text-[#2e3338] dark:text-[#b9bbbe] mb-2 leading-relaxed break-words line-clamp-3">
                      {description || "No description"}
                    </div>
                    {image && (
                      <div className="rounded-lg overflow-hidden max-w-full border border-black/5 dark:border-white/5">
                        <img
                          src={image}
                          alt=""
                          className="w-full h-auto object-cover max-h-[300px]"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* --- Code Output --- */}
            {activeTab === "code" && (
              <div className="h-[400px] lg:h-full flex flex-col">
                <Card className="flex-1 p-0 border-border/60 shadow-sm bg-card overflow-hidden flex flex-col">
                  <div className="flex items-center justify-between p-2 px-3 border-b border-border/20 bg-muted/20">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      HTML Meta Tags
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={copyCode}
                      className="h-6 px-2 text-xs hover:bg-background border border-transparent hover:border-border"
                    >
                      {copiedCode ? (
                        <Check className="h-3 w-3 mr-1 text-emerald-500" />
                      ) : (
                        <Copy className="h-3 w-3 mr-1" />
                      )}
                      {copiedCode ? "Copied" : "Copy"}
                    </Button>
                  </div>
                  <MonacoEditor
                    value={generatedCode}
                    language="html"
                    readOnly
                    lineNumbers="off"
                    className="border-none"
                  />
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
