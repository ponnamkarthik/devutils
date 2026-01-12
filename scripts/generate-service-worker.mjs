import { promises as fs } from "node:fs";
import { execSync } from "node:child_process";
import path from "node:path";

function getBuildVersion() {
  const envSha =
    process.env.VERCEL_GIT_COMMIT_SHA ||
    process.env.GITHUB_SHA ||
    process.env.CI_COMMIT_SHA ||
    process.env.COMMIT_SHA;

  if (envSha && typeof envSha === "string") {
    return envSha.slice(0, 12);
  }

  try {
    const gitSha = execSync("git rev-parse --short HEAD", {
      stdio: ["ignore", "pipe", "ignore"],
    })
      .toString()
      .trim();

    if (gitSha) return gitSha;
  } catch {
    // ignore
  }

  // Fallback: stable-ish build id (UTC timestamp)
  return new Date()
    .toISOString()
    .replace(/[-:.TZ]/g, "")
    .slice(0, 14);
}

async function main() {
  const repoRoot = process.cwd();
  const templatePath = path.join(
    repoRoot,
    "public",
    "service-worker.template.js"
  );
  const outPath = path.join(repoRoot, "public", "service-worker.js");

  const version = getBuildVersion();
  const template = await fs.readFile(templatePath, "utf8");

  if (!template.includes("__CACHE_VERSION__")) {
    throw new Error(
      "service-worker.template.js is missing __CACHE_VERSION__ placeholder"
    );
  }

  const output = template.replaceAll("__CACHE_VERSION__", version);
  await fs.writeFile(outPath, output, "utf8");

  // eslint-disable-next-line no-console
  console.log(`[pwa] Generated service-worker.js CACHE_VERSION=${version}`);
}

await main();
