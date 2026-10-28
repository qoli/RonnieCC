import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { blogSocialCard, blogSocialImage } from "../src/social-card.mjs";
import { renderSocialImage } from "../src/render-social-image.mjs";

const post = { slug: "example-post-abcd1234", title: "截圖記帳：從第一次設定開始", canonical: { site: "ronniecc", url: "https://ronniewong.cc/blog/example-post-abcd1234/" } };

test("article covers keep a stable URL until their public content changes", () => {
  const image = blogSocialImage(post);
  assert.deepEqual(blogSocialImage({ ...post, lastEditedTime: "2026-10-29" }), image);
  assert.notEqual(blogSocialImage({ ...post, title: "更新後的文章標題" }).url, image.url);
  assert.equal(image.width, 1200);
  assert.equal(image.height, 630);
  assert.equal(image.alt, `${post.title} — Ronnie Wong`);
});

test("a product-owned article retains its canonical owner in the shared cover", () => {
  const card = blogSocialCard({ ...post, canonical: { site: "adict", url: "https://adict.ronniewong.cc/blog/example-post-abcd1234/" } });
  assert.equal(card.brand, "aDict");
  assert.equal(card.address, "adict.ronniewong.cc");
  assert.match(blogSocialImage(post).url, /^https:\/\/ronniewong.cc\/social\/blog\//);
});

test("Chinese, English and markup characters render to a complete PNG", async t => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "social-image-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const destination = path.join(directory, "cover.png");
  await renderSocialImage({ ...blogSocialCard(post), title: '截图记账 &「第一步」<AI> with Trackly' }, destination);
  const bytes = await readFile(destination);
  assert.equal(bytes.subarray(1, 4).toString(), "PNG");
  assert.equal(bytes.readUInt32BE(16), 1200);
  assert.equal(bytes.readUInt32BE(20), 630);
});

test("English product headlines preserve the intended lines without an orphaned comma", async t => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "social-lines-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const layout = await renderSocialImage({
    ...blogSocialCard(post), title: "Your dictionaries,\nalways at hand.",
    description: "Youdao, MDict and StarDict. In one app.",
    artwork: new URL("../favicon.svg", import.meta.url).pathname,
  }, path.join(directory, "english.png"));
  assert.deepEqual(layout.titleLines, ["Your dictionaries,", "always at hand."]);
});
