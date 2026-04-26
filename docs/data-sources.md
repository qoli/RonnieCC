# Ronnie 個人能力網站資料源整理

更新日期：2026-04-25

這份文件是我們在做網站之前用來對齊資料源的中間文件，不是對外公開文案。它的目的不是把所有內容一次寫成最終版本，而是先把「網站要展示哪些 project ecosystem」、「每個 project 屬於現在、探索還是歷史」、「每個 project 下面有哪些 app / repo / docs / writing / tooling」、「哪些 tag 應該用來描述這些事情」、「哪些資料可信」、「哪些內容可以公開」講清楚。

## 網站定位

這個網站不是 app catalog，也不是單純公開 app 列表。它是一個介紹 Ronnie 能力的個人網站。

app、repo、Notion 頁面、工程文章、履歷材料，都只是能力證據。網站真正要回答的是：

- Ronnie 持續做出了哪些現在仍然重要的 project ecosystem？
- 哪些內容是探索，適合展示思考和能力，但不一定是正式產品？
- 哪些內容是歷史 project，適合證明背景、演進和設計經驗？
- 每個 project 裡有哪些 main app、API、plugin、support tooling、writing 和 docs？
- 這些 project 能證明哪些產品化、工程、AI、Apple 平台、local-first 和 UI/UX 設計能力？
- 哪些內容適合公開展示，哪些只適合作為內部事實來源？

因此網站第一層應該是 project 的生命週期分類：

1. 現在的 Project
2. 探索
3. 歷史的 Project

Tag 用來補充描述能力、平台、項目形態、公開狀態和資料來源狀態。

## 組織原則

`Project` 在這份文件裡不是單一 repo，也不一定是單一 app。它更接近一個小型生態圈：

- 一個 project 可以包含 main app、API、plugin、helper tool、docs、文章和 support material。
- 一個 project 可以對應多個 repo，包含 public repo 和 private repo。
- private repo 可以作為內部事實來源，但不自動公開。
- Notion project/product page 是 project 敘事和產品事實的重要來源。
- Google Drive 的履歷和 ChatGPT folder 用來幫助提煉敘事，不直接作為公開內容。
- 本地 Keynote 設計檔案夾保存了舊職 UI/UX Designer 時期的大量輸出，可作為設計能力和產品表達能力的內部證據。
- 能力方向仍然重要，但它們應該是 project 的 tags，不是網站的第一層分類。

## 分類和 Tag

### 三個分類

| 分類 | 用途 | 展示策略 |
| --- | --- | --- |
| 現在的 Project | 仍在上架、測試、維護或對當前能力敘事最重要的 project ecosystem。 | 首頁和 selected projects 的主體。 |
| 探索 | 還不是標準產品，或更像研究、pipeline、system experiment、writing/case study 的內容。 | 可展示為 exploration / case study，但不假裝是正式產品。 |
| 歷史的 Project | 已下架、舊版、舊職設計輸出、早期項目或 predecessor。 | 不作主展示；可作 history、design archive、project evolution 證據。 |

### Tag 分組

Tag 不是分類本身，而是讓同一個 project 可以被多個角度理解。建議分成幾組：

| Tag 組 | 例子 | 用途 |
| --- | --- | --- |
| 能力 tag | `AI Productization`、`UI/UX Design`、`White-box Engineering` | 說明這個 project 證明了什麼能力。 |
| 平台 tag | `iOS`、`macOS`、`tvOS`、`Web`、`Local AI` | 說明技術或產品運行環境。 |
| 形態 tag | `App`、`API`、`Plugin`、`Pipeline`、`Design Case`、`Writing` | 說明這件事情是什麼類型。 |
| 公開狀態 tag | `Public`、`Private Source`、`Public TestFlight`、`Internal Only` | 控制網站上能不能直接放連結。 |
| 資料狀態 tag | `Confirmed`、`Needs Review`、`Needs Redaction`、`Source Incomplete` | 說明資料是否足夠進入網站內容。 |

能力 tag 可以先用：

- AI Productization
- Apple Platforms
- Local-first Systems
- Media Runtime & Automation
- Knowledge & Reading Tools
- White-box Engineering
- Independent Product Building
- UI/UX Design
- Visual Presentation

## Project 分類

目前先把網站資料按三個分類組織。名稱是中間版本，之後可以再調整成公開網站上的呈現名稱。

### 現在的 Project

| Project | Project Type | 核心說明 | 能力標籤 |
| --- | --- | --- | --- |
| Syncnext | media runtime ecosystem | tvOS 長時間媒體 runtime，包含 main app、API、plugin、networking、userscript 等周邊。 | Apple Platforms、Media Runtime & Automation、Independent Product Building |
| eisonAI | AI reading product | local-first AI reading system，跨 macOS / iOS / iPadOS / Safari Extension。 | AI Productization、Apple Platforms、Local-first Systems、Knowledge & Reading Tools |
| threadBridge | workspace-first Codex runtime | macOS desktop owner、Telegram adapter、本地管理 UI 和受管 hcodex 入口，把真實 workspace 綁定到可延續的 Codex session。 | Agent Runtime、Rust、Local-first Systems、AI Productization |
| TracklyReborn 得意記 | AI life logging / expense tracking ecosystem | 以 AI、捷徑、Action Button、多圖紀錄和本地資料庫重寫的生活/消費紀錄產品。 | AI Productization、Apple Platforms、Local-first Systems、Independent Product Building |
| aDict | dictionary / reading ecosystem | 詞典與閱讀工具生態，包含 iOS/macOS app、rewrite、protocol 等。 | Apple Platforms、Knowledge & Reading Tools、Independent Product Building |

### 探索

| Project | Project Type | 核心說明 | 能力標籤 |
| --- | --- | --- | --- |
| HLN Machine | local AI video factory | 本地 AI 短影片工廠，重點是 white-box pipeline、checkpoint、字幕、B-Roll、YouTube Shorts automation。 | AI Productization、Local-first Systems、Media Runtime & Automation、White-box Engineering |
| chatgpt-history | conversation history as project memory | 把長期 ChatGPT 對話歷史重建成 structured reports、timeline、topic clusters 和 project knowledge artifacts。 | Knowledge Systems、AI Workflow、Python、Project Memory |

### 歷史的 Project

| Project | Project Type | 核心說明 | 能力標籤 / 備註 |
| --- | --- | --- | --- |
| SyncPlaylist | predecessor | Syncnext 的舊版前身。 | 可放入 Syncnext history。 |
| Nomad Drive | delisted Apple platform media/file app | 已下架項目；保留作歷史 Project，用於展示 iOS / macOS / tvOS、SwiftUI 跨平台復用、Apple TV 播放和文件管理的早期工程經驗。 | Apple Platforms、SwiftUI、tvOS、Historical Product。 |
| Games Price app | delisted iOS app | 已下架項目。 | 目前不作主展示。 |
| uSpace 发送文件 | delisted file transfer app | 已下架項目。 | 目前不作主展示。 |
| Enterprise Web Design Series | design archive / web portfolio | 企業和城市地標類網站設計輸出，代表案例包括国网信通、明珠塔、Moozy、ART/YVVY、美克美家等。 | UI/UX Design、Visual Presentation、Web、Needs Redaction。 |
| Mobile App UI QA & Wallet Design | design archive / app QA | Bitzen/Bitizen Wallet 相關 UI test、issue 模板、media kit、wallet flow 和暗色系 App 界面 QA。 | UI/UX Design、Apple Platforms、Design QA、Needs Redaction。 |
| Mini Program & Consumer App Design | design archive / app design | 元の氣小程序、HotCashback、兩秒記賬等小程序/消費類 app 設計和產品推導。 | UI/UX Design、App、Product Storytelling、Needs Redaction。 |
| Brand & Visual Identity Archive | design archive / brand system | VI 案例合訂、Moozy Studio、帮帮找房、青言 CMS、優易惠等品牌、名片、標識和視覺系統。 | UI/UX Design、Visual Presentation、Brand Identity、Needs Redaction。 |
| UX Audit & Product System Notes | design archive / product strategy | Authing.cn 用戶體驗報告、楓橋式智慧司法系統、FydeOS、青言 CMS 等偏 UX audit、系統邏輯和產品策略的輸出。 | UI/UX Design、Product Strategy、System Design、Needs Redaction。 |

## 設計背景資料

Ronnie 的舊職背景是 UI/UX Designer。這對網站定位很重要：網站不應只呈現「會寫 app / 會做 AI pipeline」，還應該呈現產品設計、界面設計、視覺提案、交互說明和 presentation 的能力。

本地 iCloud Keynote 路徑：

`/Users/ronnie/Library/Mobile Documents/com~apple~Keynote/Documents`

目前初步掃描結果：

- 遞迴共約 206 個 `.key` 文件。
- 頂層約 118 個 `.key` 文件。
- 內容跨度至少包括 2017-2025。
- 類型包括 web design、App UI test、小程序設計、VI、設計 brief、設計說明、硬件控制軟件、產品教程、宣傳片/Keynote、TracklyReborn 和 eisonAI 相關材料。

這個資料源的使用方式：

- 用於支撐 `UI/UX Design`、`Visual Presentation`、`Product Storytelling` 這些能力標籤。
- 可幫助網站補足「前 UI/UX Designer」這條敘事線，而不是只講工程和 app。
- 可從中挑選少量代表性案例，重新整理成公開 portfolio/case study。
- 不直接公開原始 Keynote 文件。
- 不直接公開舊職/客戶相關內容，除非已確認可公開。
- 如果要使用圖片或頁面截圖，應先人工篩選、脫敏、重新導出成網站素材。

## Project 詳細整理

### Syncnext

Syncnext 不應該只被當成一個 app card。它是一個 media runtime ecosystem，包含 main app、public API/support repos、plugin reference、networking rules、userscript helper，以及舊 predecessor SyncPlaylist 的歷史脈絡。

| Component | 類型 | 來源 | Visibility | 公開展示策略 |
| --- | --- | --- | --- | --- |
| Syncnext main app | tvOS app / main product | Notion、GitHub private | Private repo | 產品可公開展示；private app repo 不公開。 |
| Syncnext product page | product docs / support | Notion | Public/Notion visibility 待確認 | 可作產品敘事、docs、FAQ、changelog 來源。 |
| syncnext-api | API / metadata support repo | GitHub | Public | 可作 ecosystem 和工程證據；不一定作首頁主 CTA。 |
| syncnextPlugin | plugin protocol / reference implementation | GitHub | Public | 可作 plugin ecosystem 證據。 |
| SyncnextClash | networking/routing support | GitHub | Public | 可作 support tooling，不一定首頁展示。 |
| SyncnextUserScriptHelper | browser/userscript helper | GitHub | Public | 可作 support tooling，不一定首頁展示。 |
| SyncPlaylist | predecessor | Notion | Archived / old | 不放入 app catalog；可在 history/archive 裡提到它如何演進成 Syncnext。 |

可支撐的能力：

- 長時間運行的 media runtime 設計
- Apple tvOS app delivery
- plugin/API ecosystem design
- support tooling 和 user workflow integration
- independent product maintenance

### eisonAI

eisonAI 是 local-first AI reading product。它既是 app，也是 AI productization 和 local-first systems 的代表。

| Component | 類型 | 來源 | Visibility | 公開展示策略 |
| --- | --- | --- | --- | --- |
| eisonAI app | AI reading product | Notion、Google Drive resume | Public product | 可公開展示。 |
| eisonAI repo | Swift codebase | GitHub | Public | 可公開作 GitHub CTA 或 engineering evidence。 |
| eisonAI product page | product narrative / links | Notion | Public/Notion visibility 待確認 | 用於描述、App Store、media/demo links。 |
| resume positioning | selected project wording | Google Drive | Private source | 只作文案提煉，不公開 Drive link。 |

可支撐的能力：

- AI reading workflow productization
- local-first AI product architecture
- Apple platform implementation
- privacy-aware product positioning

### TracklyReborn 得意記

TracklyReborn 是 Trackly 的 Reborn 重寫版本，不應該只看成單一記帳 app。它是一個 AI life logging / expense tracking ecosystem，包含 main app、公開 TestFlight 文檔、捷徑/Action Button 工作流、多圖片紀錄、LLM/VLM 設定、資料庫重建、prompt/圖標等周邊 repo。

| Component | 類型 | 來源 | Visibility | 公開展示策略 |
| --- | --- | --- | --- | --- |
| TracklyReborn main app | iOS app / main product | Notion、GitHub private | Private repo | 可公開展示產品和 TestFlight；private app repo 不公開。 |
| 開始使用 TracklyReborn | public docs / onboarding | Notion | Public/Notion visibility 待確認 | 可作產品敘事、TestFlight、捷徑和 AI 設定來源。 |
| Trackly 得意記 · 更新日誌 | changelog | Notion | Public/Notion visibility 待確認 | 可作維護證據。 |
| Trackly 得意記開發筆記 | development notes | Notion | Private/Notion visibility 待確認 | 只作內部敘事來源。 |
| Trackly Sync Datas | sync/data database | Notion database | Private/Notion visibility 待確認 | 只作內部資料結構證據。 |
| Trackly | predecessor / legacy app | GitHub private | Private | 內部歷史證據，不公開 repo link。 |
| TracklyPrompt | prompt material | GitHub private | Private | 內部 AI workflow 證據，不公開 repo link。 |
| Trackly-icons | icon/tooling repo | GitHub private | Private | 內部素材/tooling 證據，不公開 repo link。 |

可支撐的能力：

- AI-assisted life logging
- shortcut / Action Button workflow design
- multimodal record capture
- local-first data model rewrite
- private-code Apple platform product iteration

### aDict

aDict 是 dictionary / reading ecosystem，不只是一個單 app。它有 rewrite、legacy app、macOS app、protocol 等多個 repo 和實作脈絡。

| Component | 類型 | 來源 | Visibility | 公開展示策略 |
| --- | --- | --- | --- | --- |
| aDict product | dictionary / reading app | Notion | Public product | 可公開展示產品。 |
| aDictRewrite | current rewrite | GitHub | Private | 內部證據，不公開 repo link。 |
| aDict legacy/app | app codebase | GitHub | Private | 內部證據，不公開 repo link。 |
| aDictMac | macOS app | GitHub | Private | 內部證據，不公開 repo link。 |
| aDictProtocol | internal protocol/dependency | GitHub | Private | 內部技術依賴，不公開。 |
| aDict product page | docs / articles / changelog | Notion | Public/Notion visibility 待確認 | 用於產品敘事、文章、changelog、privacy/terms。 |

可支撐的能力：

- reading and lookup workflow design
- Apple platform product maintenance
- multi-target Swift ecosystem
- product docs and changelog discipline

### HLN Machine

HLN Machine 是 local AI video factory，不是 app。它應該作為強 case study 出現，重點是能把一個新聞 seed 變成可觀測、可重啟、可診斷的短影片 pipeline。

| Component | 類型 | 來源 | Visibility | 公開展示策略 |
| --- | --- | --- | --- | --- |
| HLN Machine Notion page | project narrative / system design | Notion | Private/Notion visibility 待確認 | 可提煉成公開 case study，不直接公開原頁。 |
| HLN_Project | implementation repo | GitHub | Private | 內部證據，不公開 repo link。 |
| pipeline A/B/C/D | workflow architecture | Notion、GitHub private | Internal source | 可公開抽象流程，不公開敏感實作細節。 |
| HLN linked essays | engineering writing | Notion | 待確認 | 可作 writing 或 case study 延伸來源。 |
| resume positioning | selected project wording | Google Drive | Private source | 只作文案提煉，不公開 Drive link。 |

可支撐的能力：

- local AI orchestration
- white-box pipeline design
- checkpoint/restartable workflow
- B-Roll selection and video automation
- subtitle correction and post-processing
- observability-first engineering

## 暫不納入的項目

這些項目目前不放入「現在的 Project / 探索 / 歷史的 Project」三個分類。這不是說它們永遠不能用，而是現階段不需要進入網站資料模型。

| 項目 | 原因 | 備註 |
| --- | --- | --- |
| 每日聖經 App | 目前不需要放入這個網站。 | 目前不展示。 |
| Magic Brief | 目前不需要作為網站 project。 | 目前不處理。 |
| RonnieCC Website | 網站本身不作為能力展示 project。 | 只保留為本地 repo 和部署工作，不作展示內容。 |

## 資料源角色

以「現在的 Project / 探索 / 歷史的 Project」作為第一層後，資料源的角色如下。

| 資料源 | 角色 | 用法 |
| --- | --- | --- |
| Notion | product/project 敘事、產品頁、探索頁、工程文章 | 提供每個 project 的 narrative、product facts、docs、case study 素材。 |
| GitHub | repo/component evidence | 確認每個 project ecosystem 的 main app、API、plugin、helper、public/private 狀態和技術棧。 |
| Google Drive | 個人定位、portfolio material、思考材料 | 幫助定義能力主線、About 文案、selected project positioning；ChatGPT folder 只作敘事提煉來源，不直接公開。 |
| 本地 Keynote 設計檔案 | 舊職 UI/UX 設計輸出、產品提案、視覺和交互材料 | 作為設計能力、產品表達和 presentation 能力的內部證據；只提煉敘事和可公開案例，不直接公開原檔。 |
| 本地 repo | curated data 和網站輸出 | 保存人工確認後的展示資料，不作為原始事實來源。 |

## 已確認的 Notion 來源

| Notion 頁面 | URL | 所屬 project |
| --- | --- | --- |
| Apps | https://www.notion.so/8de7a69c721d43c9b135b1f986a751d3 | Apple app index，不作為單一 project。 |
| All Ronnie Apps | https://www.notion.so/a32ab03fe59545b0aab5b8288fffe8f9 | Apple app database，不作為單一 project。 |
| Syncnext app | https://www.notion.so/821b80378be241149fa5e9a1bbf6cfdc | Syncnext |
| aDict app | https://www.notion.so/a647f1ed9f604892895b8e71a65f1d70 | aDict |
| eisonAI | https://www.notion.so/4851d5718dd64908a7d4c2ada0fd8592 | eisonAI |
| TracklyReborn 得意記 | https://www.notion.so/1a0c1b36c4018065a4adf53d5dd41fbe | TracklyReborn |
| 開始使用 TracklyReborn | https://www.notion.so/267c1b36c40180ec9489d4f84ef1c079 | TracklyReborn |
| Trackly 得意記 · 更新日誌 | https://www.notion.so/1a8c1b36c40180f1bb11ee6cecbc60ef | TracklyReborn |
| Trackly 得意記開發筆記 | https://www.notion.so/186c1b36c40180129601e878c3d95899 | TracklyReborn |
| Trackly Sync Datas | https://www.notion.so/252c1b36c4018014b964fa2e28789a5d | TracklyReborn |
| HLN 工廠（HLN Machine） | https://www.notion.so/2c2c1b36c401806a909dd06baad8815a | HLN Machine |
| Nomad Drive | https://www.notion.so/16f781c9681a487696bceeb7dd2bffbe | Nomad Drive |
| 使用 SwiftUI 開發多個平台的應用 | https://www.notion.so/qoli/SwiftUI-2ebc1b36c40182038b6501766f1e94d5?v=e90c1b36c401831d99bf08f10dcbae9b&source=copy_link | Nomad Drive；工程文章；編寫年份：2021 |

## 已確認的 GitHub 來源

GitHub private repo 可以作為內部資料源。公開網站是否放 repo link，取決於 repo 是否 public，以及是否適合作為訪客 CTA。

| Repo | Visibility | Language | 所屬 project / component | 公開展示策略 |
| --- | --- | --- | --- | --- |
| https://github.com/qoli/Syncnext | Private | Swift | Syncnext main app | 內部證據，不公開 repo link。 |
| https://github.com/qoli/syncnext-api | Public | JavaScript | Syncnext API | 可公開作技術補充。 |
| https://github.com/qoli/syncnextPlugin | Public | JavaScript | Syncnext plugin | 可公開作 ecosystem 證據。 |
| https://github.com/qoli/SyncnextClash | Public | Shell | Syncnext networking support | 可公開，但不一定首頁展示。 |
| https://github.com/qoli/SyncnextUserScriptHelper | Public | JavaScript | Syncnext userscript helper | 可公開，但不一定首頁展示。 |
| https://github.com/qoli/aDictRewrite | Private | Swift | aDict rewrite | 內部證據，不公開 repo link。 |
| https://github.com/qoli/aDict | Private | Swift | aDict legacy/app | 內部證據，不公開 repo link。 |
| https://github.com/qoli/aDictMac | Private | Swift | aDict macOS app | 內部證據，不公開 repo link。 |
| https://github.com/qoli/aDictProtocol | Private | Swift | aDict protocol | 內部依賴，不公開。 |
| https://github.com/qoli/eisonAI | Public | Swift | eisonAI | 可公開。 |
| https://github.com/qoli/threadBridge | Public | Rust | threadBridge | 可公開，作為 agent runtime / desktop owner / Telegram adapter 的主要技術證據。 |
| https://github.com/qoli/TracklyReborn | Private | Swift | TracklyReborn main app | 內部證據，不公開 repo link。 |
| https://github.com/qoli/Trackly | Private | Swift | Trackly predecessor / legacy app | 內部歷史證據，不公開 repo link。 |
| https://github.com/qoli/TracklyPrompt | Private | 未標註 | Trackly prompt material | 內部 AI workflow 證據，不公開 repo link。 |
| https://github.com/qoli/Trackly-icons | Private | Python | Trackly icon/tooling | 內部素材/tooling 證據，不公開 repo link。 |
| https://github.com/qoli/HLN_Project | Private | Python | HLN Machine | 內部證據，不公開 repo link。 |
| https://github.com/qoli/chatgpt-history | Public | Python | chatgpt-history | 可公開，作為 conversation analysis / project memory pipeline 的主要技術證據。 |

## 已確認的 Google Drive 來源

| 文件 | URL | 所屬 project / 用途 |
| --- | --- | --- |
| Ronnie W. Resume - AI Productization / Apple Platforms | https://docs.google.com/document/d/1fwFtmHmSKiZVCfCwQgLmTwKX8XW-JAQlQisK0wAbilY | 全站定位、About 文案、eisonAI、Syncnext、HLN Machine |
| ChatGPT folder | Google Drive folder，具體 URL 待整理 | 思考材料和敘事方法來源；只用來提煉能力表述、項目脈絡、命名和角度，不直接公開原文。 |

履歷裡可用的定位信號：

- AI Productization Builder
- Apple Platforms
- Agent Runtime & Local-First Systems
- independent product builder，方向包括 Apple platforms、AI workflows、local-first tools、media/runtime projects

履歷裡明確提到的 selected projects：

- eisonAI：local-first reading system for macOS / iOS / iPadOS / Safari Extension
- Syncnext：long-running tvOS media runtime
- HLN Machine：white-box local AI video pipeline

### ChatGPT folder 的使用方式

Google Drive 裡的 ChatGPT folder 主要保存 Ronnie 的思考過程、判斷、項目理解和敘事探索。它應該作為「如何講述能力」的材料來源，而不是網站內容的直接來源。

使用規則：

- 可以用來提煉 project 命名、能力標籤、項目敘事角度和 About 文案方向。
- 可以用來理解某個 project 背後的思考方式，例如為什麼要做、怎麼判斷產品方向、如何處理失敗和約束。
- 不直接公開 ChatGPT folder 裡的原文、對話、私人推理或未整理想法。
- 不把 folder 連結放到公開網站。
- 如果某段內容值得公開，應該先改寫成獨立的網站文案、文章或 case study，再決定是否發布。

## 已確認的本地設計資料源

| 來源 | 路徑 | 用途 |
| --- | --- | --- |
| iCloud Keynote Documents | `/Users/ronnie/Library/Mobile Documents/com~apple~Keynote/Documents` | 舊職 UI/UX Designer 時期的設計輸出、產品提案、界面設計、視覺探索和 presentation 材料。 |

初步看到的代表性文件方向：

- 網頁設計：美克美家官網、ART 官網、YVVY 官網、明珠塔官网、国网信通、Moozy 等。
- App / 小程序設計：PlaneR App、元の氣小程序、BitzenWallet App UITest、TracklyReborn Keynote、eisonAI-WebLLM。
- 品牌 / VI / 推廣：帮帮找房 VI、Moozy Studio 名片、230 空中酒店、最紳士推廣頁面。
- 產品和系統設計：智慧無限硬件控制軟件、青言 CMS、FydeOS、HLN_DEMO。

這些文件應該被當作設計能力的 source material，而不是直接公開的下載內容。後續如果要做 portfolio section，應該先選出 3-6 個可公開、可脫敏、能代表能力的案例，再重新整理成網站上的 case study。

### 已抽樣檢查的 Keynote

我已先抽樣匯出並檢查以下 10 個代表文件。這些不是最終公開素材，只是用來判斷哪些方向值得整理成歷史 Project。

| 候選歷史 Project | 已檢查文件 | 頁數 | 初步判斷 |
| --- | --- | --- | --- |
| Enterprise Web Design Series | `2020年01月﹣国网信通股份有限公司 Web Design Version 1J.key` | 20 | 企業官網視覺提案，有完整首頁方向和多版本設計。 |
| Enterprise Web Design Series | `2019年09月﹣明珠塔设计说明.key` | 16 | 城市地標/旅遊官網提案，視覺衝擊強，適合作為 web design case。 |
| Enterprise Web Design Series | `2020年03月﹣Moozy Web Design Version 1f (Desktop).key` | 16 | Studio 官網設計，有 desktop motion/visual presentation 材料。 |
| Mobile App UI QA & Wallet Design | `2022年11月﹣BitzenWallet App UITest 1.2.6.key` | 22 | 高質量 App UI QA，能展示設計稿對照、細節審核和產品交付能力。 |
| Mini Program & Consumer App Design | `2020年04月﹣元の氣小程序 Design Version 1c.key` | 44 | 小程序設計完整度高，包含會員、點單、積分等消費場景。 |
| Mini Program & Consumer App Design | `2020年06月﹣HotCashback Design 2h.key` | 35 | 有用戶/商戶推導、Web 商戶端和 app design，適合作為 product design case。 |
| Brand & Visual Identity Archive | `2020年﹣VI 案例合訂.key` | 22 | 品牌和 VI 輸出集合，適合作為 visual identity archive。 |
| UX Audit & Product System Notes | `2020年06月﹣Authing.cn 用户体验报告.key` | 10 | 偏 UX audit 和產品理解，能支撐 UI/UX Designer 背景。 |
| UX Audit & Product System Notes | `2020年09月﹣楓橋式智慧司法系統 Cloud Version.key` | 30 | 偏政務/系統流程設計，有客戶端、後台、展示系統的產品邏輯。 |
| Current Project Design Evidence | `TracklyReborn Keynote Action Button.key` | 3 | 屬於現在的 Project 的設計素材，不放歷史 Project，但可作 TracklyReborn design evidence。 |

抽樣結論：

- 適合先建立 5 個歷史 Project，而不是把 206 個 Keynote 全部平鋪。
- 這 5 個歷史 Project 分別覆蓋 web design、mobile app QA、mini program/consumer app、brand identity、UX audit/product system。
- 所有舊職/客戶材料都應標記 `Needs Redaction`，只在人工確認後抽取局部截圖或重寫 case study。

## 建議資料模型

本地網站最後應該維護一份經過人工確認的 curated data file。核心單位應該是 `Project`，不是 `Product`，也不是抽象 `Domain`。

```ts
type ProjectCategory = "current" | "exploration" | "historical";

type CapabilityTag =
  | "ai-productization"
  | "apple-platforms"
  | "local-first-systems"
  | "media-runtime-automation"
  | "knowledge-reading-tools"
  | "white-box-engineering"
  | "independent-product-building"
  | "ui-ux-design"
  | "visual-presentation";

type PlatformTag = "ios" | "macos" | "tvos" | "web" | "local-ai" | "cloud" | "keynote";
type FormTag = "app" | "api" | "plugin" | "pipeline" | "design-case" | "writing" | "docs" | "tooling";
type PublicTag = "public" | "private-source" | "public-testflight" | "internal-only";
type SourceTag = "confirmed" | "needs-review" | "needs-redaction" | "source-incomplete";

type ProjectTag = CapabilityTag | PlatformTag | FormTag | PublicTag | SourceTag;

type ProjectStatus = "active" | "testflight" | "maintained" | "exploration" | "historical" | "hidden";
type ComponentKind = "main-app" | "api" | "plugin" | "repo" | "tooling" | "docs" | "writing" | "case-study" | "predecessor";

type Project = {
  id: string;
  name: string;
  category: ProjectCategory;
  status: ProjectStatus;
  summary: string;
  positioning: string;
  tags: ProjectTag[];
  publicSafe: boolean;
  componentIds: string[];
  primaryCtaIds?: string[];
};

type ProjectComponent = {
  id: string;
  projectId: string;
  name: string;
  kind: ComponentKind;
  status: ProjectStatus;
  tags: ProjectTag[];
  publicSafe: boolean;
  description: string;
  sourceRefs: Array<{
    source: "notion" | "github" | "google-drive" | "local";
    label: string;
    href?: string;
    public: boolean;
  }>;
  cta?: Array<{
    label: string;
    href: string;
    kind: "app_store" | "testflight" | "github" | "docs" | "notion" | "support";
  }>;
};
```

## 公開展示規則

- 網站首頁應該優先展示「現在的 Project」，而不是一串 app。
- 「探索」可以作為 case study / lab / notes 出現，但視覺和文案上不能假裝是正式產品。
- 「歷史的 Project」不作主展示；適合放在 history、archive、design archive、project evolution 裡。
- app catalog 如果保留，只是 project components 的一種 view；只展示仍在上架、測試中或活躍維護的 app。
- project case study 可以展示未上架或探索中的項目，只要不暴露 private repo、私人文檔或不該公開的實作細節。
- private GitHub repo 可以作為內部事實來源，但不自動成為公開連結。
- public GitHub repo 也不一定要放到首頁；如果它只是 support tooling，應該作為 project detail 裡的 component。
- Notion/Drive 連結不應直接公開，除非明確確認它們適合公開訪問。
- Google Drive 的 ChatGPT folder 只作敘事和思考材料來源，不直接公開原文或 folder link。
- 本地 Keynote 設計檔案只作內部證據和素材來源，不直接公開原檔；涉及舊職、客戶或商業資料時需要先脫敏和人工確認。
- 截圖、圖片、PDF、demo 影片等素材，production 前最好拷到本地 repo 或穩定 public asset host。

## Blog 資料源

Blog 入口使用 Notion database 作為上游資料源，但網站只讀取同步後的靜態 JSON。

| 項目 | 值 |
| --- | --- |
| Notion database | https://www.notion.so/qoli/60ac1b36c401837598a501cc8b7ea241?v=e90c1b36c401831d99bf08f10dcbae9b&source=copy_link |
| Database title | 📔 日誌 |
| Parent page | Ronnie Blogs |
| Collection id | `0bdc1b36c401828b875a87505f6c4363` |
| View id | `e90c1b36c401831d99bf08f10dcbae9b` |
| Generated file | `content/blog.seed.json` |
| Sync script | `scripts/sync-blog.mjs` |
| GitHub Action | `.github/workflows/sync-blog.yml` |

### Notion schema

| 字段 | 類型 | 網站用途 |
| --- | --- | --- |
| `Name` | title | 文章標題 |
| `Tag` | select | 類別標記；目前有 `Skecth`、`VSCode`、`Serverless`、`SwiftUI` |
| `公開` | checkbox | 發布開關；只有 true / `__YES__` 可以進入網站 |
| `年份` | text | 顯示與分組年份；優先於 created time |

### Blog 同步規則

- 第一階段只建立 Blog index，文章連結外跳 Notion。
- 不在第一階段渲染 Notion detail page，因為 Notion 圖片 URL 可能是短期簽名 URL，直接靜態化後會失效。
- GitHub Actions 每天同步一次即可，並保留 `workflow_dispatch` 供手動更新。
- 公開 Notion database 不需要 `NOTION_TOKEN`；如果日後改為私有頁面，GitHub repo 再設定 `NOTION_TOKEN` 或 `NOTION_TOKEN_V2` secret，值為 Notion `token_v2`。
- 同步器只寫入 `content/blog.seed.json`，不改動手寫 HTML/CSS/JS。
- `公開` 是唯一發布門檻；Notion view 本身不代表公開狀態。
- `年份` 是人工策展字段，不應自動覆蓋；缺失時才 fallback 到 created time。

## 目前本地資料狀態

`content/apps.seed.json` 目前只保留可見 app：

- Syncnext
- aDict
- TracklyReborn 得意記
- eisonAI

這份資料還不是 project ecosystem 結構。下一步應該把它擴展或替換為：

- `content/projects.seed.json`
- `content/blog.seed.json`
- `content/project-components.seed.json`
- `content/project-tags.seed.json`，如果 tag 需要集中管理

`apps.seed.json` 可以降級為 project components 的一種 view，而不是網站資料核心。新的核心資料應該能表達：

- category：現在的 Project / 探索 / 歷史的 Project
- tags：能力、平台、形態、公開狀態、資料狀態
- components：main app、API、plugin、repo、docs、writing、design case 等

## 建議下一步

1. 確認三個分類是否準確：現在的 Project、探索、歷史的 Project。
2. 確認「現在的 Project」清單：Syncnext、eisonAI、threadBridge、TracklyReborn、aDict。
3. 確認「探索」清單：HLN Machine、chatgpt-history，以及是否還有其他 Notion/Drive/GitHub 裡的探索項目。
4. 確認「歷史的 Project」清單：SyncPlaylist、Nomad Drive、Games Price app、uSpace，以及 5 個設計 archive project。
5. 為每個 project 確認 components，例如 Syncnext 的 main app / API / plugin / networking / userscript / predecessor。
6. 為每個 project 和 component 標 tags：能力、平台、形態、公開狀態、資料狀態。
7. 決定首頁是否以 `Current Projects` / `Explorations` / `Historical Work` / `About` 為主。
8. 驗證 App Store / TestFlight / public docs / public repo 的可公開連結。
9. 整理 Google Drive 的 ChatGPT folder：只抽取敘事線索和能力表述，不抽取可直接公開的原文。
10. 整理本地 Keynote 設計檔案：先按 web / app / brand / system / presentation 分組，再挑選可公開案例。
11. 選定穩定圖片素材，放進本地 repo，而不是依賴 Notion/Drive 的臨時 URL。
12. 資料契約確認後，建立 `content/projects.seed.json`、`content/project-components.seed.json`，必要時再加 `content/project-tags.seed.json`。

## 待討論問題

- 三個分類的命名對公開網站是否合適？例如是否要把「探索」公開寫成 `Labs` / `Explorations`？
- project 清單是否還缺重要生態圈？
- Syncnext 這類 project 的 component 要展示到多細？只展示 main app + API/plugin，還是 support tooling 也放進 detail page？
- 首屏應該突出哪一句定位，才能讓訪客先理解 Ronnie 的能力，而不是先看到一串 app？
- app 是否還需要獨立 section，還是只作為 selected projects 裡的一種 component？
- private repo 的事實應該只轉成 derived description，還是某些情況下可以對 authenticated audience 顯示 repo link？
- 5 個設計 archive project 應該全部進入歷史 Projects，還是只挑 2-3 個最能代表 UI/UX 能力的案例？
- Notion 要不要繼續作為 live CMS，還是這個 repo 裡的 curated data 才是最後 source of truth？
