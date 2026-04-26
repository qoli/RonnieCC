# RonnieCC

Public index for Ronnie Wong.

This repository powers [ronniewong.cc](https://ronniewong.cc), a static public index of my projects, writings, experiments, and external traces across the web. It is not an app catalog: the site is organized around projects, explorations, writing, historical design work, and a web resume.

## Site Structure

- `index.html` presents the primary statement and selected capability signals.
- `projects.html` lists current, exploration, and historical projects.
- `project.html` renders project detail pages from `content/projects.seed.json`.
- `blog.html` renders public writing synced from Notion.
- `resume.html` presents the public resume.

## Content Sources

- `content/projects.seed.json` is the canonical project index used by the project list and detail pages.
- `content/blog.seed.json` is generated from the public Notion blog database.
- `docs/data-sources.md` records the working content model and source decisions.
- `docs/visual-direction.md` records the current design direction.

## Local Preview

This is a static site. Serve the folder with any static server:

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

Then open:

```text
http://127.0.0.1:4173/
```

## Blog Sync

The blog list is generated from a public Notion database. No `NOTION_TOKEN` is required for the current public sync path.

```sh
sh scripts/update-blog.sh
```

## Hosting

- GitHub Pages source: `main` branch, repository root.
- Custom domain: `ronniewong.cc`.
- DNS is managed in Cloudflare.

## Repository Metadata

- GitHub: [qoli/RonnieCC](https://github.com/qoli/RonnieCC)
- Website: [ronniewong.cc](https://ronniewong.cc)
