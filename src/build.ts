import { mkdir, rm, copyFile, readdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

type ProjectCategory = "current" | "exploration" | "history";

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
const siteUrl = "https://ronniewong.cc";
const categoryOrder: ProjectCategory[] = ["current", "exploration", "history"];
const categoryLabels: Record<ProjectCategory, string> = {
  current: "現在",
  exploration: "探索",
  history: "歷史",
};

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

function projectCanonical(project: Project): string {
  return `${siteUrl}/projects/${encodeURIComponent(project.id)}/`;
}

function truncate(value: string, max = 160): string {
  const text = value.replace(/\s+/g, " ").trim();
  return text.length <= max ? text : `${text.slice(0, max - 1).trim()}…`;
}

function withStaticMode(html: string): string {
  return html.replace("<html lang=\"zh-Hant\">", "<html lang=\"zh-Hant\" data-static-project-urls=\"true\">");
}

function setHeadMeta(html: string, title: string, description: string, canonical: string): string {
  return html
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(title)}</title>`)
    .replace(
      /<meta\s+name="description"\s+content="[\s\S]*?"\s*>/,
      `<meta\n      name="description"\n      content="${escapeAttr(description)}"\n    >`
    )
    .replace(/<link rel="canonical" href="[^"]+">/, `<link rel="canonical" href="${escapeAttr(canonical)}">`);
}

function injectHead(html: string, content: string): string {
  return html.replace("</head>", `${content}\n  </head>`);
}

function jsonLd(data: unknown): string {
  const json = JSON.stringify(data).replaceAll("</script", "<\\/script");
  return `    <script type="application/ld+json">${json}</script>`;
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

function groupedProjects(projects: Project[], prefix = ""): string {
  return categoryOrder
    .map((category) => {
      const items = projects.filter((project) => project.category === category);
      if (!items.length) return "";

      return `
        <section class="project-group" id="${category === "history" ? "history" : category}">
          <div class="section-header">
            <p class="eyebrow">${escapeHtml(category)}</p>
            <h2>${escapeHtml(categoryLabels[category])}</h2>
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

function projectDetailMain(project: Project, projects: Project[]): string {
  const projectIndex = projects.findIndex((item) => item.id === project.id);
  const surfaces = publicSurfaceItems(project);

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
          <span>Practice</span>
          <p>${escapeHtml(project.capability)}</p>
        </div>
        <div class="project-links vertical">
          <a href="../../projects.html">All Projects</a>
          ${project.links.map((link) => `<a href="${escapeAttr(link.href)}">${escapeHtml(link.label)}</a>`).join("")}
        </div>
      </aside>

      <div class="detail-main">
        <section class="detail-section">
          <div class="section-header">
            <p class="eyebrow">Narrative</p>
            <h2>設計與工程判斷</h2>
          </div>
          <div class="detail-notes">
            ${detailSections(project.detail.sections)}
          </div>
        </section>

        <section class="detail-section">
          <div class="section-header">
            <p class="eyebrow">System</p>
            <h2>組件和資料可見性</h2>
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
            <h2>公開工作面</h2>
          </div>
          <div class="surface-list">
            ${surfaces.map(surfaceMarkup).join("")}
          </div>
        </section>
      </div>
    </section>
  </main>`;
}

function blogList(posts: BlogPost[]): string {
  const visiblePosts = posts.filter((post) => post.public !== false);
  if (!visiblePosts.length) return `<p class="blog-empty">目前沒有公開文章。</p>`;

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

function relativizeProjectDetail(html: string): string {
  return html
    .replaceAll('href="index.html"', 'href="../../index.html"')
    .replaceAll('href="projects.html"', 'href="../../projects.html"')
    .replaceAll('href="blog.html"', 'href="../../blog.html"')
    .replaceAll('href="resume.html"', 'href="../../resume.html"')
    .replaceAll('href="styles.css"', 'href="../../styles.css"')
    .replaceAll('href="favicon.ico"', 'href="../../favicon.ico"')
    .replaceAll('href="favicon.svg"', 'href="../../favicon.svg"')
    .replaceAll('src="site.js"', 'src="../../site.js"');
}

function projectJsonLd(project: Project): string {
  return jsonLd({
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.name,
    description: project.summary,
    url: projectCanonical(project),
    creator: {
      "@type": "Person",
      name: "Ronnie Wong",
      url: siteUrl,
    },
    keywords: project.tags,
    about: project.type,
    sameAs: publicSurfaceItems(project).map((surface) => surface.href).filter(Boolean),
  });
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
  for (const file of ["styles.css", "site.js", "favicon.ico", "favicon.svg", "CNAME", ".nojekyll"]) {
    await copyFile(join(root, file), join(outDir, file));
  }
}

function renderProjectsPage(source: string, projects: Project[]): string {
  const html = withStaticMode(source).replace(
    '<div class="grouped-projects" id="project-groups" aria-live="polite"></div>',
    `<div class="grouped-projects" id="project-groups" aria-live="polite">${groupedProjects(projects)}</div>`
  );

  return injectHead(
    html,
    jsonLd({
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Ronnie Wong Projects",
      itemListElement: projects.map((project, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: project.name,
        url: projectCanonical(project),
      })),
    })
  );
}

function renderBlogPage(source: string, posts: BlogPost[]): string {
  const visiblePosts = posts.filter((post) => post.public !== false);
  const html = withStaticMode(source).replace(
    '<div class="blog-list" id="blog-list" aria-live="polite"></div>',
    `<div class="blog-list" id="blog-list" aria-live="polite">${blogList(visiblePosts)}</div>`
  );

  return injectHead(
    html,
    jsonLd({
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Ronnie Wong Writing Index",
      itemListElement: visiblePosts.map((post, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: post.title,
        url: post.notionUrl,
      })),
    })
  );
}

function renderProjectPage(source: string, project: Project, projects: Project[]): string {
  let html = withStaticMode(source)
    .replace(
      '<body data-page="project-detail">',
      `<body data-page="project-detail" data-project-id="${escapeAttr(project.id)}" data-root-path="../../">`
    )
    .replace(/<main id="project-detail" aria-live="polite">[\s\S]*?<\/main>/, projectDetailMain(project, projects));

  html = setHeadMeta(html, `${project.name} · Ronnie Wong`, truncate(project.summary), projectCanonical(project));
  html = injectHead(html, projectJsonLd(project));
  return relativizeProjectDetail(html);
}

function renderSitemap(projects: Project[]): string {
  const urls = [
    `${siteUrl}/`,
    `${siteUrl}/projects.html`,
    `${siteUrl}/blog.html`,
    `${siteUrl}/resume.html`,
    ...projects.map(projectCanonical),
  ];

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map((url) => `  <url><loc>${escapeHtml(url)}</loc></url>`)
    .join("\n")}\n</urlset>\n`;
}

async function build(): Promise<void> {
  const projects = await readJson<Project[]>("content/projects.seed.json");
  const blogData = await readJson<{ posts: BlogPost[] }>("content/blog.seed.json");

  await rm(outDir, { recursive: true, force: true });
  await mkdir(outDir, { recursive: true });
  await copyStaticAssets();

  const indexHtml = withStaticMode(await readFile(join(root, "index.html"), "utf8"));
  const projectsHtml = await readFile(join(root, "projects.html"), "utf8");
  const projectHtml = await readFile(join(root, "project.html"), "utf8");
  const blogHtml = await readFile(join(root, "blog.html"), "utf8");
  const resumeHtml = withStaticMode(await readFile(join(root, "resume.html"), "utf8"));

  await writeOutput("index.html", indexHtml);
  await writeOutput("projects.html", renderProjectsPage(projectsHtml, projects));
  await writeOutput("project.html", withStaticMode(projectHtml));
  await writeOutput("blog.html", renderBlogPage(blogHtml, blogData.posts));
  await writeOutput("resume.html", resumeHtml);

  for (const project of projects) {
    await writeOutput(`projects/${project.id}/index.html`, renderProjectPage(projectHtml, project, projects));
  }

  await writeOutput("sitemap.xml", renderSitemap(projects));
  await writeOutput("robots.txt", `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`);

  console.log(`Built dist with ${projects.length} projects and ${blogData.posts.length} blog posts.`);
}

build().catch((error) => {
  console.error(error);
  process.exit(1);
});
