export type Language = "mix" | "en";

export type SeoMeta = {
  language: Language;
  path: string;
  title: string;
  description: string;
  type?: "website" | "profile" | "article";
  jsonLd?: unknown[];
};

type CollectionItem = {
  name: string;
  url: string;
};

type BreadcrumbItem = {
  name: string;
  url: string;
};

export const siteUrl = "https://ronniewong.cc";
export const siteName = "Ronnie Wong";
export const defaultSocialImage = `${siteUrl}/og-image.png`;

export const socialProfiles = [
  "https://github.com/qoli",
  "https://x.com/llqoli",
  "https://mastodon.social/@ronniew",
  "https://dribbble.com/qoli/",
];

const languageInfo = {
  mix: {
    htmlLang: "zh-Hant",
    ogLocale: "zh_TW",
    alternateLocale: "en_US",
    description:
      "Ronnie Wong's public index of projects, writings, experiments, and external traces across product engineering, interface design, Apple platforms, and AI workflows.",
  },
  en: {
    htmlLang: "en",
    ogLocale: "en_US",
    alternateLocale: "zh_TW",
    description:
      "Ronnie Wong's public index of projects, writings, experiments, and external traces across product engineering, interface design, Apple platforms, and AI workflows.",
  },
} satisfies Record<Language, { htmlLang: string; ogLocale: string; alternateLocale: string; description: string }>;

function escapeHtml(value: string): string {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeAttr(value: string): string {
  return escapeHtml(value);
}

function safeJson(data: unknown): string {
  return JSON.stringify(data).replaceAll("</script", "<\\/script");
}

export function canonicalUrl(path: string, language: Language): string {
  const prefix = language === "en" ? "/en/" : "/";
  const normalizedPath = path.replace(/^\/+/, "");
  if (!normalizedPath) return `${siteUrl}${prefix}`;
  return `${siteUrl}${prefix}${normalizedPath}`;
}

export function alternateUrls(path: string): Record<"mix" | "en" | "xDefault", string> {
  return {
    mix: canonicalUrl(path, "mix"),
    en: canonicalUrl(path, "en"),
    xDefault: canonicalUrl(path, "mix"),
  };
}

function metaTag(name: string, content: string): string {
  return `    <meta name="${escapeAttr(name)}" content="${escapeAttr(content)}">`;
}

function propertyTag(property: string, content: string): string {
  return `    <meta property="${escapeAttr(property)}" content="${escapeAttr(content)}">`;
}

function linkTag(rel: string, href: string, extra = ""): string {
  return `    <link rel="${escapeAttr(rel)}"${extra} href="${escapeAttr(href)}">`;
}

function jsonLdTag(data: unknown): string {
  return `    <script type="application/ld+json">${safeJson(data)}</script>`;
}

export function renderSeoHead(meta: SeoMeta): string {
  const canonical = canonicalUrl(meta.path, meta.language);
  const alternates = alternateUrls(meta.path);
  const info = languageInfo[meta.language];
  const type = meta.type === "article" ? "article" : meta.type === "profile" ? "profile" : "website";
  const jsonLd = meta.jsonLd || [];

  return [
    metaTag("author", siteName),
    metaTag("robots", "index, follow"),
    propertyTag("og:site_name", siteName),
    propertyTag("og:type", type),
    propertyTag("og:title", meta.title),
    propertyTag("og:description", meta.description),
    propertyTag("og:url", canonical),
    propertyTag("og:image", defaultSocialImage),
    propertyTag("og:image:width", "1200"),
    propertyTag("og:image:height", "630"),
    propertyTag("og:image:alt", `${siteName} public index`),
    propertyTag("og:locale", info.ogLocale),
    propertyTag("og:locale:alternate", info.alternateLocale),
    metaTag("twitter:card", "summary_large_image"),
    metaTag("twitter:title", meta.title),
    metaTag("twitter:description", meta.description),
    metaTag("twitter:image", defaultSocialImage),
    metaTag("twitter:image:alt", `${siteName} public index`),
    metaTag("twitter:site", "@llqoli"),
    metaTag("twitter:creator", "@llqoli"),
    linkTag("alternate", alternates.mix, ' hreflang="zh-Hant"'),
    linkTag("alternate", alternates.en, ' hreflang="en"'),
    linkTag("alternate", alternates.xDefault, ' hreflang="x-default"'),
    ...socialProfiles.map((href) => linkTag("me", href)),
    ...jsonLd.map(jsonLdTag),
  ].join("\n");
}

export function applySeo(html: string, meta: SeoMeta): string {
  const canonical = canonicalUrl(meta.path, meta.language);
  const withBase = html
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(meta.title)}</title>`)
    .replace(
      /<meta\s+name="description"\s+content="[\s\S]*?"\s*>/,
      `<meta\n      name="description"\n      content="${escapeAttr(meta.description)}"\n    >`
    )
    .replace(/<link rel="canonical" href="[^"]+">/, `<link rel="canonical" href="${escapeAttr(canonical)}">`);

  return withBase.replace(/\n\s*<\/head>/, `\n${renderSeoHead(meta)}\n  </head>`);
}

export function personJsonLd(language: Language): unknown {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${siteUrl}/#person`,
    name: siteName,
    alternateName: "Ronnie W.",
    url: siteUrl,
    jobTitle: "Product Engineer and Designer",
    description: languageInfo[language].description,
    sameAs: socialProfiles,
    knowsAbout: [
      "Product engineering",
      "Interface design",
      "Apple platforms",
      "AI workflows",
      "Local-first systems",
    ],
  };
}

export function websiteJsonLd(language: Language): unknown {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    name: siteName,
    url: siteUrl,
    inLanguage: languageInfo[language].htmlLang,
    description: languageInfo[language].description,
    publisher: { "@id": `${siteUrl}/#person` },
  };
}

export function collectionPageJsonLd(params: {
  language: Language;
  path: string;
  name: string;
  description: string;
  items: CollectionItem[];
}): unknown {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: params.name,
    description: params.description,
    url: canonicalUrl(params.path, params.language),
    inLanguage: languageInfo[params.language].htmlLang,
    author: { "@id": `${siteUrl}/#person` },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: params.items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        url: item.url,
      })),
    },
  };
}

export function profilePageJsonLd(language: Language, path: string, description: string): unknown {
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    name: "Resume · Ronnie Wong",
    description,
    url: canonicalUrl(path, language),
    inLanguage: languageInfo[language].htmlLang,
    mainEntity: { "@id": `${siteUrl}/#person` },
  };
}

export function creativeWorkJsonLd(params: {
  language: Language;
  path: string;
  name: string;
  description: string;
  keywords: string[];
  about: string;
  sameAs: string[];
}): unknown {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: params.name,
    description: params.description,
    url: canonicalUrl(params.path, params.language),
    inLanguage: languageInfo[params.language].htmlLang,
    creator: { "@id": `${siteUrl}/#person` },
    keywords: params.keywords,
    about: params.about,
    sameAs: params.sameAs,
  };
}

export function breadcrumbJsonLd(items: BreadcrumbItem[]): unknown {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
