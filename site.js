const categoryOrder = ["current", "exploration", "history"];
const categoryLabels = {
  current: "現在",
  exploration: "探索",
  history: "歷史",
};

const languageKey = "site-language";
let activeLanguage = localStorage.getItem(languageKey) === "en" ? "en" : "mix";
let sourceProjects = [];
let sourceBlogPosts = [];
let activeFilter = "all";

const uiCopy = {
  mix: {
    htmlLang: "zh-Hant",
    languageButton: "EN",
    languageLabel: "Switch to English",
    categoryLabels,
    filters: {
      all: "All",
      current: "現在",
      exploration: "探索",
      history: "歷史",
    },
    projectsIntro: "這裡按生命週期整理：現在、探索、歷史。Tag 用來說明能力、平台、形態和資料狀態。",
    blogIntro: "一組公開筆記，用來保留產品工程、Apple 平台、AI workflow 和設計判斷的上下文。",
    blogHeading: "Published notes",
    blogEmpty: "目前沒有公開文章。",
    notFoundBody: "這個 project id 不在目前的資料源裡。請回到 Projects 頁重新選擇。",
    allProjects: "All Projects",
    detailHeadings: {
      narrative: "設計與工程判斷",
      system: "組件和資料可見性",
      surface: "公開工作面",
      practice: "Practice",
    },
  },
  en: {
    htmlLang: "en",
    languageButton: "Mixed",
    languageLabel: "Switch to mixed Chinese and English",
    categoryLabels: {
      current: "Current Projects",
      exploration: "Explorations",
      history: "Historical Projects",
    },
    filters: {
      all: "All",
      current: "Current",
      exploration: "Explorations",
      history: "History",
    },
    projectsIntro: "Projects are organized by lifecycle: current systems, explorations, and historical work. Tags describe capability, platform, format, and source status.",
    blogIntro: "Public notes that keep context around product engineering, Apple platforms, AI workflows, and design judgement.",
    blogHeading: "Published notes",
    blogEmpty: "No public notes are available yet.",
    notFoundBody: "This project id is not available in the current data source. Return to Projects and choose another item.",
    allProjects: "All Projects",
    detailHeadings: {
      narrative: "Design and engineering judgement",
      system: "Components and visibility",
      surface: "Public surfaces",
      practice: "Practice",
    },
  },
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

const projectCopyEn = {
  syncnext: {
    categoryLabel: "Current Project",
    summary: "A tvOS media runtime ecosystem shaped around long-running playback, content sources, plugin/API boundaries, networking rules, and support documentation.",
    capability: "Uses the real constraints of Apple TV as a product boundary, organizing playback, external sources, plugin references, and support tooling into a maintainable system.",
    detail: {
      thesis: "Syncnext is not just a player. It is a media runtime built around playback reliability and flexible content sources. The design question is where each boundary belongs: native app, external source, plugin, or documentation.",
      sections: [
        { title: "Product frame", body: "The system has to handle real devices, real playback sessions, and real maintenance cost. Playback stability, Apple TV focus, subscriptions, FAQ, release cadence, and support all belong to the product surface." },
        { title: "Engineering frame", body: "The main app keeps playback and interaction stable, while the API, plugin reference, networking helper, and predecessor projects absorb volatility around external content sources." },
        { title: "Design frame", body: "The public story should present a small product ecosystem: not a feature checklist, but a maintained system with clear boundaries and explanations." },
      ],
      components: [
        { role: "Playback experience, Apple TV interaction, and product entry point." },
        { role: "Owns metadata and external integration boundaries." },
        { role: "Describes the plugin protocol and extension model." },
        { role: "Keeps the product evolution readable." },
      ],
    },
  },
  "eison-ai": {
    categoryLabel: "Current Project",
    summary: "A local-first AI reading product across iOS, macOS, iPadOS, and Safari Extension, using Cognitive Index to reorganize reading and saving.",
    capability: "Places AI inside reading, saving, indexing, and retrieval workflows so model capability becomes part of interface and data structure.",
    detail: {
      thesis: "eisonAI is not centered on chat. It places AI between capture, indexing, context, and retrieval, so saved material remains understandable after it leaves the original page.",
      sections: [
        { title: "Product frame", body: "The product works on reading friction: long-document routing, saving, context recovery, and privacy-aware AI use without turning the experience into a chatbot." },
        { title: "Engineering frame", body: "The system combines app surfaces, Safari Extension, Cognitive Index, local data management, and CloudKit sync into one reading workflow." },
        { title: "Design frame", body: "The interface story is structure before content: make the shape of information visible first, then make reading and retrieval easier." },
      ],
      components: [
        { role: "Core experience for reading, saving, indexing, and retrieval." },
        { role: "Connects web reading to capture and indexing." },
        { role: "Generates structure and usage context around content." },
        { role: "Readable entry point for Apple platform implementation." },
      ],
    },
  },
  threadbridge: {
    categoryLabel: "Current Project",
    summary: "A workspace-first Codex runtime made from a macOS desktop owner, Telegram adapter, and local management surface, binding real workspaces to continuous Codex sessions.",
    capability: "Turns agent use from one-off terminal sessions into a managed runtime: workspace binding, session continuity, Telegram threads, local TUI, and repair flows have to work as one system.",
    detail: {
      thesis: "threadBridge is a workspace-first Codex runtime. The macOS desktop process is the owner, Telegram is an adapter, and the important work is keeping workspace, session, local TUI, and remote messages on the same maintainable continuity path.",
      sections: [
        { title: "Product frame", body: "The project handles real friction in agent use: starting work from Telegram, running it in a local workspace, knowing whether the session can continue, and recovering when runtime state drifts." },
        { title: "Engineering frame", body: "The system combines a Rust desktop runtime owner, local management API, Telegram adapter, app-server observer, workspace runtime surface, and managed hcodex entrypoint." },
        { title: "Design frame", body: "This is not a chatbot wrapper. It is interaction design for an agent runtime: setup, launch, reconnect, archive, repair, approval, plan mode, and final replies need to be legible and recoverable." },
      ],
      components: [
        { role: "Owns the local management API, tray menu, and runtime reconcile flow." },
        { role: "Routes workspace-thread text, images, questions, and mode switches back to the saved Codex session." },
        { role: "Handles setup, launch, reconnect, archive/restore, runtime repair, and transcript inspection." },
        { role: "Installs managed entrypoints, state files, and local TUI continuation into real workspaces." },
        { role: "Builds the universal app bundle, signing, notarization, DMG, and release candidates." },
      ],
    },
  },
  "trackly-reborn": {
    name: "TracklyReborn",
    categoryLabel: "Current Project",
    summary: "A rebuild of a life and spending log product, combining AI prompts, Shortcuts, Action Button, multi-image capture, and a local database into a high-frequency iOS workflow.",
    capability: "Designs logging as a low-friction system where entry points, data model, AI assistance, and local storage all shape the product feel.",
    detail: {
      thesis: "TracklyReborn remodels life logging around the moment of capture. The work is less about forms and more about quickly saving material that can be structured, reviewed, and assisted by AI later.",
      sections: [
        { title: "Product frame", body: "The hard part of logging products is sustained use. Shortcuts, Action Button, multi-image capture, and AI assistance all reduce the cost of each entry." },
        { title: "Engineering frame", body: "The main app owns local data and visual experience, system entry points handle frequent capture, and prompt/VLM settings bridge fuzzy input with structured records." },
        { title: "Design frame", body: "The project is about merging native iOS workflow surfaces with AI, instead of adding AI as a separate conversation layer." },
      ],
      components: [
        { role: "Local data, capture flow, and core product experience." },
        { role: "Public testing and actual usage entry." },
        { role: "Reduces friction for frequent capture." },
        { role: "Internal rules for AI-assisted input." },
      ],
    },
  },
  adict: {
    categoryLabel: "Current Project",
    summary: "A dictionary and reading-tool ecosystem across iOS and macOS, including rewrite work, protocol boundaries, changelogs, dictionary lists, and usage documentation.",
    capability: "Maintains a tool product over time: lookup experience, data sources, cross-platform consistency, and product documentation all contribute to quality.",
    detail: {
      thesis: "aDict is long-term maintenance work around reading tools. The value is not only the lookup interface, but also dictionary data, platform consistency, update rhythm, and documentation.",
      sections: [
        { title: "Product frame", body: "A dictionary product has to be stable, fast, and predictable. Users feel whether lookup, reading context, data updates, and platform behavior are reliable." },
        { title: "Engineering frame", body: "The rewrite, legacy app, macOS app, protocol layer, and Notion product page together form an evolving reading-tool system." },
        { title: "Design frame", body: "The public story should focus on lookup workflow, reading context, and maintenance craft, not just a single app screenshot." },
      ],
      components: [
        { role: "Product entry point, usage documentation, and public narrative." },
        { role: "Current engineering direction and data-structure evolution." },
        { role: "Part of the multi-platform experience." },
        { role: "Internal protocol and shared boundary." },
      ],
    },
  },
  "hln-machine": {
    categoryLabel: "Exploration",
    summary: "A local AI short-video pipeline that turns a news seed into an observable, restartable, partially rerunnable generation workflow.",
    capability: "Treats generative AI as engineering work: IR, checkpoints, dependency hashes, review points, and failure recovery matter more than a single prompt.",
    detail: {
      thesis: "HLN Machine explores a local AI video factory. It is not about one generated result, but about splitting generation into a white-box pipeline that can be inspected, rerun, and repaired.",
      sections: [
        { title: "Product frame", body: "Short-video generation looks like media automation, but the real work is workflow design: each intermediate state has to be understandable for the system to keep improving." },
        { title: "Engineering frame", body: "The pipeline is organized around IR.json, checkpoints, dependency hashes, partial reruns, and human-reviewable intermediate states, so failures can be located instead of hidden." },
        { title: "Design frame", body: "This is a lab for AI engineering judgement: transparent, diagnosable, and recoverable rather than packaged as a finished product." },
      ],
      components: [
        { role: "Turns news or ideas into processable video seeds." },
        { role: "Generates reviewable short-video text structure." },
        { role: "Connects script structure to visual material." },
        { role: "Supports restart, diagnosis, and partial repair." },
      ],
    },
  },
  "chatgpt-history": {
    categoryLabel: "Exploration",
    summary: "A local analysis pipeline that turns long ChatGPT conversation history into structured reports, timelines, and knowledge artifacts.",
    capability: "Turns AI conversations from searchable archives into legible project memory: session summaries, turn-pair evidence, theme clustering, timelines, and report rendering become one traceable data flow.",
    detail: {
      thesis: "chatgpt-history explores a practical problem: when project thinking is scattered across many ChatGPT sessions, how can it be rebuilt into readable, traceable, reusable project memory instead of preserved as raw chat logs?",
      sections: [
        { title: "Product frame", body: "The project is not about transcript export. It is about returning to a project and recovering its concepts, architecture shifts, engineering decisions, recurring patterns, and unresolved questions." },
        { title: "Engineering frame", body: "The pipeline reads exported ChatGPT markdown, creates session-level summaries, uses turn-pair chunks as evidence, then runs embedding, clustering, knowledge synthesis, timeline generation, and deterministic report rendering." },
        { title: "Design frame", body: "This is knowledge-interface design: the output should read like a technical retrospective, showing how a project formed and which conversations support each theme." },
      ],
      components: [
        { role: "Keeps project conversations and metadata as read-only local analysis input." },
        { role: "Turns each conversation into a structured summary for topic discovery." },
        { role: "Adds fine-grained evidence, recurring concepts, and traceability." },
        { role: "Renders project_knowledge, timeline, and cluster records into readable Markdown/PDF reports." },
      ],
    },
  },
  "enterprise-web-design": {
    categoryLabel: "Historical Project",
    summary: "Historical website design work for enterprise, landmark, and brand sites, covering homepage direction, information hierarchy, visual proposals, and presentation.",
    capability: "Handles large website work from a designer's perspective: hero narrative, visual order, information density, and client communication have to work together.",
    detail: {
      thesis: "This archive organizes early UI/UX design work around large website proposals. The focus is how brand, content hierarchy, and first-screen expression become a presentable direction.",
      sections: [
        { title: "Design frame", body: "Enterprise websites are not single visuals. They require information architecture, homepage rhythm, brand tone, page extensibility, and proposal quality." },
        { title: "Source treatment", body: "Original Keynote files remain internal source material. Public pages should use redacted partial exports and remove client-sensitive information." },
      ],
      components: [
        { name: "SGIT web design", role: "Enterprise website visual direction and homepage structure." },
        { name: "Pearl Tower design", role: "Visual narrative for a landmark website." },
        { name: "Moozy web", role: "Brand website and presentation rhythm." },
      ],
    },
  },
  "nomad-drive": {
    categoryLabel: "Historical Project",
    summary: "A delisted Apple media/file app shaped around third-party players, multiple accounts, iCloud sync, Apple TV playback, and SwiftUI cross-platform reuse.",
    capability: "An early attempt to hold iOS, macOS, and tvOS inside one product and engineering system, where file lists, remote downloads, playback, focus behavior, and SwiftUI reuse all had to be handled.",
    detail: {
      thesis: "Nomad Drive is a historical project worth keeping visible. It shows what happened when a real Apple-platform media/file product tried to share SwiftUI code across iOS, macOS, and tvOS while still dealing with playback, file management, and platform-specific behavior.",
      sections: [
        { title: "Product frame", body: "The product sat around cross-device media and file use: third-party players, multiple accounts, iCloud sync, Apple TV playback, and remote download belonged to the same scenario." },
        { title: "Engineering frame", body: "The Notion archive records playback, subtitles, audio tracks, file operations, recycle bin behavior, network proxy, cache, and tvOS remote/focus work. The SwiftUI article records shared entry points, #if os branches, NavigationView differences, and toolbar limitations." },
        { title: "Design frame", body: "This belongs in the historical category: not a current product claim, but evidence of Apple platform product engineering under real framework and device constraints." },
      ],
      components: [
        { role: "Stores the visual/product archive, feature explanation, testing entry, roadmap, and support material." },
        { role: "Documents practical issues when building one SwiftUI app across iOS, macOS, and tvOS." },
        { role: "Handles VLC / AVPlayer, subtitles, audio tracks, progress, Apple TV remote behavior, and third-party player handoff." },
        { role: "Covers multiple accounts, iCloud sync, file lists, remote downloads, and basic file operations." },
      ],
    },
  },
  "mobile-ui-qa-wallet": {
    categoryLabel: "Historical Project",
    summary: "Historical design work around mobile UI QA, wallet flows, dark interfaces, media kits, and issue templates.",
    capability: "Moves design delivery toward reviewable quality: states, errors, flows, copy, and detail consistency all enter the scope.",
    detail: {
      thesis: "This archive focuses on app UI review and product communication. It moves design from screens to states, flows, and delivery quality.",
      sections: [
        { title: "Design frame", body: "Wallet products contain many states and risk contexts. UI QA has to cover dark mode, guidance copy, flow breaks, error states, and external materials." },
        { title: "Source treatment", body: "Wallet-related work material needs redaction. Public material should keep the method, partial visuals, and QA approach." },
      ],
      components: [
        { name: "BitzenWallet UI Test", role: "Mobile UI QA and issue annotation." },
        { name: "Wallet flow notes", role: "State, risk, and flow organization." },
      ],
    },
  },
  "consumer-app-design": {
    categoryLabel: "Historical Project",
    summary: "Historical product design material for mini programs, cashback, expense logging, and consumer app scenarios, covering flow, interface, and business explanation.",
    capability: "Turns consumer scenarios into clear product paths where user tasks, merchant needs, visual hierarchy, and presentation support one another.",
    detail: {
      thesis: "This archive collects early consumer-product design methods. It includes interface work, but also business flows, user paths, and product framing.",
      sections: [
        { title: "Design frame", body: "Cashback, ordering, membership, and expense logging products require business rules to become low-cost user flows. Interface is the final layer." },
        { title: "Source treatment", body: "Public case studies should select high-quality partial Keynote pages and rewrite the material without exposing client information." },
      ],
      components: [
        { name: "HotCashback", role: "Consumer product and merchant-side flow." },
        { name: "Yuanqi mini program", role: "Membership, ordering, and points flows." },
        { name: "Two-second expense log", role: "Early expense-logging interface and flow." },
      ],
    },
  },
  "brand-visual-identity": {
    categoryLabel: "Historical Project",
    summary: "Historical brand, VI, logo, application, and presentation work, focused on visual systems and brand expression.",
    capability: "Turns abstract brand feeling into a usable visual system where symbols, color, typography, application, and proposal tone support one another.",
    detail: {
      thesis: "This archive is about brand visual systems and presentation. It is not a logo collection, but a set of materials showing how brand judgement moves into application contexts.",
      sections: [
        { title: "Design frame", body: "Brand work needs one tone across symbols, typography, color, layout, application, and external presentation." },
        { title: "System frame", body: "The value is in rules and application, not isolated visuals. Public material should show how a visual system extends into pages, objects, and product contexts." },
        { title: "Source treatment", body: "Public material should use redacted partial visuals, redrawn structures, and method notes without exposing client or former-employer material." },
      ],
      components: [
        { name: "VI case collection", role: "Collection of brand and VI outputs." },
        { name: "Brand application pages", role: "Use of brand rules in pages, materials, and product contexts." },
        { name: "Visual system notes", role: "Judgement behind visual direction." },
      ],
    },
  },
  "ux-audit-product-system": {
    categoryLabel: "Historical Project",
    summary: "UX audit, government/enterprise systems, admin flows, and product-structure notes, focused on diagnosing and organizing complex systems.",
    capability: "Reads complex product systems, separates roles, flows, states, information architecture, and interface issues, then turns them into actionable design documents.",
    detail: {
      thesis: "This archive focuses on product diagnosis and system design. It is not visual display work; it is the organization that follows understanding complex flows, roles, and back-office structures.",
      sections: [
        { title: "Design frame", body: "UX audit turns vague friction into specific problems: information architecture, flow, state, error handling, role comprehension, and interface burden." },
        { title: "System frame", body: "The material includes experience reports, government/judicial systems, hardware control software, and back-office products that can become product-system case studies." },
        { title: "Source treatment", body: "Former-employer and client material needs strong redaction. Public pages should keep method, structure, and selectively redrawn flows." },
      ],
      components: [
        { name: "Authing.cn user experience report", role: "Experience diagnosis and improvement direction." },
        { name: "Fengqiao judicial system", role: "Government/judicial workflow and interface structure." },
        { name: "Hardware control / CMS notes", role: "Complex systems, roles, and back-office flow organization." },
      ],
    },
  },
};

function setupThemeToggle() {
  const button = document.querySelector("[data-theme-toggle]");
  if (!button) return;

  const modes = ["auto", "light", "dark"];
  const labels = {
    auto: "Auto",
    light: "Light",
    dark: "Dark",
  };
  const nextLabels = {
    auto: "light mode",
    light: "dark mode",
    dark: "auto mode",
  };
  const systemPreference = window.matchMedia("(prefers-color-scheme: dark)");

  const storedMode = () => {
    const value = localStorage.getItem("theme");
    return modes.includes(value) ? value : "auto";
  };

  const resolvedTheme = (mode) => (mode === "auto" ? (systemPreference.matches ? "dark" : "light") : mode);

  const applyMode = (mode) => {
    document.documentElement.dataset.themeMode = mode;
    document.documentElement.dataset.theme = resolvedTheme(mode);
  };

  const sync = () => {
    const mode = storedMode();
    applyMode(mode);
    button.dataset.themeMode = mode;
    button.setAttribute("aria-label", `Color mode: ${labels[mode]}. Switch to ${nextLabels[mode]}.`);
    button.setAttribute("title", `Color mode: ${labels[mode]}`);
  };

  sync();
  button.addEventListener("click", () => {
    const mode = storedMode();
    const nextMode = modes[(modes.indexOf(mode) + 1) % modes.length];
    localStorage.setItem("theme", nextMode);
    sync();
  });

  systemPreference.addEventListener("change", () => {
    if (storedMode() === "auto") sync();
  });
}

function activeUi() {
  return uiCopy[activeLanguage] || uiCopy.mix;
}

function setupLanguageToggle() {
  const button = document.querySelector("[data-language-toggle]");
  if (!button) return;

  const sync = () => {
    const ui = activeUi();
    document.documentElement.lang = ui.htmlLang;
    document.documentElement.dataset.language = activeLanguage;
    button.textContent = ui.languageButton;
    button.setAttribute("aria-label", ui.languageLabel);
  };

  sync();
  button.addEventListener("click", () => {
    if (button.dataset.altLanguageUrl) {
      localStorage.setItem(languageKey, activeLanguage === "en" ? "mix" : "en");
      window.location.href = button.dataset.altLanguageUrl;
      return;
    }

    activeLanguage = activeLanguage === "en" ? "mix" : "en";
    localStorage.setItem(languageKey, activeLanguage);
    sync();
    renderAll();
  });
}

function mergeListByIndex(baseItems, overrideItems) {
  if (!overrideItems) return baseItems;
  return baseItems.map((item, index) => ({ ...item, ...(overrideItems[index] || {}) }));
}

function localizedProject(project) {
  if (activeLanguage !== "en") return project;
  const copy = projectCopyEn[project.id];
  if (!copy) return { ...project, categoryLabel: activeUi().categoryLabels[project.category] };

  return {
    ...project,
    ...copy,
    categoryLabel: copy.categoryLabel || activeUi().categoryLabels[project.category],
    detail: {
      ...project.detail,
      ...(copy.detail || {}),
      sections: mergeListByIndex(project.detail.sections, copy.detail?.sections),
      components: mergeListByIndex(project.detail.components, copy.detail?.components),
    },
  };
}

function localizedProjects() {
  return sourceProjects.map(localizedProject);
}

function setText(selector, text) {
  const element = document.querySelector(selector);
  if (element && text) element.textContent = text;
}

function applyStaticCopy() {
  const ui = activeUi();
  document.documentElement.lang = ui.htmlLang;
  document.documentElement.dataset.language = activeLanguage;

  if (document.body.dataset.page === "projects") {
    setText(".page-hero p:not(.eyebrow)", ui.projectsIntro);
  }

  if (document.body.dataset.page === "blog") {
    setText(".page-hero p:not(.eyebrow)", ui.blogIntro);
    setText("#blog-list-title", ui.blogHeading);
  }

  document.querySelectorAll("[data-filter]").forEach((button) => {
    button.textContent = ui.filters[button.dataset.filter] || button.textContent;
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
  if (document.documentElement.dataset.staticProjectUrls === "true") {
    const rootPath = document.body?.dataset.rootPath || "";
    const projectUrlPrefix = document.body?.dataset.projectUrlPrefix ?? rootPath;
    return `${projectUrlPrefix}projects/${encodeURIComponent(project.id)}/`;
  }

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
  const ui = activeUi();

  return categoryOrder
    .map((category) => {
      const items = visible.filter((project) => project.category === category);
      if (!items.length) return "";

      return `
        <section class="project-group" id="${category === "history" ? "history" : category}">
          <div class="section-header">
            <p class="eyebrow">${category}</p>
            <h2>${ui.categoryLabels[category]}</h2>
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
  mount.innerHTML = groupedMarkup(projects, activeFilter);

  filters.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.filter === activeFilter);
    button.onclick = () => {
      activeFilter = button.dataset.filter;
      renderProjects(localizedProjects());
    };
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

function publicSurfaceItems(project) {
  if (project.detail.surfaces?.length) return project.detail.surfaces;

  return project.links.map((link) => ({
    label: link.label,
    kind: "Public URL",
    href: link.href,
    role: "Public entry connected to this project.",
  }));
}

function surfaceMarkup(surface) {
  const content = `
    <span class="surface-kind">${surface.kind || "Public URL"}</span>
    <strong>${surface.label}</strong>
    <p>${surface.role || ""}</p>
  `;

  if (!surface.href) {
    return `<article class="surface-item is-pending">${content}</article>`;
  }

  return `
    <a class="surface-item" href="${surface.href}" target="_blank" rel="noreferrer">
      ${content}
      <span class="surface-url">${surface.href.replace(/^https?:\/\//, "")}</span>
    </a>
  `;
}

function renderProjectDetail(projects) {
  const mount = document.querySelector("#project-detail");
  if (!mount) return;

  const params = new URLSearchParams(window.location.search);
  const id = document.body.dataset.projectId || params.get("id");
  const project = projects.find((item) => item.id === id);

  if (!project) {
    const ui = activeUi();
    document.title = "Project not found · Ronnie Wong";
    mount.innerHTML = `
      <section class="page-hero compact">
        <p class="eyebrow">Project detail</p>
        <h1>Project not found</h1>
        <p>${ui.notFoundBody}</p>
        <div class="hero-actions">
          <a class="button primary" href="projects.html">${ui.allProjects}</a>
        </div>
      </section>
    `;
    return;
  }

  document.title = `${project.name} · Ronnie Wong`;
  const ui = activeUi();
  const projectIndex = projects.findIndex((item) => item.id === project.id);
  const surfaces = publicSurfaceItems(project);
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
          <span>${ui.detailHeadings.practice}</span>
          <p>${project.capability}</p>
        </div>
        <div class="project-links vertical">
          <a href="projects.html">${ui.allProjects}</a>
          ${project.links.map((link) => `<a href="${link.href}">${link.label}</a>`).join("")}
        </div>
      </aside>

      <div class="detail-main">
        <section class="detail-section">
          <div class="section-header">
            <p class="eyebrow">Narrative</p>
            <h2>${ui.detailHeadings.narrative}</h2>
          </div>
          <div class="detail-notes">
            ${detailSections(project.detail.sections)}
          </div>
        </section>

        <section class="detail-section">
          <div class="section-header">
            <p class="eyebrow">System</p>
            <h2>${ui.detailHeadings.system}</h2>
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
            <h2>${ui.detailHeadings.surface}</h2>
          </div>
          <div class="surface-list">
            ${surfaces.map(surfaceMarkup).join("")}
          </div>
        </section>
      </div>
    </section>
  `;
}

function renderBlog() {
  const mount = document.querySelector("#blog-list");
  if (!mount) return;

  const ui = activeUi();
  const posts = sourceBlogPosts.filter((post) => post.public !== false);

  if (!posts.length) {
    mount.innerHTML = `<p class="blog-empty">${ui.blogEmpty}</p>`;
    return;
  }

  const years = [...new Set(posts.map((post) => post.year || "Notes"))];
  mount.innerHTML = years
    .map((year) => {
      const items = posts.filter((post) => (post.year || "Notes") === year);
      return `
        <section class="blog-year" aria-labelledby="blog-year-${year}">
          <h3 id="blog-year-${year}">${year}</h3>
          <div class="blog-items">
            ${items
              .map(
                (post) => `
                  <article class="blog-item">
                    <a href="${post.notionUrl}" target="_blank" rel="noreferrer">
                      <span class="blog-title">${post.title}</span>
                      <span class="blog-meta">${post.tag || "Note"}</span>
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

function renderAll() {
  applyStaticCopy();
  const projects = localizedProjects();
  renderHome(projects);
  renderProjects(projects);
  renderProjectDetail(projects);
  renderBlog();
}

async function boot() {
  if (document.body?.dataset.staticLanguage) {
    activeLanguage = document.body.dataset.staticLanguage === "en" ? "en" : "mix";
  }
  setupThemeToggle();
  setupLanguageToggle();
  const rootPath = document.body?.dataset.rootPath || "";
  const [projectsResponse, blogResponse] = await Promise.all([
    fetch(`${rootPath}content/projects.seed.json`, { cache: "no-store" }),
    fetch(`${rootPath}content/blog.seed.json`, { cache: "no-store" }),
  ]);
  sourceProjects = await projectsResponse.json();
  if (blogResponse.ok) {
    const blogData = await blogResponse.json();
    sourceBlogPosts = blogData.posts || [];
  }
  renderAll();
}

boot().catch(() => {
  document.documentElement.classList.add("is-static-fallback");
});
