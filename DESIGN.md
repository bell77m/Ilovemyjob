---
version: alpha
name: Netscape 96
description: >
  90s World Wide Web UI. A personal homepage seen in Netscape Navigator 3 on
  Windows 95 at 800x600. Silver bevels, Times New Roman, blue underlined links,
  table layouts, web-safe color. No corner radius, no blur, no easing.
colors:
  # System chrome (Windows 95 drew these, so they sit outside the web-safe palette)
  primary: "#000080"            # title bars, selection, table headers
  on-primary: "#FFFFFF"
  primary-end: "#1084D0"        # right end of the title-bar gradient
  secondary: "#008080"          # Win95 desktop teal
  on-secondary: "#FFFFFF"
  tertiary: "#FFFF00"           # highlight, "under construction" stripes
  on-tertiary: "#000000"
  neutral: "#C0C0C0"            # silver: default page and chrome background
  on-neutral: "#000000"
  # Bevel quartet. Light comes from the top-left, always.
  bevel-highlight: "#FFFFFF"
  bevel-light: "#DFDFDF"
  bevel-shadow: "#808080"
  bevel-dark: "#0A0A0A"
  # Page
  surface: "#C0C0C0"
  surface-field: "#FFFFFF"      # inputs, list boxes, document wells
  text: "#000000"
  text-disabled: "#808080"      # always embossed with a 1px white text-shadow
  link: "#0000EE"
  link-visited: "#551A8B"
  link-active: "#FF0000"        # only while pressed
  selection: "#000080"
  on-selection: "#FFFFFF"
  tooltip: "#FFFFE1"
  # Night page variant (black background homepages)
  night: "#000000"
  on-night: "#FFFFFF"
  night-heading: "#00FF00"
  night-link: "#00FFFF"
  night-link-visited: "#FF00FF"
  # Web-safe accents (hex digits limited to 00/33/66/99/CC/FF)
  hot: "#CC0000"                # NEW! badges and alerts. Use this, not #FF0000, behind text
  lime: "#00FF00"
  aqua: "#00FFFF"
  fuchsia: "#FF00FF"
  maroon: "#990000"
  olive: "#999900"
  green: "#009900"
  purple: "#990099"
  lavender: "#CCCCFF"           # light table-header alternative
  counter-bg: "#000000"
  counter-digit: "#00FF00"
typography:
  h1:
    fontFamily: "Times New Roman, Times, serif"
    fontSize: 32px
    fontWeight: 700
    lineHeight: 1.15
  h2:
    fontFamily: "Times New Roman, Times, serif"
    fontSize: 24px
    fontWeight: 700
    lineHeight: 1.2
  h3:
    fontFamily: "Times New Roman, Times, serif"
    fontSize: 19px
    fontWeight: 700
    lineHeight: 1.2
  banner:
    fontFamily: "Arial Black, Arial, Helvetica, sans-serif"
    fontSize: 36px
    fontWeight: 700
    lineHeight: 1.1
  body:
    fontFamily: "Times New Roman, Times, serif"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.25
  body-sm:
    fontFamily: "Times New Roman, Times, serif"
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.25
  ui:
    fontFamily: "MS Sans Serif, Microsoft Sans Serif, Tahoma, Geneva, sans-serif"
    fontSize: 11px
    fontWeight: 400
    lineHeight: 1.2
  ui-bold:
    fontFamily: "MS Sans Serif, Microsoft Sans Serif, Tahoma, Geneva, sans-serif"
    fontSize: 11px
    fontWeight: 700
    lineHeight: 1.2
  mono:
    fontFamily: "Courier New, Courier, monospace"
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.2
  fun:
    fontFamily: "Comic Sans MS, Comic Sans, cursive"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.3
rounded:
  none: 0px                     # the only radius. Radio buttons are the one circle.
spacing:
  hairline: 1px
  bevel: 2px
  xs: 2px                       # table cellspacing
  sm: 4px                       # table cellpadding
  md: 8px                       # body margin
  lg: 16px                      # paragraph gap (1em)
  xl: 32px
  page-width: 760px             # 800x600 screen minus scrollbar
components:
  button:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    typography: "{typography.ui}"
    rounded: "{rounded.none}"
    padding: 0 12px
    width: 75px                 # minimum
    height: 24px                # minimum
  button-disabled:
    textColor: "{colors.text-disabled}"
  input:
    backgroundColor: "{colors.surface-field}"
    textColor: "{colors.text}"
    typography: "{typography.ui}"
    rounded: "{rounded.none}"
    padding: 3px 4px
    height: 24px
  window:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.none}"
    padding: 3px
  window-titlebar:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.ui-bold}"
    height: 18px
    padding: 0 2px 0 3px
  window-titlebar-inactive:
    backgroundColor: "{colors.bevel-shadow}"
    textColor: "{colors.bevel-light}"
  link:
    textColor: "{colors.link}"
  link-visited:
    textColor: "{colors.link-visited}"
  link-active:
    textColor: "{colors.link-active}"
  table-header:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.body}"
    padding: 4px
  table-cell:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    padding: 4px
  tooltip:
    backgroundColor: "{colors.tooltip}"
    textColor: "{colors.text}"
    typography: "{typography.ui}"
    padding: 2px 4px
  badge-new:
    backgroundColor: "{colors.hot}"
    textColor: "{colors.tertiary}"
    typography: "{typography.ui-bold}"
    padding: 1px 3px
  hit-counter:
    backgroundColor: "{colors.counter-bg}"
    textColor: "{colors.counter-digit}"
    typography: "{typography.mono}"
    padding: 2px 4px
  status-bar:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    typography: "{typography.ui}"
    height: 20px
---

# Netscape 96

## Overview

It's 1996, someone just learned HTML 3.2, and this is their homepage. The style is
earnest and handmade, and a bit loud. It has two layers, and you need to keep them apart:

- **Chrome** is drawn by the operating system: silver panels, 2px bevels, 11px MS Sans
  Serif, a navy title bar. It covers buttons, inputs, windows, toolbars and status bars.
- **Page** is drawn by the browser: an HTML document in Times New Roman on default
  gray, with blue underlined links, `<hr>` dividers, table layouts, and centered
  headlines.

Principles:

1. **Bevels, not shadows.** Depth comes from four flat colors arranged around an edge.
   Nothing blurs.
2. **Browser defaults are the design.** Times 16px, an 8px body margin, `#0000EE` links,
   1em paragraph gaps. If an unstyled 1996 browser did it, it's correct.
3. **Pixel-exact.** Lines are 1px, sizes are whole pixels, and images use
   `image-rendering: pixelated`.
4. **Loud is allowed but rationed.** Each viewport gets at most one marquee, one hit
   counter and one blinking thing.
5. **Retro skin, modern bones.** Underneath, the markup is semantic, accessible and
   responsive. Only the look is from 1996.

## Colors

**Chrome:** silver `#C0C0C0` is the base for every panel. Navy `#000080` marks
"active": title bars, selected rows, focused list items. The title bar fades from navy
to `#1084D0`, as in Windows 98. A solid navy bar is the stricter Windows 95 look.

**Bevel quartet:** `#FFFFFF`, `#DFDFDF`, `#808080` and `#0A0A0A`. These four colors
make every raised and sunken edge. See Elevation & Depth.

**Links:** unvisited `#0000EE`, visited `#551A8B`, active `#FF0000`. Links are always
underlined. Hover does not change the color, which matches period browsers.

**Accents:** pick from the 216-color web-safe palette, where every hex pair is 00, 33,
66, 99, CC or FF. Silver, navy and link blue break this rule because the OS and the
browser drew them. Accents are for banners, GIF-style art, table backgrounds and
badges. Don't use them for body text on silver.

**Page backgrounds**, one per page:

| Variant | Background | Text | Links | Use |
|---|---|---|---|---|
| Default gray | `#C0C0C0` | `#000000` | `#0000EE` / `#551A8B` | Default. No `bgcolor` set. |
| White | `#FFFFFF` | `#000000` | `#0000EE` / `#551A8B` | "Professional" pages, documents |
| Night | `#000000` | `#FFFFFF`, headings `#00FF00` | `#00FFFF` / `#FF00FF` | Cyber, gaming, band pages. Also the `prefers-color-scheme: dark` page. |
| Tiled image | 64–128px repeating tile | per tile | per tile | Put text inside a solid table cell, never directly on the tile |

In the Night variant, chrome stays silver. Windows are still gray when the wallpaper
is dark.

**Contrast:** all default pairs pass WCAG AA. Black on silver is 11.5:1, link blue on
silver 5.5:1, visited purple on silver 6:1, white on navy 16:1. Red `#FF0000` behind
text fails, so badges use `#CC0000` with yellow or white text (about 5.5:1).

## Typography

| Role | Font | Size | Notes |
|---|---|---|---|
| h1 / h2 / h3 | Times New Roman bold | 32 / 24 / 19px | Browser-default heading scale. Often `<center>`ed. |
| banner | Arial Black | 36px | Masthead only ("Welcome to My Homepage!"). Can use a gradient or a 2px hard offset shadow. |
| body | Times New Roman | 16px / 1.25 | Every paragraph and list |
| body-sm | Times New Roman | 13px | Footers, "Last updated", captions (`<font size=2>`) |
| ui / ui-bold | MS Sans Serif → Tahoma | 11px | Chrome only: buttons, inputs, title bars, menus, status bar |
| mono | Courier New | 13px | `<pre>`, code, hit counters, ASCII art |
| fun | Comic Sans MS | 16px | Guestbook entries and the occasional aside. Never headings or nav. |

Rules:
- Use only weights 400 and 700. No letter-spacing. No uppercase transforms.
- Underline only links.
- The legacy `<font size>` scale is 1 = 10px, 2 = 13px, 3 = 16px, 4 = 18px, 5 = 24px,
  6 = 32px, 7 = 48px. Use it when something needs an in-between size.
- You can load a bitmap pixel font for chrome. Tahoma at 11px is the fallback.

## Layout

- **Fixed width, centered.** The content table is at most 760px wide, which fits an
  800x600 screen. For a stricter 640x480 feel, use 600px.
- **Classic homepage grid**:
  1. A full-width banner row at the top.
  2. A 150px left nav column with a colored background, holding a link list or
     image buttons.
  3. A fluid content column.
  4. A footer with the hit counter, "Last updated", a `mailto:` link, a row of
     88x31 badges, and the web ring.
- **Spacing:** 8px body margin, 1em between paragraphs, 4px cellpadding, 2px
  cellspacing. Put an `<hr>` between major sections instead of whitespace.
- **Alignment:** headlines, banners, images and dividers are centered. Body text is
  left-aligned and ragged-right. Never justify.
- **Lists** use default disc bullets or small 12px bullet images (the "rainbow ball").
- **Responsive.** The design has to work on phones, even though 1996 didn't. Below
  640px, stack the nav above the content, keep the 8px margin, and let windows and
  tables go full width. The page must never scroll horizontally. Build with CSS
  grid or flexbox and make it look like tables. Don't use `<table>` for layout.

## Elevation & Depth

There's no `filter: blur`, no soft `box-shadow`, and no translucency. Depth is a 2px
bevel built from the four bevel colors, lit from the top-left.

| Level | Edges (outer, inner) | Used for |
|---|---|---|
| Flat | none | Page content, text |
| Raised | top-left white, light · bottom-right dark, shadow | Buttons, windows, toolbars, panels, scrollbar thumbs |
| Sunken | top-left shadow, dark · bottom-right white, light | Inputs, list boxes, iframes, status-bar panels, hit counter |
| Pressed | top-left dark, shadow · bottom-right white, light | Buttons while held, toggled toolbar buttons |
| Etched | 1px shadow line over 1px white line | `<hr>`, group boxes (`fieldset`), menu separators |

```css
--raised:  inset -1px -1px #0a0a0a, inset 1px 1px #ffffff, inset -2px -2px #808080, inset 2px 2px #dfdfdf;
--sunken:  inset -1px -1px #ffffff, inset 1px 1px #808080, inset -2px -2px #dfdfdf, inset 2px 2px #0a0a0a;
--pressed: inset -1px -1px #ffffff, inset 1px 1px #0a0a0a, inset -2px -2px #dfdfdf, inset 2px 2px #808080;
--window:  inset -1px -1px #0a0a0a, inset 1px 1px #dfdfdf, inset -2px -2px #808080, inset 2px 2px #ffffff;
```

Use `inset` box-shadows rather than borders so the bevel doesn't change the layout box.

## Shapes

- Every corner radius is `0`. The one circle is the radio button, 12px.
- Strokes are 1px. Bevels are 2px. Nothing else gets a border width.
- Standard sizes: icons 16x16 and 32x32, badges 88x31, ad banners 468x60, title-bar
  buttons 16x14, checkboxes 13x13.

## Components

**Button.** At least 75x24 (Win95 used 23px; the extra pixel meets WCAG 2.5.8). Raised
bevel, ui font, centered label.
- Pressed: pressed bevel, and the label moves 1px right and 1px down.
- Focus: a 1px dotted black rectangle about 4px inside the edge. The default button
  also gets an extra 1px black outer border.
- Disabled: `#808080` text with `text-shadow: 1px 1px #fff` to emboss it.
- Toolbar buttons are flat until hovered. On hover they're raised; when toggled on,
  pressed.

**Text field / textarea.** White, sunken, 24px tall, ui font. If you need a
placeholder, make it `#808080`. Textareas get a classic scrollbar.

**Checkbox / radio.** Checkbox is a 13px white sunken square with a black pixel check.
Radio is a 12px sunken circle with a 4px black dot. Wrap the control in its `<label>`
so the whole line is the click target.

**Select.** A sunken white field with a raised 16px-wide button on the right holding a
black ▼. The open list has a 1px black border, and the selected row is navy with white
text.

**Window / dialog.** Window bevel, 3px padding.
- Title bar: 18px tall, navy gradient, bold white 11px title.
- Optional 16x16 icon at the left of the title.
- Minimize, maximize and close buttons at the right, 16x14, raised, with a 2px gap
  before close.
- Inactive windows get a gray title bar.
- Body is silver, or white for a document well.

**Link.** Underlined. Unvisited is blue, visited purple, and red while pressed. Image
links get a 2px border in the link color, as `<img border=2>` did. Focus is a 1px dotted
outline in `currentColor`.

**Table.** The outer border is a 1px raised edge, and each cell has a 1px sunken edge.
2px cell spacing, 4px padding. Header cells are bold and centered, either navy with
white text or `#CCCCFF` with black. Zebra rows are not period-correct.

**Horizontal rule.** Etched, full width or centered at 50%. A variant is a 2–4px
rainbow GIF-style divider image.

**Marquee.** One line of text scrolling right to left at a constant speed, linear and
roughly 10s per pass. Rules:
- It pauses on hover and on focus.
- If it loops forever, it needs a visible [Pause] button (WCAG 2.2.2).
- Under reduced motion it's static text.
- Never put essential content in a marquee.

**Blink.** Hard on/off at 1s per cycle. It stops after 4 cycles, under the 5s limit. At
most one per page, never on essential content, and off under reduced motion.

**Hit counter.** "You are visitor number" in body-sm, followed by 7 zero-padded digits.
Each digit sits in its own black sunken cell, as lime monospace or 7-segment style.

**NEW! badge.** Bold 11px yellow `NEW!` on `#CC0000`, placed inline after a link. It may
blink, within the blink rules.

**Under construction.** A banner with a border of yellow and black stripes at 45°
(`repeating-linear-gradient(45deg, #ff0 0 10px, #000 10px 20px)`). It holds a pixel
worker icon and "This page is under construction! Check back soon!"

**Web ring.** A centered bordered table: `[<< Prev] [Random] [Next >>] [List Sites]`,
with the ring name in bold above it.

**88x31 badges.** A row of small pixel buttons in the footer: "Best viewed at 800x600",
"Made with Notepad", "Get a free homepage". Make up generic designs. Don't reproduce
real logos.

**Status bar.** A 20px silver bar at the bottom of a window, made of sunken panels:
`Document: Done` on the left, then a progress panel and a zone panel.

**Tooltip.** `#FFFFE1` background, 1px black border, ui font, appears with no animation.

**Scrollbar.** 16px wide. Raised thumb and arrow buttons. The track is a 1px
checkerboard of white and silver.

**Guestbook form.** A two-column table with right-aligned bold labels (Name, E-mail,
Homepage URL, Comments). Submit and Reset buttons sit side by side. The guestbook can
use the `fun` font.

## Motion

- State changes happen at once, with no transitions. The only easing allowed is
  `linear` for marquees and `steps()` for everything else.
- Allowed: marquee, blink, looping pixel GIF-style animation, and a chunky
  block-segment progress bar.
- Banned: fades, slides, hover lifts, parallax, springs, skeleton shimmer.
- Under `prefers-reduced-motion: reduce`, every animation stops.

## Imagery & Iconography

- Pixel art at 16 and 32px, with a limited palette and hard 1-bit transparency (no
  soft alpha edges). Render with `image-rendering: pixelated`.
- Clip-art, spinning-globe and mailbox style icons, gradient "WordArt" headings, and
  tiled 64–128px background textures.
- Every image needs `alt` text. That's period-correct and required.
- Don't use thin-line SVG icon sets, emoji, photos with soft drop shadows, or
  glassmorphism.

## Voice & Copy

Enthusiastic and first-person: "Welcome to my homepage!", "Click here!", "Sign my
guestbook!", "Thanks for stopping by!", "Last updated: 10/10/96". Use title case in
headlines and chrome labels. Exclamation marks are fine in banners. Never use them in
error messages.

## Do's and Don'ts

**Do**
- Give every interactive surface a bevel, and keep links blue and underlined.
- Center headlines and separate sections with `<hr>`.
- Build with semantic HTML (`<button>`, `<nav>`, `<label>`) and make it look like 1996.
- Keep focus visible with the dotted rectangle.
- Use one page-background variant per page.

**Don't**
- Don't use `border-radius`, blur, translucency, or any box-shadow outside the bevel
  recipes.
- Don't use gradients anywhere except title bars, WordArt banners and
  under-construction stripes.
- Don't use transitions or hover animation.
- Don't build a 2020s hero (giant sans headline, centered CTA, lots of whitespace), and
  don't use ghost buttons or icon-only controls.
- Don't use the real `<blink>` or `<marquee>` elements. They're deprecated, so use the
  CSS versions.
- Don't stack loud elements: one marquee, one counter and one blink per viewport.
- Don't use real trademarked logos (browser, OS or company badges).

## Implementation Starter

```css
:root {
  --silver: #c0c0c0; --hl: #ffffff; --light: #dfdfdf; --shadow: #808080; --dark: #0a0a0a;
  --navy: #000080; --navy-end: #1084d0;
  --link: #0000ee; --link-visited: #551a8b; --link-active: #ff0000;
  --font-page: "Times New Roman", Times, serif;
  --font-ui: "MS Sans Serif", "Microsoft Sans Serif", Tahoma, Geneva, sans-serif;
  --font-mono: "Courier New", Courier, monospace;
  --raised:  inset -1px -1px var(--dark), inset 1px 1px var(--hl), inset -2px -2px var(--shadow), inset 2px 2px var(--light);
  --sunken:  inset -1px -1px var(--hl), inset 1px 1px var(--shadow), inset -2px -2px var(--light), inset 2px 2px var(--dark);
  --pressed: inset -1px -1px var(--hl), inset 1px 1px var(--dark), inset -2px -2px var(--light), inset 2px 2px var(--shadow);
  --window:  inset -1px -1px var(--dark), inset 1px 1px var(--light), inset -2px -2px var(--shadow), inset 2px 2px var(--hl);
}

body { margin: 8px; background: var(--silver); color: #000; font: 16px/1.25 var(--font-page); }
a { color: var(--link); }
a:visited { color: var(--link-visited); }
a:active { color: var(--link-active); }
:focus-visible { outline: 1px dotted currentColor; outline-offset: 1px; }
img { image-rendering: pixelated; }
hr { border: 0; border-top: 1px solid var(--shadow); border-bottom: 1px solid var(--hl); }

button {
  min-width: 75px; min-height: 24px; padding: 0 12px;
  font: 11px var(--font-ui); color: #000; background: var(--silver);
  border: 0; border-radius: 0; box-shadow: var(--raised);
}
button:active:not(:disabled) { box-shadow: var(--pressed); padding: 2px 11px 0 13px; }
button:focus-visible { outline: 1px dotted #000; outline-offset: -5px; }
button:disabled { color: var(--shadow); text-shadow: 1px 1px var(--hl); }

input, select, textarea {
  min-height: 24px; padding: 3px 4px; font: 11px var(--font-ui);
  background: #fff; border: 0; border-radius: 0; box-shadow: var(--sunken);
}

.window { background: var(--silver); padding: 3px; box-shadow: var(--window); }
.titlebar {
  display: flex; align-items: center; justify-content: space-between;
  height: 18px; padding: 0 2px 0 3px; color: #fff; font: bold 11px var(--font-ui);
  background: linear-gradient(90deg, var(--navy), var(--navy-end));
}

.retro-table { border: 1px solid; border-color: var(--hl) var(--shadow) var(--shadow) var(--hl); border-spacing: 2px; }
.retro-table :is(td, th) { border: 1px solid; border-color: var(--shadow) var(--hl) var(--hl) var(--shadow); padding: 4px; }
.retro-table th { background: var(--navy); color: #fff; }

.marquee { overflow: hidden; white-space: nowrap; }
.marquee > span { display: inline-block; padding-left: 100%; animation: marquee 10s linear infinite; }
.marquee:is(:hover, :focus-within) > span { animation-play-state: paused; }
@keyframes marquee { to { transform: translateX(-100%); } }

.blink { animation: blink 1s steps(1) 4; }
@keyframes blink { 50% { visibility: hidden; } }

@media (prefers-reduced-motion: reduce) {
  .marquee > span, .blink { animation: none; padding-left: 0; }
}

@media (prefers-color-scheme: dark) {
  body.auto-night { background: #000; color: #fff; }
  body.auto-night :is(h1, h2, h3) { color: #00ff00; }
  body.auto-night a { color: #00ffff; }
  body.auto-night a:visited { color: #ff00ff; }
}
```
