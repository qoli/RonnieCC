import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Resvg } from "@resvg/resvg-js";
import { openSync } from "fontkit";
import { execFileSync } from "node:child_process";
import { socialImageFor } from "./social-card.mjs";

const fontFile = fileURLToPath(new URL("../scripts/fonts/NotoSansCJKtc-Regular.otf", import.meta.url));
const font = openSync(fontFile);
const escape = value => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");

const textWidth = (value, size) => font.layout(value).advanceWidth / font.unitsPerEm * size;

function wrap(text, size, width) {
  const lines = [];
  for (const paragraph of String(text).split("\n")) {
    let line = "";
    const tokens = [];
    for (const { segment } of new Intl.Segmenter("zh-Hant", { granularity: "word" }).segment(paragraph)) {
      if (/^[,.;:!?，。；：！？、）］】」』》〉”’]+$/u.test(segment) && tokens.length) tokens[tokens.length - 1] += segment;
      else tokens.push(segment);
    }
    for (const segment of tokens) {
      if (textWidth(line + segment, size) > width && line.trim()) {
        lines.push(line.trim());
        line = "";
      }
      for (const character of segment) {
        if (textWidth(line + character, size) > width && line.trim()) {
          lines.push(line.trim());
          line = "";
        }
        line += character;
      }
    }
    if (line.trim()) lines.push(line.trim());
  }
  return lines;
}

function textLines(lines, x, y, size, color, lineHeight = size * 1.32) {
  return `<text x="${x}" y="${y}" fill="${color}" font-size="${size}">${lines.map((line, index) => `<tspan x="${x}" dy="${index ? lineHeight : 0}">${escape(line)}</tspan>`).join("")}</text>`;
}

export async function renderSocialImage(card, destination, { svgPath } = {}) {
  const hasArtwork = Boolean(card.artwork);
  const titleWidth = hasArtwork ? 610 : 1056;
  const titleHeight = card.description ? 240 : 310;
  let size = 64;
  let lines = wrap(card.title, size, titleWidth);
  const intendedLines = card.title.split("\n").length;
  while (lines.length * size * 1.32 > titleHeight || (intendedLines > 1 && lines.length > intendedLines)) {
    size -= 2;
    lines = wrap(card.title, size, titleWidth);
  }
  const titleY = 210 + Math.max(0, (titleHeight - lines.length * size * 1.32) / 2);
  let artwork = "";
  if (hasArtwork) {
    const bytes = card.artwork.endsWith(".webp")
      ? execFileSync("magick", [card.artwork, "png:-"], { maxBuffer: Infinity })
      : await readFile(card.artwork);
    const mime = card.artwork.endsWith(".svg") ? "image/svg+xml" : "image/png";
    artwork = `<image x="748" y="155" width="380" height="355" preserveAspectRatio="xMidYMid meet" href="data:${mime};base64,${bytes.toString("base64")}"/>`;
  }
  const description = card.description ? textLines(wrap(card.description, 26, titleWidth), 72, 466, 26, "#60605c", 37) : "";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
<rect width="1200" height="630" fill="${escape(card.background || "#ffffff")}"/>
<g font-family="Noto Sans CJK TC">
<path d="M72 126h1056M72 548h1056" stroke="#171714" stroke-opacity=".16"/>
<text x="72" y="88" font-size="28" fill="#171714">${escape(card.brand)}</text>
<text x="1128" y="88" text-anchor="end" font-size="23" fill="#60605c">${escape(card.eyebrow)}</text>
${textLines(lines, 72, titleY, size, "#171714")}${description}${artwork}
<text x="72" y="593" font-size="22" fill="#60605c">${escape(card.address)}</text>
</g></svg>`;
  const renderer = new Resvg(svg, { font: { fontFiles: [fontFile], loadSystemFonts: false } });
  await mkdir(path.dirname(destination), { recursive: true });
  await writeFile(destination, renderer.render().asPng());
  if (svgPath) await writeFile(svgPath, renderer.toString());
  return { titleLines: lines, fontSize: size };
}

export class SocialImages {
  cards = new Map();

  add(card) {
    const image = socialImageFor(card);
    this.cards.set(new URL(image.url).pathname, card);
    return image;
  }

  async write(outputDir) {
    for (const [route, card] of this.cards) await renderSocialImage(card, path.join(outputDir, route));
    return this.cards.size;
  }
}
