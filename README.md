# RonnieCC

Public index for Ronnie Wong.

This repository powers [ronniewong.cc](https://ronniewong.cc), a static public index of my projects, writings, experiments, and external traces across the web. Apps has a dedicated product entry page; projects, explorations, writing, historical design work, and a web resume retain their own surfaces.

## Site Structure

- `index.html` presents the primary statement and selected capability signals.
- `apps.html` is the source template for `/apps/` and `/en/apps/`, an image-led directory linking directly to product websites or repositories. It currently showcases aDict and localClash; this surface has no internal product detail pages.
- `projects.html` lists current, exploration, and historical projects.
- `project.html` remains the legacy dynamic project detail fallback.
- `src/build.ts` generates static HTML into `dist/`, including clean project URLs such as `/projects/syncnext/`.
- `src/seo.ts` centralizes canonical URLs, `hreflang`, Open Graph, Twitter metadata, identity links, and JSON-LD.
- `og-image.svg` and `og-image.png` provide the default social preview image.
- `blog.html` renders the writing index as build-time static HTML, and each public note is generated as an internal static page under `/blog/<slug>/`.
- `resume.html` presents the public resume.

## Content Sources

- `content/projects.seed.json` is the canonical project index used by the project list and detail pages.
- `content/apps.seed.json` drives the Apps directory. Each app can supply multiple `showcase.images`, all linking to the same `externalUrl`. Image metadata includes a stable ID, alt text, and logical display dimensions; the supplied Figma frames are 2× pixel assets, so the display width and height are half the export dimensions. `previewDark` is optional for artwork shared across themes; `layout: "full"` places a wide image on its own row. Current aDict iPhone/Mac and localClash artwork is exported from the supplied Figma frames into `assets/apps/`, preserving transparency and crop. The gallery uses proportional, unequal-width rows inspired by ssemenov.com, a 1200px maximum width, and single-column mobile layout. Images never exceed their logical native width.
- `content/blog.seed.json` is generated from the public Notion blog database and includes article metadata plus a build-time block snapshot. Synced Notion images are downloaded under `content/blog-assets/`.
- `docs/data-sources.md` records the working content model and source decisions.
- `docs/visual-direction.md` records the current design direction.

## Static Build

The production direction is a small Bun-powered static index generator, without an application framework.

```sh
bun run build
```

The generated `dist/` folder contains static HTML for:

- `index.html`
- `en/index.html`
- `apps/index.html`
- `en/apps/index.html`
- `projects.html`
- `en/projects.html`
- `blog.html`
- `en/blog.html`
- every blog article page under `blog/<post-slug>/`
- every English blog article page under `en/blog/<post-slug>/`
- `rss.xml`
- `resume.html`
- `en/resume.html`
- every project detail page under `projects/<project-id>/`
- every English project detail page under `en/projects/<project-id>/`
- `sitemap.xml`
- `robots.txt`

The default language is the mixed Chinese/English site. English pages live under `/en/`.
Both language versions use their own canonical URLs and reciprocal `hreflang` links. The generated pages also include Open Graph, Twitter card metadata, `Person`/`WebSite`/`CollectionPage`/`CreativeWork` JSON-LD, RSS autodiscovery for `/rss.xml`, and a sitemap with `lastmod`. `robots.txt` points crawlers to the Worker-hosted RonnieCC sitemap at `https://ronniewong-sitemaps.ronnie.workers.dev/ronniecc.xml`; the Worker mirrors the generated site sitemap so Search Console uses the tested `workers.dev` fetch path.

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

The blog index and article pages are generated from a public Notion database. The production Blog index is a static HTML list generated at build time; browser-side JSON loading is only a direct-source fallback. No `NOTION_TOKEN` is required for the current public sync path.
RonnieCC is the implicit default publishing target for every public post. The Notion `子站點` multi-select adds extra product subsite targets, and `content/blog.seed.json` is the contract that subsites consume.

```sh
sh scripts/update-blog.sh
```

See `docs/blog-distribution.md` for the subsite distribution contract.

## Hosting

- GitHub Pages source: GitHub Actions.
- `.github/workflows/deploy-pages.yml` builds the site with Bun and deploys the generated `dist/` artifact.
- Custom domain: `ronniewong.cc`.
- DNS is managed in Cloudflare.

## Repository Metadata

- GitHub: [qoli/RonnieCC](https://github.com/qoli/RonnieCC)
- Website: [ronniewong.cc](https://ronniewong.cc)
