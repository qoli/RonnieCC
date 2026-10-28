import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { renderSocialImage } from "../src/render-social-image.mjs";
import { socialImageFor } from "../src/social-card.mjs";

const [configFile, publicDirectory, manifestFile] = process.argv.slice(2);
if (!configFile || !publicDirectory || !manifestFile) {
  throw new Error("Usage: node scripts/render-social-cards.mjs <cards.json> <public-directory> <manifest.json>");
}
const config = JSON.parse(await readFile(configFile, "utf8"));
const previous = await readFile(manifestFile, "utf8").then(JSON.parse).catch(error => {
  if (error.code === "ENOENT") return {};
  throw error;
});
const images = {};
for (const [route, page] of Object.entries(config.pages)) {
  const card = { brand: config.brand, address: new URL(config.siteUrl).host, ...page };
  if (card.artwork) card.artworkRevision = createHash("sha256").update(await readFile(path.join(publicDirectory, card.artwork))).digest("hex");
  const image = socialImageFor(card);
  const imagePath = new URL(image.url).pathname;
  image.url = new URL(imagePath, config.siteUrl).href;
  const destination = path.join(publicDirectory, imagePath);
  await renderSocialImage({ ...card, artwork: card.artwork ? path.join(publicDirectory, card.artwork) : undefined }, destination, { svgPath: destination.replace(/\.png$/, ".svg") });
  images[route] = image;
}
await mkdir(path.dirname(manifestFile), { recursive: true });
await writeFile(manifestFile, `${JSON.stringify(images, null, 2)}\n`);
const currentUrls = new Set(Object.values(images).map(image => image.url));
for (const image of Object.values(previous)) {
  if (currentUrls.has(image.url)) continue;
  const oldFile = path.join(publicDirectory, new URL(image.url).pathname);
  await rm(oldFile, { force: true });
  await rm(oldFile.replace(/\.png$/, ".svg"), { force: true });
}
console.log(`Rendered ${Object.keys(images).length} product social images for ${config.brand}.`);
