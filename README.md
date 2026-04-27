# RonnieCC

Public index for Ronnie Wong.

This repository powers [ronniewong.cc](https://ronniewong.cc), a static public index of my projects, writings, experiments, and external traces across the web. It is not an app catalog: the site is organized around projects, explorations, writing, historical design work, and a web resume.

## Site Structure

- `index.html` presents the primary statement and selected capability signals.
- `projects.html` lists current, exploration, and historical projects.
- `project.html` remains the legacy dynamic project detail fallback.
- `src/build.ts` generates static HTML into `dist/`, including clean project URLs such as `/projects/syncnext/`.
- `blog.html` renders public writing synced from Notion.
- `resume.html` presents the public resume.

## Content Sources

- `content/projects.seed.json` is the canonical project index used by the project list and detail pages.
- `content/blog.seed.json` is generated from the public Notion blog database.
- `docs/data-sources.md` records the working content model and source decisions.
- `docs/visual-direction.md` records the current design direction.

## Static Build

The production direction is a small Bun-powered static index generator, without an application framework.

```sh
bun run build
```

The generated `dist/` folder contains static HTML for:

- `index.html`
- `projects.html`
- `blog.html`
- `resume.html`
- every project detail page under `projects/<project-id>/`
- `sitemap.xml`
- `robots.txt`

## Local Preview

Build and serve `dist/`:

```sh
bun run build
bun run preview:dist
```

Then open:

```text
http://127.0.0.1:4180/
```

The source HTML files can still be served directly for development fallback, but SEO-facing checks should use `dist/`.

## Blog Sync

The blog list is generated from a public Notion database. No `NOTION_TOKEN` is required for the current public sync path.

```sh
sh scripts/update-blog.sh
```

## Hosting

- GitHub Pages source: `main` branch, repository root.
- Custom domain: `ronniewong.cc`.
- DNS is managed in Cloudflare.
- The static generator currently builds to `dist/`; switching GitHub Pages deployment to the generated artifact is the next deployment step.

## Repository Metadata

- GitHub: [qoli/RonnieCC](https://github.com/qoli/RonnieCC)
- Website: [ronniewong.cc](https://ronniewong.cc)
