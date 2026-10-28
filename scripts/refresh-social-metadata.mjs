import { readFile, writeFile } from "node:fs/promises";
import { blogSocialImage } from "../src/social-card.mjs";

const file = new URL("../content/blog.seed.json", import.meta.url);
const seed = JSON.parse(await readFile(file, "utf8"));
seed.posts = seed.posts.map(post => {
  const { content, socialImage, ...metadata } = post;
  return { ...metadata, socialImage: blogSocialImage(post), ...(content ? { content } : {}) };
});
await writeFile(file, `${JSON.stringify(seed, null, 2)}\n`);
console.log(`Refreshed social image metadata for ${seed.posts.length} cached posts without querying Notion.`);
