const grid = document.querySelector("#app-grid");
const filters = [...document.querySelectorAll("[data-filter]")];

const statusLabels = {
  active: "Active",
  testflight: "TestFlight",
  not_started: "Not started",
};

const preferredLabels = {
  "eison-ai": "E",
  "trackly-reborn": "T",
  syncnext: "S",
  adict: "aD",
};

function iconLabel(app) {
  if (preferredLabels[app.id]) return preferredLabels[app.id];

  return app.name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2);
}

function renderApps(apps, filter = "all") {
  const visible = filter === "all" ? apps : apps.filter((app) => app.status === filter);

  grid.innerHTML = visible
    .map(
      (app) => `
        <article class="app-card">
          <div class="card-top">
            <div class="app-icon theme-${app.id}">${iconLabel(app)}</div>
            <span class="status">${statusLabels[app.status] || app.status}</span>
          </div>
          <h3>${app.name}</h3>
          <p>${app.description}</p>
          <div class="platforms">
            ${app.platforms.map((platform) => `<span>${platform}</span>`).join("")}
          </div>
          <div class="card-actions">
            ${app.primaryCta ? `<a href="${app.primaryCta.href}">${app.primaryCta.label}</a>` : ""}
            ${app.externalUrl ? `<a href="${app.externalUrl}">Link</a>` : ""}
            <a href="${app.sourceUrl}">Notion</a>
          </div>
        </article>
      `
    )
    .join("");
}

async function boot() {
  const response = await fetch("content/apps.seed.json");
  const apps = (await response.json()).filter((app) => app.status !== "archived");
  renderApps(apps);

  filters.forEach((button) => {
    button.addEventListener("click", () => {
      filters.forEach((item) => item.classList.toggle("is-active", item === button));
      renderApps(apps, button.dataset.filter);
    });
  });
}

boot().catch(() => {
  // The static fallback in index.html remains usable if the JSON cannot be loaded.
});
