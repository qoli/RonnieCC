# Ronnie Apps Website Initialization Notes

Prepared from Notion on 2026-04-25.

## Direction

Build this as a product-group website for Ronnie Apps, not as a generic personal portfolio. The first screen should make `Ronnie Apps` visible and immediately show the active apps, with supporting paths for documentation, updates, privacy/terms, feedback, and engineering writing.

The strongest Notion source is the `Apps` page, which contains the `All Ronnie Apps` database. That database defines the app inventory schema:

- `Name`
- `Status`: `Not started`, `TestFlight`, `已下架`, `正在上架`
- `Tags`: `iOS`, `tvOS`, `Web`, `Flutter`, `Android`, `macOS`, `iPadOS`, `Local Project`
- `URL`

## Core Sources

| Source | Notion URL | Use |
| --- | --- | --- |
| Apps | https://www.notion.so/8de7a69c721d43c9b135b1f986a751d3 | Top-level source for the website's app index. |
| All Ronnie Apps | https://www.notion.so/a32ab03fe59545b0aab5b8288fffe8f9 | Database schema and canonical app metadata fields. |
| Syncnext app | https://www.notion.so/821b80378be241149fa5e9a1bbf6cfdc | Rich product page with screenshots, docs, FAQ, changelog, privacy, terms, support. |
| aDict app | https://www.notion.so/a647f1ed9f604892895b8e71a65f1d70 | Product page with intro, app links, articles, changelogs, privacy, terms, feedback. |
| Nomad Drive | https://www.notion.so/16f781c9681a487696bceeb7dd2bffbe | Product page with screenshots, feature sections, testing/support links, roadmap. |
| eisonAI | https://www.notion.so/4851d5718dd64908a7d4c2ada0fd8592 | Product narrative for a cognitive-index / knowledge assistant app. |
| SyncPlaylist old page | https://www.notion.so/56ba1d46bdf74bceba7e0efcc607cf94 | Archived historical product context; should be treated as legacy. |

## Initial Product Inventory

| Product | Status | Platforms | Suggested Site Role | Short Copy |
| --- | --- | --- | --- | --- |
| Syncnext | Active / inferred from current product page | iOS, tvOS, Apple ecosystem inferred | Featured app | 聚合媒體播放器，提供播放來源、訂閱、進階文檔、FAQ 和更新日誌。 |
| aDict | 正在上架 | iOS, macOS | Featured app | 一個簡單美觀的詞典/字典查詢工具。 |
| Nomad Drive | TestFlight / in development inferred | macOS, iOS, tvOS | Featured or lab app | 支持第三方播放器、多帳號、iCloud 同步、Apple TV 播放與原生 SwiftUI 風格。 |
| eisonAI | Active / external App Store link present | iOS inferred | Featured app or AI section | 幫助保存、整理、找回資料的小助手，主軸是 Cognitive Index。 |
| 每日聖經 App | 正在上架 | iOS | Secondary app | GitHub source exists; Notion page is blank. |
| Games Price app | 已下架 | iOS | Archived app | Keep in archive or omit from homepage. |
| uSpace 发送文件 | 已下架 | Flutter | Archived app | 簡單的局域網文件傳送；GitHub source exists. |
| SyncPlaylist | 已停止維護 | tvOS / Apple ecosystem inferred | Archived app | Legacy predecessor to Syncnext; link users to Syncnext instead. |

## Suggested Information Architecture

- Home
  - Hero: `Ronnie Apps`
  - Featured apps: Syncnext, aDict, Nomad Drive, eisonAI
  - Active / in development / archived grouping
  - Latest updates from Notion changelog pages
- Apps
  - Filter by platform and status
  - App detail pages
- Articles
  - Engineering essays and release posts
  - Candidate source: `在 tvOS 上活下來：一個非典型播放器的工程實錄`
- Support
  - Feedback links
  - FAQ links
  - Privacy Policy / Terms of Use
- Archive
  - SyncPlaylist, Games Price, uSpace and other unavailable apps

## Content Model Draft

```ts
type AppStatus = "active" | "testflight" | "archived" | "not_started";

type App = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  status: AppStatus;
  platforms: string[];
  sourceUrl: string;
  externalUrl?: string;
  primaryCta?: {
    label: string;
    href: string;
  };
  sections?: {
    label: string;
    href: string;
  }[];
};
```

## Design Notes

- The app pages already have strong visual material in Notion, especially Syncnext, Nomad Drive, and eisonAI. The implementation should either import selected assets later or provide neutral image slots until assets are copied.
- The site should feel like a serious indie software studio: compact, app-focused, and easy to scan.
- Avoid a generic resume layout. The differentiator is a living catalog of shipping apps, docs, release notes, and technical writing.
- Keep archived apps visible but visually secondary, so they contribute history without confusing users about availability.

## Open Questions

- Which domain and brand name should be primary: `Ronnie Apps`, `RonnieCC`, or another label?
- Should Notion remain the CMS/source of truth, or should content be copied into the repo as static data?
- Should the first build include full app detail pages, or only a landing page plus app cards?
- Which active download links should be treated as official CTAs: App Store, TestFlight, GitHub, Notion docs, or all of them?
