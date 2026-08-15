#!/usr/bin/env node
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
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
const notionRequestUserAgent = "RonnieCC-Notion-Sync/1.0";
const fullSync =
  process.argv.includes("--full") ||
  process.argv.includes("--force") ||
  process.env.RONNIECC_BLOG_SYNC_MODE === "full" ||
  process.env.RONNIECC_BLOG_FULL_SYNC === "1";

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
  const seoSlug = normalizedSeoSlug(row);
  const base = seoSlug || titleSlug(row.Name);
  return base ? `${base}-${compactId(row.id).slice(0, 8)}` : compactId(row.id);
}

function legacyPostSlug(row) {
  const base = titleSlug(row.Name);
  return base ? `${base}-${compactId(row.id).slice(0, 8)}` : compactId(row.id);
}

function normalizedSeoSlug(row) {
  const value = String(row["SEO Slug"] || "").trim().toLowerCase();
  if (!value) return "";
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) {
    throw new Error(`Invalid SEO Slug for "${row.Name}": "${row["SEO Slug"]}". Use lowercase ASCII words separated by single hyphens.`);
  }
  return value;
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

function validateSeoSlugs(rows) {
  const rowsWithTitle = rows.filter((row) => String(row.Name || "").trim());
  const missingPublic = rowsWithTitle.filter((row) => isPublic(row) && !String(row["SEO Slug"] || "").trim());
  if (missingPublic.length) {
    throw new Error(
      `Missing SEO Slug for public posts: ${missingPublic
        .slice(0, 5)
        .map((row) => `"${row.Name}"`)
        .join(", ")}${missingPublic.length > 5 ? ", ..." : ""}`
    );
  }

  const missingDrafts = rowsWithTitle.filter((row) => !isPublic(row) && !String(row["SEO Slug"] || "").trim());
  if (missingDrafts.length) {
    console.warn(
      `Missing SEO Slug for ${missingDrafts.length} draft posts. Add slugs before publishing: ${missingDrafts
        .slice(0, 5)
        .map((row) => `"${row.Name}"`)
        .join(", ")}${missingDrafts.length > 5 ? ", ..." : ""}`
    );
  }
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
      "user-agent": notionRequestUserAgent,
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

async function readExistingPayload() {
  try {
    return JSON.parse(await readFile(outputPath, "utf8"));
  } catch (error) {
    if (error?.code === "ENOENT") return null;
    throw error;
  }
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
  const writtenDate = row["編寫日期"] ? String(row["編寫日期"]).trim() : "";
  const writtenYear = writtenDate ? String(new Date(writtenDate).getFullYear()) : "";
  const year = writtenYear || String(row["年份"] || "").trim() || (row.createdTime ? String(new Date(row.createdTime).getFullYear()) : "");
  const slug = postSlug(row);
  const seoSlug = normalizedSeoSlug(row);
  const legacySlug = legacyPostSlug(row);
  const postSubsites = subsites(row);
  return {
    id: compactId(row.id),
    slug,
    seoSlug,
    legacySlugs: legacySlug !== slug ? [legacySlug] : [],
    title: String(row.Name || "").trim(),
    tag: String(row.Tag || "").trim(),
    writtenDate,
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
  const allRows = rowsFromCollection(collectionRecord, table);
  validateSeoSlugs(allRows);

  const rows = allRows
    .filter((row) => isPublic(row) && String(row.Name || "").trim())
    .map(normalizePost)
    .sort((a, b) => {
      const yearDiff = Number(b.year || 0) - Number(a.year || 0);
      if (yearDiff !== 0) return yearDiff;
      return String(b.createdTime).localeCompare(String(a.createdTime));
    });

  const missingSeoSlugPosts = rows.filter((post) => !post.seoSlug);
  if (missingSeoSlugPosts.length) {
    const sample = missingSeoSlugPosts
      .slice(0, 5)
      .map((post) => `"${post.title}"`)
      .join(", ");
    const suffix = missingSeoSlugPosts.length > 5 ? ", ..." : "";
    console.warn(`Missing SEO Slug for ${missingSeoSlugPosts.length}/${rows.length} public posts; using legacy title-derived slugs for now: ${sample}${suffix}`);
  }

  const existingPayload = fullSync ? null : await readExistingPayload();
  const existingPosts = new Map((existingPayload?.posts || []).map((post) => [post.id, post]));

  if (fullSync) {
    await rm(assetRoot, { recursive: true, force: true });
  }

  const posts = [];
  let fetchedPostCount = 0;
  for (const [index, post] of rows.entries()) {
    const existingPost = existingPosts.get(post.id);
    const canReuseExisting =
      !fullSync &&
      existingPost?.lastEditedTime === post.lastEditedTime &&
      existingPost?.content?.blocks?.length;

    if (canReuseExisting) {
      console.log(`Reusing blog post ${index + 1}/${rows.length}: ${post.title}`);
      posts.push({
        ...post,
        content: existingPost.content,
      });
      continue;
    }

    console.log(`Fetching blog post ${index + 1}/${rows.length}: ${post.title}`);
    await rm(path.join(assetRoot, post.id), { recursive: true, force: true });
    fetchedPostCount += 1;
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
    generatedAt: existingPayload?.generatedAt || new Date().toISOString(),
    source: {
      databaseId,
      collectionId,
      collectionViewId,
      sourceUrl,
    },
    posts,
  };

  const existingText = existingPayload ? `${JSON.stringify(existingPayload, null, 2)}\n` : "";
  let nextText = `${JSON.stringify(payload, null, 2)}\n`;
  if (nextText === existingText) {
    console.log(`No blog seed changes. Mode: ${fullSync ? "full" : "incremental"}. Fetched ${fetchedPostCount}/${posts.length} posts.`);
    return;
  }

  payload.generatedAt = new Date().toISOString();
  nextText = `${JSON.stringify(payload, null, 2)}\n`;

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, nextText);
  console.log(`Wrote ${posts.length} blog posts to ${path.relative(repoRoot, outputPath)}. Mode: ${fullSync ? "full" : "incremental"}. Fetched ${fetchedPostCount}/${posts.length} posts.`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
