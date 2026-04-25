# RonnieCC Website 視覺方向

這份文件用來記錄網站視覺方向。它不是公開文案，而是前端設計和實作時的中間約束。

## 參考來源

- `tw93/kami`: https://github.com/tw93/kami
- Kami design spec: https://github.com/tw93/kami/blob/main/references/design.md

Kami 的價值不在某個具體組件，而在「少量、穩定、可反覆執行的視覺約束」。這點適合 RonnieCC：網站要呈現能力、作品脈絡和判斷力，而不是把 app 排成商店貨架。

## 轉化原則

### 1. 從 app catalog 轉成 editorial portfolio

網站應該像一份可瀏覽的作品集和能力說明，而不是 app 列表。

- 首屏展示「現在正在做什麼」和「我怎麼思考產品」。
- Projects 頁展示三類項目：現在的 Project、探索、歷史的 Project。
- 每個 Project 不是只有卡片，而要有一句清楚的判斷：它證明了什麼能力。
- Resume 是獨立頁，不要和 app 支持頁混在一起。

### 2. 借用 Kami 的約束，而不是照搬 Kami 的外觀

Kami 的關鍵約束可以轉化為：

- 暖紙張背景作為網站基底，但避免整站只有米色和墨藍。
- 墨藍作為主要 focus color，用在 CTA、分隔線、當前狀態和少量數字。
- 暖灰作為文字、邊框和節奏層，不使用冷灰 dashboard 感。
- 字體層級以內容為主，不靠大面積漸變或裝飾圖形。
- 陰影要輕，讓內容像紙張略微浮起，而不是 SaaS 卡片堆疊。

前端需要比 PDF 更有層次，所以可以用項目截圖、Keynote 輸出、產品畫面和少量狀態色來補充視覺豐富度；UI 本身保持克制。

### 3. 色彩策略

建議建立一套 RonnieCC token：

```css
--paper: #f5f4ed;
--paper-raised: #faf9f5;
--ink: #141413;
--ink-muted: #5e5d59;
--line: #e0ddd2;
--accent: #1b365d;
--accent-soft: #e4ecf5;
--charcoal: #30302e;
```

使用規則：

- `--accent` 面積要小，承擔方向感，不做大色塊背景。
- Projects 的差異不要依靠四五種鮮豔 app 色，而是靠分類、截圖、文案和結構。
- 歷史作品可以允許原始設計稿的顏色出現，但外層 UI 保持統一。
- 探索類項目可以使用更輕的紙張/草稿感，但不要做成灰色 placeholder。

### 4. 字體和排版

網站主語言是繁體中文，夾雜英文產品名和技術詞。

- 中文正文用系統 sans，確保閱讀穩定。
- 大標題可以嘗試 Songti / serif fallback，製造作品集感。
- 英文產品名和 metadata 使用 sans，偏工具性。
- 不使用斜體。
- 不使用過重字重；標題以 500/600 為主，正文 400。
- 行高：標題 1.1-1.25，正文 1.5 左右，列表/metadata 1.35-1.45。

### 5. 組件語言

#### Section header

每個主要段落使用 editorial header：

- 小型 eyebrow
- 一條暖灰橫線或墨藍左線
- 清楚的 serif/sans 標題
- 不用大卡片包住整個 section

#### Project card

Project card 應該像作品集條目，不像 app store tile：

- 顯示分類：現在 / 探索 / 歷史
- 顯示 tags：能力、平台、形態、資料狀態
- 顯示一句 capability statement
- 如果有視覺材料，優先放截圖或 Keynote preview
- 私有 repo、Notion、Drive 只作內部來源，不直接暴露

#### Tags

Tags 用 solid hex，不用半透明背景：

- 能力 tag：`--accent-soft`
- 狀態 tag：暖灰底
- Needs Redaction / Source Incomplete：低飽和紅棕，不刺眼

#### Resume

Resume 頁可以最接近 Kami：

- 像一份排版良好的網頁版簡歷
- 可打印
- 少裝飾，多信息密度
- 內容從 Google Drive resume 來源整理，不直接嵌入原文件

## 對目前網站的修正方向

目前首頁仍然太像 app catalog，應該改成：

1. 首屏：Ronnie Wong / 能力定位 / 目前正在做的幾個 project。
2. 第二屏：Featured Projects，展示 Syncnext、eisonAI、TracklyReborn、aDict。
3. 第三屏：Explorations，展示 HLN Machine 這類探索。
4. 第四屏：Selected Historical Work，展示從 Keynote 舊作品中整理出的高質量案例。
5. Footer：GitHub、Resume、Email/Contact。

導航應該固定為：

- Index
- Projects
- Resume

## 不採用的方向

- 不做 App Store 式 app grid 作為主體。
- 不用大面積漸變、玻璃擬態、彩色光斑。
- 不把 ChatGPT folder 的思考內容原文公開。
- 不把舊公司/客戶資料直接展示；歷史作品必須先選稿、脫敏、重寫。
- 不完全套用 Kami 的「單一墨藍」到所有內容，因為網站需要容納產品截圖和歷史設計輸出。

## 下一步

前端改版可以按這個順序推進：

1. 先把首頁 IA 改成個人能力站。
2. 建立 Projects 資料結構，支持 category 和 tags。
3. 重寫 CSS token 和 section/card 視覺規則。
4. 製作 Resume 頁。
5. 從 Keynote export 中挑 3-5 個歷史案例，補入 Projects。
