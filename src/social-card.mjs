import { createHash } from "node:crypto";

export const socialImageSize = { width: 1200, height: 630 };

// Mirrors consume this metadata; the canonical build renders the image.
export function blogSocialCard(post) {
  return {
    key: `blog/${post.slug}`,
    brand: post.canonical?.site === "adict" ? "aDict" : "Ronnie Wong",
    eyebrow: "Writing",
    title: post.title,
    address: new URL(post.canonical?.url || "https://ronniewong.cc/").host,
    background: "#f4efe4",
  };
}

export function socialImageFor(card) {
  const revision = createHash("sha256").update(JSON.stringify([3, card])).digest("hex").slice(0, 12);
  return {
    url: `https://ronniewong.cc/social/${card.key}-${revision}.png`,
    ...socialImageSize,
    alt: `${card.title.replaceAll(/\s+/g, " ")} — ${card.brand}`,
  };
}

export const blogSocialImage = post => socialImageFor(blogSocialCard(post));
