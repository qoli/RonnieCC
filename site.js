const categoryOrder = ["current", "exploration", "history"];
const categoryLabels = {
  current: "現在的 Project",
  exploration: "探索",
  history: "歷史的 Project",
};

function projectVisual(project, index) {
  const number = String(index + 1).padStart(2, "0");

  return `
    <div class="project-visual" aria-hidden="true">
      <span class="visual-label">${project.type}</span>
      <strong>${project.name}</strong>
      <div class="visual-lines">
        <span></span>
        <span></span>
        <span></span>
      </div>
      <span class="project-index">${number}</span>
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
  mount.innerHTML = `
    <section class="page-hero compact detail-hero" aria-labelledby="detail-title">
      <p class="eyebrow">${project.categoryLabel} · ${project.type}</p>
      <h1 id="detail-title">${project.name}</h1>
      <p>${project.detail.thesis}</p>
      <div class="tags detail-tags">${tagList(project.tags)}</div>
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
  const response = await fetch("content/projects.seed.json");
  const projects = await response.json();

  renderHome(projects);
  renderProjects(projects);
  renderProjectDetail(projects);
}

boot().catch(() => {
  document.documentElement.classList.add("is-static-fallback");
});
