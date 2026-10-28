import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const [configFile, manifestFile, publicDirectory] = process.argv.slice(2);
if (!configFile || !manifestFile || !publicDirectory) {
  throw new Error("Usage: node scripts/apply-static-social-meta.mjs <cards.json> <images.json> <public-directory>");
}
const config = JSON.parse(await readFile(configFile, "utf8"));
const images = JSON.parse(await readFile(manifestFile, "utf8"));
const escape = value => String(value).replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
for (const [route, image] of Object.entries(images)) {
  const file = path.join(publicDirectory, route, route.endsWith("/") ? "index.html" : "");
  let html = await readFile(file, "utf8");
  // Existing titles and summaries are already escaped HTML attribute content.
  const title = html.match(/<title>([\s\S]*?)<\/title>/i)[1].replaceAll('"', "&quot;");
  const description = html.match(/<meta\s+name="description"\s+content="([^"]*)"/i)[1];
  html = html.replace(/\s*<meta\b(?=[^>]*\b(?:property|name)=["'](?:og:|twitter:))[^>]*>/gi, "");
  const tags = `
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="${escape(config.brand)}">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:url" content="${escape(new URL(route, config.siteUrl).href)}">
    <meta property="og:image" content="${escape(image.url)}">
    <meta property="og:image:type" content="image/png">
    <meta property="og:image:width" content="${image.width}">
    <meta property="og:image:height" content="${image.height}">
    <meta property="og:image:alt" content="${escape(image.alt)}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${description}">
    <meta name="twitter:image" content="${escape(image.url)}">
    <meta name="twitter:image:alt" content="${escape(image.alt)}">
`;
  html = html.replace(/\s*<\/head>/i, `${tags}  </head>`);
  await writeFile(file, html);
}
console.log(`Updated ${Object.keys(images).length} static page social heads for ${config.brand}.`);
