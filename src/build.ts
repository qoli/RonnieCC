import { mkdir, rm, copyFile, readdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import {
  applySeo,
  breadcrumbJsonLd,
  canonicalUrl,
  collectionPageJsonLd,
  creativeWorkJsonLd,
  personJsonLd,
  profilePageJsonLd,
  siteUrl,
  websiteJsonLd,
} from "./seo";

type ProjectCategory = "current" | "exploration" | "history";
type Language = "mix" | "en";

type Locale = {
  language: Language;
  htmlLang: string;
  outputPrefix: string;
  rootPath: string;
};

type ProjectLink = {
  label: string;
  href: string;
};

type ProjectSurface = {
  label: string;
  kind?: string;
  href?: string;
  role?: string;
};

type ProjectComponent = {
  name: string;
  type: string;
  visibility: string;
  role: string;
};

type ProjectSection = {
  title: string;
  body: string;
};

type Project = {
  id: string;
  name: string;
  category: ProjectCategory;
  categoryLabel: string;
  type: string;
  summary: string;
  capability: string;
  tags: string[];
  status: string;
  detail: {
    thesis: string;
    sections: ProjectSection[];
    components: ProjectComponent[];
    proof?: string[];
    surfaces?: ProjectSurface[];
  };
  links: ProjectLink[];
};

type ProjectCopy = Partial<Project> & {
  detail?: Partial<Project["detail"]>;
};

type BlogPost = {
  id: string;
  slug: string;
  title: string;
  tag?: string;
  year?: string;
  public?: boolean;
  notionUrl: string;
};

const root = process.cwd();
const outDir = join(root, "dist");
const categoryOrder: ProjectCategory[] = ["current", "exploration", "history"];
const categoryLabelsMix: Record<ProjectCategory, string> = {
  current: "現在",
  exploration: "探索",
  history: "歷史",
};
const categoryLabelsEn: Record<ProjectCategory, string> = {
  current: "Current Projects",
  exploration: "Explorations",
  history: "Historical Projects",
};

const locales: Record<Language, Locale> = {
  mix: {
    language: "mix",
    htmlLang: "zh-Hant",
    outputPrefix: "",
    rootPath: "",
  },
  en: {
    language: "en",
    htmlLang: "en",
    outputPrefix: "en/",
    rootPath: "../",
  },
};

const localeCopy = {
  mix: {
    projectsIntro: "這裡按生命週期整理：現在、探索、歷史。Tag 用來說明能力、平台、形態和資料狀態。",
    blogIntro: "一組公開筆記，用來保留產品工程、Apple 平台、AI workflow 和設計判斷的上下文。",
    blogHeading: "Published notes",
    blogEmpty: "目前沒有公開文章。",
    allProjects: "All Projects",
    detailHeadings: {
      narrative: "設計與工程判斷",
      system: "組件和資料可見性",
      surface: "公開工作面",
      practice: "Practice",
    },
    categoryLabels: categoryLabelsMix,
    filters: {
      all: "All",
      current: "現在",
      exploration: "探索",
      history: "歷史",
    },
  },
  en: {
    projectsIntro: "Projects are organized by lifecycle: current systems, explorations, and historical work. Tags describe capability, platform, format, and source status.",
    blogIntro: "Public notes that keep context around product engineering, Apple platforms, AI workflows, and design judgement.",
    blogHeading: "Published notes",
    blogEmpty: "No public notes are available yet.",
    allProjects: "All Projects",
    detailHeadings: {
      narrative: "Design and engineering judgement",
      system: "Components and visibility",
      surface: "Public surfaces",
      practice: "Practice",
    },
    categoryLabels: categoryLabelsEn,
    filters: {
      all: "All",
      current: "Current",
      exploration: "Explorations",
      history: "History",
    },
  },
} satisfies Record<Language, {
  projectsIntro: string;
  blogIntro: string;
  blogHeading: string;
  blogEmpty: string;
  allProjects: string;
  detailHeadings: Record<"narrative" | "system" | "surface" | "practice", string>;
  categoryLabels: Record<ProjectCategory, string>;
  filters: Record<"all" | ProjectCategory, string>;
}>;

const projectGlyphs: Record<string, string> = {
  syncnext: `
    <circle cx="36" cy="60" r="18"></circle>
    <circle cx="84" cy="60" r="18"></circle>
    <path d="M54 60h12"></path>
  `,
  "eison-ai": `
    <circle cx="60" cy="60" r="42"></circle>
    <circle cx="60" cy="60" r="18"></circle>
    <path d="M60 18v84"></path>
  `,
  threadbridge: `
    <path d="M26 34h68v52H26Z"></path>
    <path d="M26 52h68M44 34v52"></path>
    <path d="M44 68h32"></path>
  `,
  "trackly-reborn": `
    <path d="M24 86 48 58l20 16 28-40"></path>
    <path d="M24 34h72"></path>
  `,
  adict: `
    <path d="M28 26h28c8 0 14 6 14 14v54H42c-8 0-14-6-14-14Z"></path>
    <path d="M70 40c0-8 6-14 14-14h8v68H70"></path>
  `,
  "hln-machine": `
    <path d="M26 30h24v24H26ZM70 30h24v24H70ZM48 74h24v24H48Z"></path>
    <path d="M50 42h20M38 54l16 20M82 54 66 74"></path>
  `,
  "chatgpt-history": `
    <path d="M28 30h64M28 50h42M28 70h64M28 90h42"></path>
    <path d="M76 48l16 16-16 16"></path>
  `,
  "enterprise-web-design": `
    <rect x="22" y="28" width="76" height="64"></rect>
    <path d="M22 50h76M46 28v64"></path>
  `,
  "nomad-drive": `
    <path d="M24 82h72"></path>
    <path d="M36 38h48l12 44H24Z"></path>
    <path d="M46 60h28"></path>
  `,
  "mobile-ui-qa-wallet": `
    <rect x="38" y="20" width="44" height="80" rx="10"></rect>
    <path d="M48 62l10 10 18-26"></path>
  `,
  "consumer-app-design": `
    <path d="M28 32h26v26H28ZM66 32h26v26H66ZM47 72h26v26H47Z"></path>
    <path d="M54 45h12M79 58l-13 14M41 58l13 14"></path>
  `,
  "brand-visual-identity": `
    <circle cx="48" cy="48" r="24"></circle>
    <circle cx="72" cy="48" r="24"></circle>
    <path d="M36 86h48"></path>
  `,
  "ux-audit-product-system": `
    <path d="M24 34h72M24 60h72M24 86h72"></path>
    <path d="M42 34c24 0 12 52 36 52"></path>
  `,
};

const fallbackGlyph = `
  <circle cx="60" cy="60" r="42"></circle>
  <path d="M30 60h60M60 30v60"></path>
`;

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

function stripProtocol(url: string): string {
  return url.replace(/^https?:\/\//, "");
}

function projectPath(project: Project, prefix = ""): string {
  return `${prefix}projects/${encodeURIComponent(project.id)}/`;
}

function projectCanonical(project: Project, language: Language): string {
  return canonicalUrl(`projects/${encodeURIComponent(project.id)}/`, language);
}

function truncate(value: string, max = 160): string {
  const text = value.replace(/\s+/g, " ").trim();
  return text.length <= max ? text : `${text.slice(0, max - 1).trim()}…`;
}

function withStaticMode(html: string, locale: Locale): string {
  return html
    .replace("<html lang=\"zh-Hant\">", `<html lang="${locale.htmlLang}" data-static-project-urls="true">`)
    .replace(
      'document.documentElement.dataset.language = localStorage.getItem("site-language") || "mix";',
      `document.documentElement.dataset.language = "${locale.language}";`
    );
}

function extractConstObject(source: string, name: string): string {
  const startMarker = `const ${name} = `;
  const start = source.indexOf(startMarker);
  if (start === -1) throw new Error(`Cannot find ${name} in site.js`);

  const objectStart = source.indexOf("{", start + startMarker.length);
  let depth = 0;
  let quote: string | null = null;
  let escaped = false;

  for (let index = objectStart; index < source.length; index += 1) {
    const char = source[index];

    if (quote) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === quote) {
        quote = null;
      }
      continue;
    }

    if (char === '"' || char === "'" || char === "`") {
      quote = char;
      continue;
    }

    if (char === "{") depth += 1;
    if (char === "}") depth -= 1;
    if (depth === 0) return source.slice(objectStart, index + 1);
  }

  throw new Error(`Cannot parse ${name} from site.js`);
}

async function readProjectCopyEn(): Promise<Record<string, ProjectCopy>> {
  const source = await readFile(join(root, "site.js"), "utf8");
  const objectLiteral = extractConstObject(source, "projectCopyEn");
  return Function(`"use strict"; return (${objectLiteral});`)() as Record<string, ProjectCopy>;
}

function mergeListByIndex<T extends Record<string, unknown>>(baseItems: T[], overrideItems?: Partial<T>[]): T[] {
  if (!overrideItems) return baseItems;
  return baseItems.map((item, index) => ({ ...item, ...(overrideItems[index] || {}) }) as T);
}

function localizedProject(project: Project, language: Language, copyEn: Record<string, ProjectCopy>): Project {
  if (language !== "en") return project;
  const copy = copyEn[project.id];
  if (!copy) return { ...project, categoryLabel: categoryLabelsEn[project.category] };

  return {
    ...project,
    ...copy,
    categoryLabel: copy.categoryLabel || categoryLabelsEn[project.category],
    detail: {
      ...project.detail,
      ...(copy.detail || {}),
      sections: mergeListByIndex(project.detail.sections, copy.detail?.sections),
      components: mergeListByIndex(project.detail.components, copy.detail?.components),
    },
  };
}

function localizedProjects(projects: Project[], language: Language, copyEn: Record<string, ProjectCopy>): Project[] {
  return projects.map((project) => localizedProject(project, language, copyEn));
}

function projectVisual(project: Project, index: number, variant: "card" | "detail" = "card"): string {
  const number = String(index + 1).padStart(2, "0");
  const modifier = variant === "detail" ? " project-visual--detail" : "";
  const glyph = projectGlyphs[project.id] || fallbackGlyph;

  return `
    <div class="project-visual${modifier}" aria-hidden="true">
      <span class="project-index">${number}</span>
      <svg class="project-mark" viewBox="0 0 120 120" focusable="false">
        ${glyph}
      </svg>
    </div>
  `;
}

function tagList(tags: string[]): string {
  return tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("");
}

function projectCard(project: Project, index: number, prefix = ""): string {
  return `
    <article class="project-card" data-category="${escapeAttr(project.category)}" id="${escapeAttr(project.id)}">
      ${projectVisual(project, index)}
      <div class="project-body">
        <div class="project-meta">
          <span>${escapeHtml(project.categoryLabel)}</span>
          <span>${escapeHtml(project.status)}</span>
        </div>
        <h3>${escapeHtml(project.name)}</h3>
        <p class="project-type">${escapeHtml(project.type)}</p>
        <p>${escapeHtml(project.summary)}</p>
        <blockquote>${escapeHtml(project.capability)}</blockquote>
        <div class="tags">${tagList(project.tags)}</div>
        <div class="project-links">
          <a href="${projectPath(project, prefix)}">Detail</a>
          ${project.links.map((link) => `<a href="${escapeAttr(link.href)}">${escapeHtml(link.label)}</a>`).join("")}
        </div>
      </div>
    </article>
  `;
}

function groupedProjects(projects: Project[], language: Language, prefix = ""): string {
  const ui = localeCopy[language];
  return categoryOrder
    .map((category) => {
      const items = projects.filter((project) => project.category === category);
      if (!items.length) return "";

      return `
        <section class="project-group" id="${category === "history" ? "history" : category}">
          <div class="section-header">
            <p class="eyebrow">${escapeHtml(category)}</p>
            <h2>${escapeHtml(ui.categoryLabels[category])}</h2>
          </div>
          <div class="project-grid">
            ${items.map((project, index) => projectCard(project, index, prefix)).join("")}
          </div>
        </section>
      `;
    })
    .join("");
}

function componentRows(components: ProjectComponent[]): string {
  return components
    .map(
      (component) => `
        <tr>
          <td>${escapeHtml(component.name)}</td>
          <td>${escapeHtml(component.type)}</td>
          <td>${escapeHtml(component.visibility)}</td>
          <td>${escapeHtml(component.role)}</td>
        </tr>
      `
    )
    .join("");
}

function detailSections(sections: ProjectSection[]): string {
  return sections
    .map(
      (section) => `
        <article class="detail-note">
          <h3>${escapeHtml(section.title)}</h3>
          <p>${escapeHtml(section.body)}</p>
        </article>
      `
    )
    .join("");
}

function publicSurfaceItems(project: Project): ProjectSurface[] {
  if (project.detail.surfaces?.length) return project.detail.surfaces;

  return project.links.map((link) => ({
    label: link.label,
    kind: "Public URL",
    href: link.href,
    role: "Public entry connected to this project.",
  }));
}

function surfaceMarkup(surface: ProjectSurface): string {
  const content = `
    <span class="surface-kind">${escapeHtml(surface.kind || "Public URL")}</span>
    <strong>${escapeHtml(surface.label)}</strong>
    <p>${escapeHtml(surface.role || "")}</p>
  `;

  if (!surface.href) {
    return `<article class="surface-item is-pending">${content}</article>`;
  }

  return `
    <a class="surface-item" href="${escapeAttr(surface.href)}" target="_blank" rel="noreferrer">
      ${content}
      <span class="surface-url">${escapeHtml(stripProtocol(surface.href))}</span>
    </a>
  `;
}

function projectDetailMain(project: Project, projects: Project[], language: Language, allProjectsHref: string): string {
  const projectIndex = projects.findIndex((item) => item.id === project.id);
  const surfaces = publicSurfaceItems(project);
  const ui = localeCopy[language];

  return `<main id="project-detail" aria-live="polite">
    <section class="page-hero compact detail-hero" aria-labelledby="detail-title">
      <div class="detail-hero-grid">
        <div>
          <p class="eyebrow">${escapeHtml(project.categoryLabel)} · ${escapeHtml(project.type)}</p>
          <h1 id="detail-title">${escapeHtml(project.name)}</h1>
          <p>${escapeHtml(project.detail.thesis)}</p>
          <div class="tags detail-tags">${tagList(project.tags)}</div>
        </div>
        ${projectVisual(project, projectIndex, "detail")}
      </div>
    </section>

    <section class="section detail-layout">
      <aside class="detail-aside" aria-label="Project metadata">
        <div class="detail-aside-block">
          <span>Status</span>
          <strong>${escapeHtml(project.status)}</strong>
        </div>
        <div class="detail-aside-block">
          <span>Category</span>
          <strong>${escapeHtml(project.categoryLabel)}</strong>
        </div>
        <div class="detail-aside-block">
          <span>${escapeHtml(ui.detailHeadings.practice)}</span>
          <p>${escapeHtml(project.capability)}</p>
        </div>
        <div class="project-links vertical">
          <a href="${escapeAttr(allProjectsHref)}">${escapeHtml(ui.allProjects)}</a>
          ${project.links.map((link) => `<a href="${escapeAttr(link.href)}">${escapeHtml(link.label)}</a>`).join("")}
        </div>
      </aside>

      <div class="detail-main">
        <section class="detail-section">
          <div class="section-header">
            <p class="eyebrow">Narrative</p>
            <h2>${escapeHtml(ui.detailHeadings.narrative)}</h2>
          </div>
          <div class="detail-notes">
            ${detailSections(project.detail.sections)}
          </div>
        </section>

        <section class="detail-section">
          <div class="section-header">
            <p class="eyebrow">System</p>
            <h2>${escapeHtml(ui.detailHeadings.system)}</h2>
          </div>
          <div class="table-wrap">
            <table class="kami-table">
              <thead>
                <tr>
                  <th>Component</th>
                  <th>Type</th>
                  <th>Visibility</th>
                  <th>Role</th>
                </tr>
              </thead>
              <tbody>${componentRows(project.detail.components)}</tbody>
            </table>
          </div>
        </section>

        <section class="detail-section">
          <div class="section-header">
            <p class="eyebrow">Public URLs</p>
            <h2>${escapeHtml(ui.detailHeadings.surface)}</h2>
          </div>
          <div class="surface-list">
            ${surfaces.map(surfaceMarkup).join("")}
          </div>
        </section>
      </div>
    </section>
  </main>`;
}

function blogList(posts: BlogPost[], language: Language): string {
  const visiblePosts = posts.filter((post) => post.public !== false);
  if (!visiblePosts.length) return `<p class="blog-empty">${escapeHtml(localeCopy[language].blogEmpty)}</p>`;

  const years = [...new Set(visiblePosts.map((post) => post.year || "Notes"))];
  return years
    .map((year) => {
      const items = visiblePosts.filter((post) => (post.year || "Notes") === year);
      return `
        <section class="blog-year" aria-labelledby="blog-year-${escapeAttr(year)}">
          <h3 id="blog-year-${escapeAttr(year)}">${escapeHtml(year)}</h3>
          <div class="blog-items">
            ${items
              .map(
                (post) => `
                  <article class="blog-item">
                    <a href="${escapeAttr(post.notionUrl)}" target="_blank" rel="noreferrer">
                      <span class="blog-title">${escapeHtml(post.title)}</span>
                      <span class="blog-meta">${escapeHtml(post.tag || "Note")}</span>
                    </a>
                  </article>
                `
              )
              .join("")}
          </div>
        </section>
      `;
    })
    .join("");
}

function relativizeAssets(html: string, prefix: string): string {
  return html
    .replaceAll('href="styles.css"', `href="${prefix}styles.css"`)
    .replaceAll('href="favicon.ico"', `href="${prefix}favicon.ico"`)
    .replaceAll('href="favicon.svg"', `href="${prefix}favicon.svg"`)
    .replaceAll('src="site.js"', `src="${prefix}site.js"`);
}

function relativizeProjectDetail(html: string, navPrefix: string, assetPrefix: string): string {
  return html
    .replaceAll('href="index.html"', `href="${navPrefix}index.html"`)
    .replaceAll('href="projects.html"', `href="${navPrefix}projects.html"`)
    .replaceAll('href="blog.html"', `href="${navPrefix}blog.html"`)
    .replaceAll('href="resume.html"', `href="${navPrefix}resume.html"`)
    .replaceAll('href="styles.css"', `href="${assetPrefix}styles.css"`)
    .replaceAll('href="favicon.ico"', `href="${assetPrefix}favicon.ico"`)
    .replaceAll('href="favicon.svg"', `href="${assetPrefix}favicon.svg"`)
    .replaceAll('src="site.js"', `src="${assetPrefix}site.js"`);
}

async function readJson<T>(path: string): Promise<T> {
  return JSON.parse(await readFile(join(root, path), "utf8")) as T;
}

async function writeOutput(path: string, content: string): Promise<void> {
  const target = join(outDir, path);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, content);
}

async function copyDirectory(source: string, target: string): Promise<void> {
  await mkdir(target, { recursive: true });
  for (const entry of await readdir(source, { withFileTypes: true })) {
    const sourcePath = join(source, entry.name);
    const targetPath = join(target, entry.name);
    if (entry.isDirectory()) {
      await copyDirectory(sourcePath, targetPath);
    } else if (entry.isFile()) {
      await copyFile(sourcePath, targetPath);
    }
  }
}

async function copyStaticAssets(): Promise<void> {
  await copyDirectory(join(root, "assets"), join(outDir, "assets"));
  await copyDirectory(join(root, "content"), join(outDir, "content"));
  for (const file of ["styles.css", "site.js", "favicon.ico", "favicon.svg", "og-image.png", "og-image.svg", "google2a0cacaa0b72e2c3.html", "CNAME", ".nojekyll"]) {
    await copyFile(join(root, file), join(outDir, file));
  }
}

function withStaticBody(html: string, locale: Locale): string {
  return html.replace(
    /<body data-page="([^"]+)">/,
    `<body data-page="$1" data-static-language="${locale.language}" data-root-path="${locale.rootPath}" data-project-url-prefix="">`
  );
}

function setLanguageToggle(html: string, language: Language, altUrl: string): string {
  const label = language === "en" ? "Switch to mixed Chinese and English" : "Switch to English";
  const text = language === "en" ? "Mixed" : "EN";
  return html.replace(
    /<button class="language-toggle" type="button" aria-label="[^"]+" data-language-toggle>[^<]*<\/button>/,
    `<button class="language-toggle" type="button" aria-label="${label}" data-language-toggle data-alt-language-url="${escapeAttr(altUrl)}">${text}</button>`
  );
}

function preparePage(html: string, locale: Locale, altUrl: string, assetPrefix = ""): string {
  return setLanguageToggle(relativizeAssets(withStaticBody(withStaticMode(html, locale), locale), assetPrefix), locale.language, altUrl);
}

function renderProjectsPage(source: string, projects: Project[], locale: Locale): string {
  const ui = localeCopy[locale.language];
  let html = preparePage(source, locale, locale.language === "en" ? "../projects.html" : "en/projects.html", locale.rootPath)
    .replace(
      /<p>\s*這裡按生命週期整理：現在、探索、歷史。Tag 用來說明能力、平台、形態和資料狀態。\s*<\/p>/,
      `<p>\n          ${escapeHtml(ui.projectsIntro)}\n        </p>`
    )
    .replace(/<button class="filter is-active" type="button" data-filter="all">[^<]+<\/button>/, `<button class="filter is-active" type="button" data-filter="all">${escapeHtml(ui.filters.all)}</button>`)
    .replace(/<button class="filter" type="button" data-filter="current">[^<]+<\/button>/, `<button class="filter" type="button" data-filter="current">${escapeHtml(ui.filters.current)}</button>`)
    .replace(/<button class="filter" type="button" data-filter="exploration">[^<]+<\/button>/, `<button class="filter" type="button" data-filter="exploration">${escapeHtml(ui.filters.exploration)}</button>`)
    .replace(/<button class="filter" type="button" data-filter="history">[^<]+<\/button>/, `<button class="filter" type="button" data-filter="history">${escapeHtml(ui.filters.history)}</button>`)
    .replace(
    '<div class="grouped-projects" id="project-groups" aria-live="polite"></div>',
    `<div class="grouped-projects" id="project-groups" aria-live="polite">${groupedProjects(projects, locale.language)}</div>`
  );

  const description = "Projects in Ronnie Wong's public index, connecting active systems, experiments, historical design work, and public traces across the web.";
  return applySeo(html, {
    language: locale.language,
    path: "projects.html",
    title: "Projects · Ronnie Wong",
    description,
    jsonLd: [
      personJsonLd(locale.language),
      collectionPageJsonLd({
        language: locale.language,
        path: "projects.html",
        name: "Ronnie Wong Projects",
        description,
        items: projects.map((project) => ({
          name: project.name,
          url: projectCanonical(project, locale.language),
        })),
      }),
      breadcrumbJsonLd([
        { name: "Ronnie Wong", url: canonicalUrl("", locale.language) },
        { name: "Projects", url: canonicalUrl("projects.html", locale.language) },
      ]),
    ],
  });
}

function renderBlogPage(source: string, posts: BlogPost[], locale: Locale): string {
  const ui = localeCopy[locale.language];
  const visiblePosts = posts.filter((post) => post.public !== false);
  let html = preparePage(source, locale, locale.language === "en" ? "../blog.html" : "en/blog.html", locale.rootPath)
    .replace(
      /<p>\s*一組公開筆記，用來保留產品工程、Apple 平台、AI workflow 和設計判斷的上下文。\s*<\/p>/,
      `<p>\n          ${escapeHtml(ui.blogIntro)}\n        </p>`
    )
    .replace(/<h2 id="blog-list-title">[^<]+<\/h2>/, `<h2 id="blog-list-title">${escapeHtml(ui.blogHeading)}</h2>`)
    .replace(
    '<div class="blog-list" id="blog-list" aria-live="polite"></div>',
    `<div class="blog-list" id="blog-list" aria-live="polite">${blogList(visiblePosts, locale.language)}</div>`
  );

  const description = "Writing in Ronnie Wong's public index, collected from public notes about engineering, design, Apple platforms, AI workflows, and product systems.";
  return applySeo(html, {
    language: locale.language,
    path: "blog.html",
    title: "Blog · Ronnie Wong",
    description,
    jsonLd: [
      personJsonLd(locale.language),
      collectionPageJsonLd({
        language: locale.language,
        path: "blog.html",
        name: "Ronnie Wong Writing Index",
        description,
        items: visiblePosts.map((post) => ({
          name: post.title,
          url: post.notionUrl,
        })),
      }),
      breadcrumbJsonLd([
        { name: "Ronnie Wong", url: canonicalUrl("", locale.language) },
        { name: "Blog", url: canonicalUrl("blog.html", locale.language) },
      ]),
    ],
  });
}

function renderProjectPage(source: string, project: Project, projects: Project[], locale: Locale): string {
  const path = `projects/${encodeURIComponent(project.id)}/`;
  const rootPath = locale.language === "en" ? "../../../" : "../../";
  let html = withStaticMode(source, locale)
    .replace(
      '<body data-page="project-detail">',
      `<body data-page="project-detail" data-project-id="${escapeAttr(project.id)}" data-static-language="${locale.language}" data-root-path="${rootPath}">`
    )
    .replace(/<main id="project-detail" aria-live="polite">[\s\S]*?<\/main>/, projectDetailMain(project, projects, locale.language, "../../projects.html"));

  html = setLanguageToggle(html, locale.language, locale.language === "en" ? `../../../projects/${encodeURIComponent(project.id)}/` : `../../en/projects/${encodeURIComponent(project.id)}/`);
  html = applySeo(html, {
    language: locale.language,
    path,
    title: `${project.name} · Ronnie Wong`,
    description: truncate(project.summary),
    type: "article",
    jsonLd: [
      personJsonLd(locale.language),
      creativeWorkJsonLd({
        language: locale.language,
        path,
        name: project.name,
        description: project.summary,
        keywords: project.tags,
        about: project.type,
        sameAs: publicSurfaceItems(project).map((surface) => surface.href).filter((href): href is string => Boolean(href)),
      }),
      breadcrumbJsonLd([
        { name: "Ronnie Wong", url: canonicalUrl("", locale.language) },
        { name: "Projects", url: canonicalUrl("projects.html", locale.language) },
        { name: project.name, url: projectCanonical(project, locale.language) },
      ]),
    ],
  });
  return relativizeProjectDetail(html, "../../", rootPath);
}

function renderSimplePage(source: string, locale: Locale, path: string, altUrl: string, title: string, description: string): string {
  let html = preparePage(source, locale, altUrl, locale.rootPath);
  const isResume = path === "resume.html";
  return applySeo(html, {
    language: locale.language,
    path,
    title,
    description,
    type: isResume ? "profile" : "website",
    jsonLd: isResume
      ? [
          personJsonLd(locale.language),
          profilePageJsonLd(locale.language, path, description),
          breadcrumbJsonLd([
            { name: "Ronnie Wong", url: canonicalUrl("", locale.language) },
            { name: "Resume", url: canonicalUrl(path, locale.language) },
          ]),
        ]
      : [personJsonLd(locale.language), websiteJsonLd(locale.language)],
  });
}

function renderSitemap(projects: Project[]): string {
  const lastmod = new Date().toISOString().slice(0, 10);
  const urls = [
    `${siteUrl}/`,
    `${siteUrl}/projects.html`,
    `${siteUrl}/blog.html`,
    `${siteUrl}/resume.html`,
    `${siteUrl}/en/`,
    `${siteUrl}/en/projects.html`,
    `${siteUrl}/en/blog.html`,
    `${siteUrl}/en/resume.html`,
    ...projects.flatMap((project) => [projectCanonical(project, "mix"), projectCanonical(project, "en")]),
  ];

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map(
      (url) => `  <url>
    <loc>${escapeHtml(url)}</loc>
    <lastmod>${lastmod}</lastmod>
  </url>`
    )
    .join("\n")}\n</urlset>\n`;
}

async function build(): Promise<void> {
  const projects = await readJson<Project[]>("content/projects.seed.json");
  const blogData = await readJson<{ posts: BlogPost[] }>("content/blog.seed.json");
  const projectCopyEn = await readProjectCopyEn();

  await rm(outDir, { recursive: true, force: true });
  await mkdir(outDir, { recursive: true });
  await copyStaticAssets();

  const indexHtml = await readFile(join(root, "index.html"), "utf8");
  const projectsHtml = await readFile(join(root, "projects.html"), "utf8");
  const projectHtml = await readFile(join(root, "project.html"), "utf8");
  const blogHtml = await readFile(join(root, "blog.html"), "utf8");
  const resumeHtml = await readFile(join(root, "resume.html"), "utf8");

  const indexDescription = "This site is a public index of my projects, writings, experiments, and external traces across the web.";
  const resumeDescription = "Resume page in Ronnie Wong's public index, summarizing the background behind the projects, writings, experiments, and external traces across the web.";

  for (const language of Object.keys(locales) as Language[]) {
    const locale = locales[language];
    const projectsForLocale = localizedProjects(projects, language, projectCopyEn);

    await writeOutput(`${locale.outputPrefix}index.html`, renderSimplePage(indexHtml, locale, "", language === "en" ? "../" : "en/", "Ronnie Wong", indexDescription));
    await writeOutput(`${locale.outputPrefix}projects.html`, renderProjectsPage(projectsHtml, projectsForLocale, locale));
    await writeOutput(`${locale.outputPrefix}blog.html`, renderBlogPage(blogHtml, blogData.posts, locale));
    await writeOutput(`${locale.outputPrefix}resume.html`, renderSimplePage(resumeHtml, locale, "resume.html", language === "en" ? "../resume.html" : "en/resume.html", "Resume · Ronnie Wong", resumeDescription));

    if (language === "mix") {
      await writeOutput("project.html", preparePage(projectHtml, locale, "en/projects.html", ""));
    }

    for (const project of projectsForLocale) {
      await writeOutput(`${locale.outputPrefix}projects/${project.id}/index.html`, renderProjectPage(projectHtml, project, projectsForLocale, locale));
    }
  }

  const sitemap = renderSitemap(projects);
  await writeOutput("sitemap.xml", sitemap);
  await writeOutput("sitemap-gsc.xml", sitemap);
  await writeOutput("robots.txt", `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\nSitemap: ${siteUrl}/sitemap-gsc.xml\n`);

  console.log(`Built dist with ${projects.length} projects and ${blogData.posts.length} blog posts.`);
}

build().catch((error) => {
  console.error(error);
  process.exit(1);
});
