#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import process from "node:process";

const defaultSeedPath = "content/blog.seed.json";
const mediaTypes = new Set(["video", "file", "external_object_instance"]);

function parseArgs() {
  const args = {
    seed: defaultSeedPath,
    json: false,
    failOnWarnings: false,
  };

  for (let index = 2; index < process.argv.length; index += 1) {
    const arg = process.argv[index];
    if (arg === "--json") {
      args.json = true;
    } else if (arg === "--fail-on-warnings") {
      args.failOnWarnings = true;
    } else if (arg === "--seed") {
      args.seed = process.argv[index + 1] || "";
      index += 1;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return args;
}

function youtubeEmbedUrl(source = "") {
  try {
    const url = new URL(source);
    const host = url.hostname.replace(/^www\./, "");
    if (host === "youtu.be") {
      return url.pathname.split("/").filter(Boolean)[0] || "";
    }
    if (["youtube.com", "m.youtube.com", "music.youtube.com"].includes(host)) {
      return url.pathname.match(/^\/embed\/([^/?#]+)/)?.[1]
        || url.pathname.match(/^\/shorts\/([^/?#]+)/)?.[1]
        || url.searchParams.get("v")
        || "";
    }
  } catch {
    return "";
  }

  return "";
}

function sourceKind(source = "") {
  if (!source) return "missing-source";
  if (youtubeEmbedUrl(source)) return "youtube";

  try {
    const host = new URL(source).hostname;
    if (host.includes("amazonaws.com") || host.includes("notion-static.com") || host.includes("prod-files-secure")) {
      return "notion-secure-file";
    }
    return host;
  } catch {
    return "unparseable-source";
  }
}

function walkBlocks(post, blocks = [], ancestors = [], warnings = []) {
  for (const block of blocks) {
    const label = block.plainText || block.type || "block";
    const path = [...ancestors, label].filter(Boolean);

    if (block.type === "video" && sourceKind(block.source) !== "youtube") {
      warnings.push({
        severity: "warning",
        code: "blog-video-needs-youtube-repair",
        postTitle: post.title,
        slug: post.slug,
        postUrl: post.canonical?.url || `https://ronniewong.cc/blog/${encodeURIComponent(post.slug)}/`,
        notionUrl: post.notionUrl,
        blockId: block.id,
        blockType: block.type,
        blockTitle: block.plainText || "",
        sourceKind: sourceKind(block.source),
        source: block.source || "",
        path: path.join(" > "),
        message: "Non-YouTube video block will render as a Notion fallback until a human uploads it to YouTube and updates the Notion source block.",
      });
    } else if (mediaTypes.has(block.type) && !block.assetPath && sourceKind(block.source) !== "youtube") {
      warnings.push({
        severity: "warning",
        code: "blog-media-needs-human-repair",
        postTitle: post.title,
        slug: post.slug,
        postUrl: post.canonical?.url || `https://ronniewong.cc/blog/${encodeURIComponent(post.slug)}/`,
        notionUrl: post.notionUrl,
        blockId: block.id,
        blockType: block.type,
        blockTitle: block.plainText || "",
        sourceKind: sourceKind(block.source),
        source: block.source || "",
        path: path.join(" > "),
        message: "Unsupported media block has no local asset or YouTube source; keep it as a publish warning and repair manually.",
      });
    }

    walkBlocks(post, block.children || [], path, warnings);
  }

  return warnings;
}

function summarize(warnings) {
  const byCode = {};
  const byPost = {};
  for (const warning of warnings) {
    byCode[warning.code] = (byCode[warning.code] || 0) + 1;
    byPost[warning.slug] = (byPost[warning.slug] || 0) + 1;
  }
  return { totalWarnings: warnings.length, byCode, byPost };
}

function printTextReport(warnings) {
  const summary = summarize(warnings);
  console.log(`Blog media warnings: ${summary.totalWarnings}`);
  for (const warning of warnings) {
    console.log(`- [${warning.code}] ${warning.slug}`);
    console.log(`  title: ${warning.postTitle}`);
    console.log(`  block: ${warning.blockTitle || warning.blockType} (${warning.blockId})`);
    console.log(`  source: ${warning.source || warning.sourceKind}`);
    console.log(`  notion: ${warning.notionUrl}`);
  }
}

async function main() {
  const args = parseArgs();
  const payload = JSON.parse(await readFile(args.seed, "utf8"));
  const warnings = [];
  for (const post of payload.posts || []) {
    if (post.public === false) continue;
    walkBlocks(post, post.content?.blocks || [], [], warnings);
  }

  if (args.json) {
    console.log(JSON.stringify({ ...summarize(warnings), warnings }, null, 2));
  } else {
    printTextReport(warnings);
  }

  if (args.failOnWarnings && warnings.length > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(`[error] ${error.message}`);
  process.exitCode = 1;
});
