const categoryOrder = ["current", "exploration", "history"];
const categoryLabels = {
  current: "現在的 Project",
  exploration: "探索",
  history: "歷史的 Project",
};

const projectGlyphs = {
  syncnext: `
    <rect x="20" y="26" width="80" height="68"></rect>
    <path d="M42 42l28 18-28 18Z"></path>
    <path d="M22 104h76"></path>
    <circle cx="96" cy="22" r="8"></circle>
    <circle cx="24" cy="98" r="8"></circle>
  `,
  "eison-ai": `
    <circle cx="60" cy="60" r="42"></circle>
    <circle cx="60" cy="60" r="16"></circle>
    <path d="M24 60h72M60 24v72"></path>
    <path d="M36 36 84 84M84 36 36 84"></path>
  `,
  "trackly-reborn": `
    <path d="M24 94 46 70l18 10 34-52"></path>
    <circle cx="24" cy="94" r="7"></circle>
    <circle cx="46" cy="70" r="7"></circle>
    <circle cx="64" cy="80" r="7"></circle>
    <circle cx="98" cy="28" r="7"></circle>
    <path d="M24 28h46M24 46h30"></path>
  `,
  adict: `
    <path d="M24 26h30c8 0 14 6 14 14v54H38c-8 0-14-6-14-14Z"></path>
    <path d="M68 40c0-8 6-14 14-14h14v68H68"></path>
    <path d="M38 48h16M38 64h16M82 48h14"></path>
    <circle cx="84" cy="76" r="10"></circle>
    <path d="M92 84l12 12"></path>
  `,
  "hln-machine": `
    <rect x="18" y="24" width="26" height="26"></rect>
    <rect x="76" y="24" width="26" height="26"></rect>
    <rect x="47" y="72" width="26" height="26"></rect>
    <path d="M44 37h32M89 50 73 72M31 50l16 22"></path>
    <path d="M56 82l10 5-10 5Z"></path>
  `,
  "enterprise-web-design": `
    <rect x="18" y="24" width="84" height="72"></rect>
    <path d="M18 42h84M38 24v72"></path>
    <path d="M50 56h38M50 72h28M50 84h46"></path>
    <circle cx="28" cy="33" r="3"></circle>
  `,
  "mobile-ui-qa-wallet": `
    <rect x="34" y="18" width="52" height="84" rx="10"></rect>
    <path d="M48 34h24M48 48h18M48 76h18"></path>
    <path d="M47 62l7 7 17-18"></path>
    <circle cx="60" cy="90" r="3"></circle>
  `,
  "consumer-app-design": `
    <rect x="18" y="24" width="30" height="30"></rect>
    <rect x="72" y="24" width="30" height="30"></rect>
    <rect x="45" y="72" width="30" height="30"></rect>
    <path d="M48 39h24M87 54 75 72M33 54l12 18"></path>
    <path d="M56 84h8"></path>
  `,
  "brand-visual-identity": `
    <circle cx="42" cy="42" r="22"></circle>
    <circle cx="78" cy="42" r="22"></circle>
    <path d="M30 82h60M42 68v28M78 68v28"></path>
    <rect x="34" y="76" width="52" height="20"></rect>
  `,
  "ux-audit-product-system": `
    <path d="M18 32h84M18 60h84M18 88h84"></path>
    <circle cx="34" cy="32" r="8"></circle>
    <circle cx="72" cy="60" r="8"></circle>
    <circle cx="48" cy="88" r="8"></circle>
    <path d="M42 32c18 0 12 28 22 28M64 60c-16 0-8 28-16 28"></path>
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
          <span>Capability</span>
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
            <h2>這個 project 要說明什麼</h2>
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
            <p class="eyebrow">Proof</p>
            <h2>可以支撐的能力證據</h2>
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
