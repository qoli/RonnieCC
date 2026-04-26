#!/usr/bin/env node
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { compactId, fetchCollection, fetchPageById, recordValue, rowsFromCollection } from "./notion-sync/notion-api.mjs";

const databaseId = "60ac1b36c401837598a501cc8b7ea241";
const collectionId = "0bdc1b36c401828b875a87505f6c4363";
const collectionViewId = "e90c1b36c401831d99bf08f10dcbae9b";
const sourceUrl = "https://www.notion.so/qoli/60ac1b36c401837598a501cc8b7ea241?v=e90c1b36c401831d99bf08f10dcbae9b&source=copy_link";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const outputPath = path.join(repoRoot, "content", "blog.seed.json");

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

function isPublic(row) {
  return row["公開"] === true || row["公開"] === "__YES__" || row["公開"] === "Yes";
}

function normalizePost(row) {
  const writtenYear = row["編寫日期"] ? String(new Date(row["編寫日期"]).getFullYear()) : "";
  const year = writtenYear || String(row["年份"] || "").trim() || (row.createdTime ? String(new Date(row.createdTime).getFullYear()) : "");
  return {
    id: compactId(row.id),
    slug: postSlug(row),
    title: String(row.Name || "").trim(),
    tag: String(row.Tag || "").trim(),
    year,
    public: isPublic(row),
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
  const posts = rowsFromCollection(collectionRecord, table)
    .map(normalizePost)
    .filter((post) => post.public && post.title)
    .sort((a, b) => {
      const yearDiff = Number(b.year || 0) - Number(a.year || 0);
      if (yearDiff !== 0) return yearDiff;
      return String(b.createdTime).localeCompare(String(a.createdTime));
    });

  const payload = {
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
