# RonnieCC Website 視覺方向

這份文件是 RonnieCC 的內部設計約束，用來避免之後再被舊方向誤導。它不是公開文案。

## 已確定的組合

RonnieCC 目前採用三個來源，但每個來源只負責一件事：

1. **Kami 提供色彩 token**
   - 使用暖紙色、warm gray、ink-blue。
   - 不使用 Kami 的字體語氣、卡片模板或 PDF document 外觀。
2. **5mlstudio 提供排版布局方法**
   - 大留白、低裝飾、文字居主要地位。
   - 幾何 SVG 只能作為克制的結構標記。
   - 5mlstudio 是過去對外宣傳品牌，不是 RonnieCC 的復刻目標。
3. **Typography 是主要表達**
   - 網站要靠字重、行距、字距、行長、換行和空氣感建立品質。
   - 裝飾、卡片、圖形都必須服從文字層級。

## 色彩規則

只使用 Kami 色彩系統作為外層 UI token。

```css
--parchment: #f5f4ed;
--ivory: #faf9f5;
--warm-sand: #e8e6dc;
--deep-dark: #141413;
--near-black: #141413;
--dark-warm: #3d3d3a;
--olive: #504e49;
--stone: #6b6a64;
--border: #e8e6dc;
--border-soft: #e5e3d8;
--brand: #1b365d;
--brand-light: #2d5a8a;
--tag-blue: #eef2f7;
```

Dark mode 不能機械沿用 light mode 的深藍，因為 `#1b365d` 在深色背景上對比和層級都不成立。Dark mode 的 accent 必須服從 typography 層級：

```css
--parchment: #141413;
--near-black: #f3efe4;
--dark-warm: #ded6c6;
--olive: #bdb6a7;
--stone: #8d887d;
--brand: #ded6c6;
--brand-light: #f3efe4;
```

規則：

- Light mode 可以用 ink-blue 作少量 focus。
- Dark mode 的 highlight 不能比正文暗，也不能用亮藍搶過文字。
- 5mlstudio 的淡藍 `#b1e8f4` 禁止作為 RonnieCC UI token。
- 不使用彩色光斑、漸變、玻璃擬態或 app-style 多色分類。

## 字體規則

主字體使用 **Montserrat**，自託管，授權為 SIL Open Font License 1.1。

- Light display text: `font-weight: 200`
- Emphasis text: `font-weight: 700`
- Utility / metadata: `400` 或 `700`
- 不使用 `Thin 100`，目前已改為 `200` 以提高可讀性。
- 不使用 TsangerJinKai02；它在這個網站上會形成幼稚和錯誤的視覺語氣。
- 不使用 Circe；它曾帶來版權風險。
- 不使用 Manrope；目前已被 Montserrat 取代。

字體 fallback 可以包含 Apple / CJK system fonts，以避免中文缺字：

```css
"Montserrat", -apple-system, BlinkMacSystemFont, "SF Pro Display",
"SF Pro Text", "PingFang TC", "PingFang SC", "Hiragino Sans GB",
"Microsoft YaHei", "Noto Sans CJK TC", "Noto Sans CJK SC", sans-serif
```

## Typography 規則

Typography 是本網站的核心設計能力展示。

- 優先調整行距、字距、行長、斷行和空白，而不是增加裝飾。
- 不使用負字距。
- 大標題必須有明確的手工斷行；不能依靠瀏覽器隨機換行。
- 首屏主句需要形成強左軸。
- 空氣感比信息密度重要，但不能犧牲語義清晰。
- Highlight 必須在視覺上高於或至少不低於普通正文；不能只是顏色不同。

目前 index 主句的規則：

```css
font-size: clamp(36px, 5.15vw, 74px);
font-weight: 200;
line-height: 1.18;
letter-spacing: 0.006em;
```

輔助文案：

```css
font-size: clamp(13px, 1.25vw, 16px);
font-weight: 400;
letter-spacing: 0.035em;
```

## Layout 規則

5mlstudio 提供的是布局方法，不是顏色或品牌復刻。

- 大留白。
- 左對齊閱讀軸。
- 內容靠 typography 建立節奏。
- 第二屏可以使用 SVG 幾何圖形，但只能作為結構符號。
- SVG 使用 `currentColor`，由 Kami token 控制。
- 卡片不是主要語言；除非是重複項目的必要容器，否則避免卡片。
- 頁面 section 用 border、間距和排版分層，不用厚重背景和陰影。

## 頁面規則

### Index

- 第一屏：typographic statement。
- 第二屏：少量幾何 SVG + 文字，表達核心能力判斷。
- 不放 project cards。
- 不做 marketing hero。

### Projects

- 是 project index，不是 app store grid。
- 每個 project 用編號、幾何標記、名稱、type、summary、capability、tags 組成。
- 主要品質來自字距、行距和信息節奏，不來自卡片裝飾。

### Project Detail

- Detail 是長文排版頁。
- Aside 只放 metadata，不做卡片組。
- Narrative / System / Proof 用大間距、細線和清楚標題分層。

### Resume

- Resume 是 typographic resume page，不是 Kami PDF 模板。
- 不使用紙張卡片、左色條或 resume sheet 裝飾。
- 信息需要清晰，但外觀仍服從整站 typography 規則。

## 禁止方向

- 禁止 TsangerJinKai02。
- 禁止 Circe。
- 禁止 Manrope。
- 禁止 5mlstudio 淡藍作為 RonnieCC token。
- 禁止背景網格。
- 禁止大卡片牆作為首頁。
- 禁止 App Store 式 app grid。
- 禁止用亮藍在 dark mode 中搶過文字。
- 禁止把 Kami 當成外觀模板照搬。
- 禁止把 5mlstudio 當成 RonnieCC 復刻目標。

## 目前設計狀態

截至目前：

- Index 已採用 Montserrat + Kami color + 5mlstudio layout method。
- Projects / Detail / Resume 已從卡片模板改向 typographic layout。
- Dark mode 的 brand/highlight 已改成 typography-compatible warm text token。
- 字體資產位於 `assets/fonts/montserrat/`，包含 Montserrat 200 / 400 / 700 與 OFL license。
