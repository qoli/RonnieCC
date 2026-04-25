const categoryOrder = ["current", "exploration", "history"];
const categoryLabels = {
  current: "現在的 Project",
  exploration: "探索",
  history: "歷史的 Project",
};

const projectGlyphs = {
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
  "enterprise-web-design": `
    <rect x="22" y="28" width="76" height="64"></rect>
    <path d="M22 50h76M46 28v64"></path>
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

function setupThemeToggle() {
  const button = document.querySelector("[data-theme-toggle]");
  if (!button) return;

  const sync = () => {
    const isDark = document.documentElement.dataset.theme === "dark";
    button.setAttribute("aria-pressed", String(isDark));
    button.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
  };

  sync();
  button.addEventListener("click", () => {
    const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = nextTheme;
    localStorage.setItem("theme", nextTheme);
    sync();
  });
}

function projectVisual(project, index, variant = "card") {
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

function tagList(tags) {
  return tags.map((tag) => `<span>${tag}</span>`).join("");
}

function projectUrl(project) {
  return `project.html?id=${encodeURIComponent(project.id)}`;
}

function projectCard(project, index) {
  return `
    <article class="project-card" data-category="${project.category}" id="${project.id}">
      ${projectVisual(project, index)}
      <div class="project-body">
        <div class="project-meta">
          <span>${project.categoryLabel}</span>
          <span>${project.status}</span>
        </div>
        <h3>${project.name}</h3>
        <p class="project-type">${project.type}</p>
        <p>${project.summary}</p>
        <blockquote>${project.capability}</blockquote>
        <div class="tags">${tagList(project.tags)}</div>
        <div class="project-links">
          <a href="${projectUrl(project)}">Detail</a>
          ${project.links.map((link) => `<a href="${link.href}">${link.label}</a>`).join("")}
        </div>
      </div>
    </article>
  `;
}

function renderHome(projects) {
  const mount = document.querySelector("#home-projects");
  if (!mount) return;

  const featured = projects.filter((project) => project.category !== "history").slice(0, 5);
  mount.innerHTML = featured.map(projectCard).join("");
}

function groupedMarkup(projects, filter = "all") {
  const visible = filter === "all" ? projects : projects.filter((project) => project.category === filter);

  return categoryOrder
    .map((category) => {
      const items = visible.filter((project) => project.category === category);
      if (!items.length) return "";

      return `
        <section class="project-group" id="${category === "history" ? "history" : category}">
          <div class="section-header">
            <p class="eyebrow">${category}</p>
            <h2>${categoryLabels[category]}</h2>
          </div>
          <div class="project-grid">
            ${items.map(projectCard).join("")}
          </div>
        </section>
      `;
    })
    .join("");
}

function renderProjects(projects) {
  const mount = document.querySelector("#project-groups");
  if (!mount) return;

  const filters = [...document.querySelectorAll("[data-filter]")];
  mount.innerHTML = groupedMarkup(projects);

  filters.forEach((button) => {
    button.addEventListener("click", () => {
      filters.forEach((item) => item.classList.toggle("is-active", item === button));
      mount.innerHTML = groupedMarkup(projects, button.dataset.filter);
    });
  });
}

function componentRows(components) {
  return components
    .map(
      (component) => `
        <tr>
          <td>${component.name}</td>
          <td>${component.type}</td>
          <td>${component.visibility}</td>
          <td>${component.role}</td>
        </tr>
      `
    )
    .join("");
}

function detailSections(sections) {
  return sections
    .map(
      (section) => `
        <article class="detail-note">
          <h3>${section.title}</h3>
          <p>${section.body}</p>
        </article>
      `
    )
    .join("");
}

function renderProjectDetail(projects) {
  const mount = document.querySelector("#project-detail");
  if (!mount) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const project = projects.find((item) => item.id === id);

  if (!project) {
    document.title = "Project not found · Ronnie Wong";
    mount.innerHTML = `
      <section class="page-hero compact">
        <p class="eyebrow">Project detail</p>
        <h1>Project not found</h1>
        <p>這個 project id 不在目前的資料源裡。請回到 Projects 頁重新選擇。</p>
        <div class="hero-actions">
          <a class="button primary" href="projects.html">All Projects</a>
        </div>
      </section>
    `;
    return;
  }

  document.title = `${project.name} · Ronnie Wong`;
  const projectIndex = projects.findIndex((item) => item.id === project.id);
  mount.innerHTML = `
    <section class="page-hero compact detail-hero" aria-labelledby="detail-title">
      <div class="detail-hero-grid">
        <div>
          <p class="eyebrow">${project.categoryLabel} · ${project.type}</p>
          <h1 id="detail-title">${project.name}</h1>
          <p>${project.detail.thesis}</p>
          <div class="tags detail-tags">${tagList(project.tags)}</div>
        </div>
        ${projectVisual(project, projectIndex, "detail")}
      </div>
    </section>

    <section class="section detail-layout">
      <aside class="detail-aside" aria-label="Project metadata">
        <div class="detail-aside-block">
          <span>Status</span>
          <strong>${project.status}</strong>
        </div>
        <div class="detail-aside-block">
          <span>Category</span>
          <strong>${project.categoryLabel}</strong>
        </div>
        <div class="detail-aside-block">
          <span>Practice</span>
          <p>${project.capability}</p>
        </div>
        <div class="project-links vertical">
          <a href="projects.html">All Projects</a>
          ${project.links.map((link) => `<a href="${link.href}">${link.label}</a>`).join("")}
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
            <p class="eyebrow">Surface</p>
            <h2>可閱讀的工作面</h2>
          </div>
          <ul class="proof-list">
            ${project.detail.proof.map((item) => `<li>${item}</li>`).join("")}
          </ul>
        </section>
      </div>
    </section>
  `;
}

async function boot() {
  setupThemeToggle();

  const response = await fetch("content/projects.seed.json", { cache: "no-store" });
  const projects = await response.json();

  renderHome(projects);
  renderProjects(projects);
  renderProjectDetail(projects);
}

boot().catch(() => {
  document.documentElement.classList.add("is-static-fallback");
});
