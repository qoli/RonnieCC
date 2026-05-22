#!/usr/bin/env node
import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { compactId, fetchCollection, fetchPageById, idToUuid, notionText, recordValue, rowsFromCollection } from "./notion-sync/notion-api.mjs";

const databaseId = "60ac1b36c401837598a501cc8b7ea241";
const collectionId = "0bdc1b36c401828b875a87505f6c4363";
const collectionViewId = "e90c1b36c401831d99bf08f10dcbae9b";
const sourceUrl = "https://www.notion.so/qoli/60ac1b36c401837598a501cc8b7ea241?v=e90c1b36c401831d99bf08f10dcbae9b&source=copy_link";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const outputPath = path.join(repoRoot, "content", "blog.seed.json");
const assetRoot = path.join(repoRoot, "content", "blog-assets");
const siteUrl = "https://ronniewong.cc";
const defaultPublishTarget = "ronniecc";
const subsiteFieldNames = ["子站點", "子站点", "Subsites"];
const assetDownloadTimeoutMs = 120_000;

function titleSlug(title) {
  return String(title || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function postSlug(row) {
  const base = titleSlug(row.Name);
  return base ? `${base}-${compactId(row.id).slice(0, 8)}` : compactId(row.id);
}

function notionPageUrl(row) {
  const title = titleSlug(row.Name);
  const prefix = title ? `${encodeURIComponent(title)}-` : "";
  return `https://www.notion.so/qoli/${prefix}${compactId(row.id)}?v=${compactId(collectionViewId)}&source=copy_link`;
}

function blogPostUrl(slug) {
  return `${siteUrl}/blog/${encodeURIComponent(slug)}/`;
}

function isPublic(row) {
  return row["公開"] === true || row["公開"] === "__YES__" || row["公開"] === "Yes";
}

function normalizeSubsiteName(value) {
  return String(value || "")
    .trim()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function subsites(row) {
  const raw = subsiteFieldNames.map((fieldName) => row[fieldName]).find((value) => value);
  const values = Array.isArray(raw) ? raw : String(raw || "").split(",");
  return [...new Set(values.map(normalizeSubsiteName).filter((value) => value && value !== defaultPublishTarget))];
}

function richTextSegments(value) {
  if (!Array.isArray(value)) return [];

  return value
    .map((part) => {
      const annotations = Array.isArray(part?.[1]) ? part[1] : [];
      const linkMention = annotations.find((annotation) => annotation?.[0] === "lm")?.[1] || {};
      const link = annotations.find((annotation) => annotation?.[0] === "a")?.[1] || linkMention.href || "";
      const text = String(part?.[0] || "");
      return {
        text: text === "‣" && linkMention.title ? String(linkMention.title) : text,
        annotations: annotations.map((annotation) => annotation?.[0]).filter(Boolean),
        href: link,
      };
    })
    .filter((segment) => segment.text);
}

function blockRichText(block, property = "title") {
  return richTextSegments(block.properties?.[property]);
}

function blockTableCells(block) {
  return Object.fromEntries(
    Object.entries(block.properties || {})
      .map(([key, value]) => [key, richTextSegments(value)])
      .filter(([, segments]) => segments.length)
  );
}

function plainProperty(block, property) {
  return notionText(block.properties?.[property]);
}

function attachmentFileName(source) {
  let fileName = String(source || "").split(":").pop() || "notion-asset";
  if (/^https?:\/\//.test(String(source))) {
    try {
      fileName = decodeURIComponent(new URL(source).pathname.split("/").pop() || fileName);
    } catch {
      fileName = String(source).split("/").pop() || fileName;
    }
  }

  return fileName
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96) || "notion-asset";
}

async function signedFileUrl(source, blockId, notionToken) {
  if (!source || (!source.startsWith("attachment:") && !/^https?:\/\//.test(source))) return "";
  if (/^https?:\/\//.test(source)) {
    const hostname = new URL(source).hostname;
    if (!hostname.endsWith("notion.so") && !hostname.endsWith("amazonaws.com")) return source;
  }

  const response = await fetch("https://www.notion.so/api/v3/getSignedFileUrls", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(notionToken ? { cookie: `token_v2=${notionToken}` } : {}),
    },
    body: JSON.stringify({
      urls: [
        {
          url: source,
          permissionRecord: {
            table: "block",
            id: idToUuid(blockId),
          },
        },
      ],
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Notion getSignedFileUrls failed with ${response.status} for block ${compactId(blockId)} source ${source}: ${body.slice(0, 300)}`);
  }

  const payload = await response.json();
  return payload.signedUrls?.[0] || "";
}

async function downloadAsset(url, targetPath) {
  const response = await fetch(url, { signal: AbortSignal.timeout(assetDownloadTimeoutMs) });
  if (!response.ok) {
    throw new Error(`Downloading Notion asset failed with ${response.status}`);
  }

  await mkdir(path.dirname(targetPath), { recursive: true });
  await writeFile(targetPath, Buffer.from(await response.arrayBuffer()));
}

async function attachLocalAsset(block, post, notionToken) {
  if (!["image"].includes(block.type) || !block.source) return block;

  const fileName = `${block.id}-${attachmentFileName(block.source)}`;
  const relativePath = path.posix.join("blog-assets", post.id, fileName);
  const targetPath = path.join(assetRoot, post.id, fileName);
  const url = await signedFileUrl(block.source, block.id, notionToken);

  if (url) {
    await downloadAsset(url, targetPath);
    block.assetPath = `content/${relativePath}`;
  }

  return block;
}

async function attachLocalAssets(blocks, post, notionToken) {
  for (const block of blocks) {
    await attachLocalAsset(block, post, notionToken);
    if (block.children?.length) {
      await attachLocalAssets(block.children, post, notionToken);
    }
  }
  return blocks;
}

function normalizeBlock(block, blockMap) {
  const value = recordValue(block);
  const type = value.type || "unsupported";
  const normalized = {
    id: compactId(value.id),
    type,
    richText: blockRichText(value),
    plainText: plainProperty(value, "title"),
    caption: blockRichText(value, "caption"),
    language: plainProperty(value, "language"),
    source: plainProperty(value, "source"),
    assetPath: "",
    tableColumns: Array.isArray(value.format?.table_block_column_order) ? value.format.table_block_column_order : [],
    tableHasColumnHeader: value.format?.table_block_column_header === true,
    tableHasRowHeader: value.format?.table_block_row_header === true,
    tableCells: value.type === "table_row" ? blockTableCells(value) : {},
    children: [],
  };

  const hasContent = (child) =>
    child.plainText ||
    child.caption.length ||
    child.source ||
    child.children.length ||
    Object.keys(child.tableCells || {}).length ||
    ["divider", "image", "video", "file", "external_object_instance", "table", "table_row"].includes(child.type);

  if (Array.isArray(value.content) && value.content.length) {
    normalized.children = value.content
      .map((id) => blockMap[id])
      .filter(Boolean)
      .map((child) => normalizeBlock(child, blockMap))
      .filter(hasContent);
  }

  return normalized;
}

async function fetchPostContent(row, notionToken) {
  const page = await fetchPageById(row.id, notionToken);
  const blockMap = page.recordMap.block || {};
  const pageId = Object.keys(blockMap).find((id) => compactId(id) === compactId(row.id)) || idToKey(blockMap, row.id);
  const pageBlock = pageId ? recordValue(blockMap[pageId]) : null;
  const childIds = Array.isArray(pageBlock?.content) ? pageBlock.content : [];

  const contentBlocks = childIds
    .map((id) => blockMap[id])
    .filter(Boolean)
    .map((block) => normalizeBlock(block, blockMap))
    .filter(
      (block) =>
        block.plainText ||
        block.caption.length ||
        block.source ||
        block.children.length ||
        Object.keys(block.tableCells || {}).length ||
        ["divider", "image", "video", "file", "external_object_instance", "table", "table_row"].includes(block.type)
    );

  return attachLocalAssets(contentBlocks, row, notionToken);
}

function idToKey(blocks, id) {
  const compact = compactId(id);
  return Object.keys(blocks).find((key) => compactId(key) === compact);
}

function normalizePost(row) {
  const writtenYear = row["編寫日期"] ? String(new Date(row["編寫日期"]).getFullYear()) : "";
  const year = writtenYear || String(row["年份"] || "").trim() || (row.createdTime ? String(new Date(row.createdTime).getFullYear()) : "");
  const slug = postSlug(row);
  const postSubsites = subsites(row);
  return {
    id: compactId(row.id),
    slug,
    title: String(row.Name || "").trim(),
    tag: String(row.Tag || "").trim(),
    year,
    public: isPublic(row),
    subsites: postSubsites,
    publishTargets: [defaultPublishTarget, ...postSubsites],
    canonical: {
      site: defaultPublishTarget,
      url: blogPostUrl(slug),
    },
    notionUrl: notionPageUrl(row),
    createdTime: row.createdTime || "",
    lastEditedTime: row.lastEditedTime || "",
  };
}

async function main() {
  const notionToken = process.env.NOTION_TOKEN || process.env.NOTION_TOKEN_V2;

  const page = await fetchPageById(databaseId, notionToken);
  const collectionRecord = page.recordMap.collection?.[collectionId] || Object.values(page.recordMap.collection || {})[0];
  const collection = recordValue(collectionRecord);

  if (!collectionRecord) {
    throw new Error("Cannot find the Blog collection in the Notion database page.");
  }

  const table = await fetchCollection(collection.id, collectionViewId, notionToken, collection.space_id);
  const rows = rowsFromCollection(collectionRecord, table)
    .map(normalizePost)
    .filter((post) => post.public && post.title)
    .sort((a, b) => {
      const yearDiff = Number(b.year || 0) - Number(a.year || 0);
      if (yearDiff !== 0) return yearDiff;
      return String(b.createdTime).localeCompare(String(a.createdTime));
    });

  await rm(assetRoot, { recursive: true, force: true });

  const posts = [];
  for (const [index, post] of rows.entries()) {
    console.log(`Fetching blog post ${index + 1}/${rows.length}: ${post.title}`);
    posts.push({
      ...post,
      content: {
        source: "notion-v3-page-blocks",
        syncedAt: new Date().toISOString(),
        blocks: await fetchPostContent(post, notionToken),
      },
    });
  }

  const payload = {
    contractVersion: 1,
    generatedAt: new Date().toISOString(),
    source: {
      databaseId,
      collectionId,
      collectionViewId,
      sourceUrl,
    },
    posts,
  };

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`);
  console.log(`Wrote ${posts.length} blog posts to ${path.relative(repoRoot, outputPath)}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
