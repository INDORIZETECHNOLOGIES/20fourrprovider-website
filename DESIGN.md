---
name: 20fourr Provider
description: The supply-side app and landing page for verified, PSARA-licensed security professionals and agencies in India.
colors:
  navy: "#1b2a4a"
  navy-deep: "#18253f"
  navy-ink: "#f2f4f8"
  brass: "#a9782e"
  brass-strong: "#8c621f"
  on-brass: "#0f1829"
  paper: "#f5f6f8"
  paper-raised: "#ffffff"
  ink: "#12161d"
  ink-muted: "#5b6472"
  line: "#dde1e6"
  danger: "#b3261e"
  danger-bg: "#fbeceb"
  success: "#1a7a4a"
  success-bg: "#edf7f2"
  warning: "#b45309"
  warning-bg: "#fef3e2"
typography:
  display:
    fontFamily: "Roboto Slab, Georgia, serif"
    fontSize: "clamp(1.875rem, 3.3vw, 2.875rem)"
    fontWeight: 600
    lineHeight: 1.08
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Roboto Slab, Georgia, serif"
    fontSize: "clamp(1.75rem, 3.2vw, 2.625rem)"
    fontWeight: 600
    lineHeight: 1.12
    letterSpacing: "-0.015em"
  display-close:
    fontFamily: "Roboto Slab, Georgia, serif"
    fontSize: "clamp(2rem, 4.4vw, 3.5rem)"
    fontWeight: 600
    lineHeight: 1.08
    letterSpacing: "-0.02em"
  door-title:
    fontFamily: "Roboto Slab, Georgia, serif"
    fontSize: "clamp(1.625rem, 2.6vw, 2.25rem)"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "-0.015em"
  title:
    fontFamily: "Roboto Slab, Georgia, serif"
    fontSize: "1.75rem"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.025em"
  doc-title:
    fontFamily: "Roboto Slab, Georgia, serif"
    fontSize: "1.375rem"
    fontWeight: 600
    lineHeight: 1.2
  figure:
    fontFamily: "Roboto Slab, Georgia, serif"
    fontSize: "1.125rem"
    fontWeight: 700
    letterSpacing: "-0.01em"
    fontFeature: "tnum"
  figure-lg:
    fontFamily: "Roboto Slab, Georgia, serif"
    fontSize: "1.5rem"
    fontWeight: 600
    fontFeature: "tnum"
  figure-md:
    fontFamily: "Roboto Slab, Georgia, serif"
    fontSize: "1.25rem"
    fontWeight: 600
    fontFeature: "tnum"
  lede:
    fontFamily: "Public Sans, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "1.1875rem"
    fontWeight: 400
    lineHeight: 1.55
  body:
    fontFamily: "Public Sans, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  body-lg:
    fontFamily: "Public Sans, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.5
  body-sm:
    fontFamily: "Public Sans, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.5
  small:
    fontFamily: "Public Sans, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.45
  label:
    fontFamily: "Public Sans, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 600
    lineHeight: 1.45
    letterSpacing: "0.01em"
  caption:
    fontFamily: "Public Sans, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.4
rounded:
  sm: "6px"
  md: "12px"
  pill: "999px"
spacing:
  "1": "4px"
  "2": "8px"
  "3": "12px"
  "4": "16px"
  "5": "20px"
  "6": "24px"
  "8": "32px"
  "10": "40px"
  "12": "48px"
  "14": "56px"
  "16": "64px"
components:
  button-primary:
    backgroundColor: "{colors.navy}"
    textColor: "{colors.navy-ink}"
    rounded: "{rounded.sm}"
    padding: "12px 16px"
    typography: "{typography.body}"
  button-primary-hover:
    backgroundColor: "{colors.navy-deep}"
    textColor: "{colors.navy-ink}"
  button-brass:
    backgroundColor: "{colors.brass}"
    textColor: "{colors.on-brass}"
    rounded: "{rounded.sm}"
    padding: "0 20px"
    height: "48px"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.navy}"
    rounded: "{rounded.sm}"
    padding: "0 24px"
    height: "52px"
  input:
    backgroundColor: "{colors.paper-raised}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "11px 16px"
  badge-action:
    textColor: "{colors.brass-strong}"
    rounded: "{rounded.pill}"
    padding: "4px 12px"
    typography: "{typography.label}"
  badge-danger:
    backgroundColor: "{colors.danger-bg}"
    textColor: "{colors.danger}"
    rounded: "{rounded.pill}"
    padding: "4px 12px"
  row-list:
    backgroundColor: "{colors.paper-raised}"
    rounded: "{rounded.md}"
  document-sheet:
    textColor: "{colors.ink}"
    rounded: "0"
    typography: "{typography.doc-title}"
  statement-sheet:
    backgroundColor: "{colors.paper-raised}"
    textColor: "{colors.ink}"
    rounded: "0"
    padding: "clamp(24px, 3vw, 36px)"
  nav-landing:
    backgroundColor: "{colors.navy}"
    textColor: "{colors.navy-ink}"
    height: "60px"
---

# Design System: 20fourr Provider

## Overview

**Creative North Star: "The Credential Register"**

20fourr looks like the paperwork of a regulated trade done properly: a navy uniform ground, a brass insignia that marks what is verified or chosen, and cool paper on which rates, statements and checklists are ruled like documents. The authenticated app is a working register: dense rows, hairline dividers, slab-set figures. The public landing page is the same register at poster scale. The navy becomes a full field, the slab sets large, and ruled documents are the only illustration.

Density is honest rather than airy. Rows carry real data, amounts sit in tabular slab figures, and verification status is always on screen. Brass is scarce. It marks focus, selection, the chosen option and the one call to action on a navy ground. Nothing competes with it.

The system rejects generic SaaS: no slogan-and-floating-mockup heroes, no icon-tile feature grids, no numbered step timelines, no emoji or icon packages. The icon set is a monoline SVG component that strokes in `currentColor`.

**Key Characteristics:**
- Navy field, brass as the single active colour, cool paper ground.
- Roboto Slab for titles and money; Public Sans for everything read or typed.
- Documents are flat, square-cornered sheets opened by a heavy rule and divided by hairlines.
- Controls get gentle 6px corners and containers 12px; documents get none.
- Motion is brief and functional, with one authored moment per surface, and it drops to instant under reduced motion.

## Colors

A two-voice palette: an authoritative deep navy and a muted brass insignia, set on a faintly blue-grey paper, with status colours used only for status.

### Primary
- **Uniform Navy** (navy): Takes the primary button, the app sidebar, the dashboard's next-shift card, the landing hero field, the payout passage and the footer. It works as a ground, not as a highlight. Hover darkens it to **Deep Navy** (navy-deep, navy mixed 88% with black).
- **Navy Ink** (navy-ink): The text colour on every navy ground. Secondary text on navy is Navy Ink mixed into navy, never lowered with opacity alone.

### Secondary
- **Insignia Brass** (brass): The one active colour. Used for the focus ring (2px outline, 2px offset), text selection (32% mix), the switch's on-state, the active-nav marker, the chosen landing door's top rule, list-bullet dashes, the settlement statement's top rule, the wordmark dot, and the primary button on a navy field.
- **Struck Brass** (brass-strong): A deeper brass for brass text on paper, such as badge labels, the document subject line, checklist ticks and FAQ chevrons. It reaches 5:1 on paper where plain brass would not.

### Neutral
- **Cool Paper** (paper): The page ground.
- **Raised Paper** (paper-raised): Lists, inputs, empty states, raised landing bands and the settlement sheet.
- **Register Ink** (ink): Body text, and the heavy rules that open a document.
- **Muted Ink** (ink-muted): Secondary lines, table notes, hints and long-form body on the landing page.
- **Hairline** (line): Every 1px divider and field stroke.

### Status
- **Danger / Success / Warning** with their pale grounds (danger-bg, success-bg, warning-bg): Used for banners, badges and state labels only. They are never decoration. Their dark-scheme values and the `-inverse` pair used on the navy sidebar are in the sidecar.

### Named Rules
**The One Brass Rule.** Brass marks what is active, chosen, focused or verified-in-action. It never fills a section, and a screen carries one brass call to action at most.

**The Navy Legibility Rule.** Small print on navy is Navy Ink mixed into navy at 76% or more (`color-mix(in srgb, navy-ink 76%, navy)`), which holds at least 4.5:1. An unchosen or secondary element on navy recedes through its ground and frame, never by dimming its text.

**The Scoped Night Rule.** In the dark scheme the app shifts to neutral slate (paper `#0e1116`, navy `#23355e`). The landing page stays in the navy world instead. Its root re-scopes navy to `#1b2a4a`, paper to `#0f1829`, raised paper to `#142038` and line to `#26344f`.

## Typography

**Display Font:** Roboto Slab (with Georgia, serif), weights 500/600/700 via `--font-display`
**Body Font:** Public Sans (with -apple-system, Segoe UI, sans-serif), weights 400–700 via `--font-body`

**Character:** A sturdy slab serif with the weight of a stamped certificate, over a neutral civic sans that reads as form and ledger. The slab never sets body copy; the sans never sets a headline.

### Hierarchy
- **Display** (600, clamp(1.875rem → 2.875rem), 1.08): The landing hero statement, balanced and capped at 34ch. A secondary clause may follow in weight 500 and a navy-ink mix.
- **Display Close** (600, clamp(2rem → 3.5rem), 1.08): The landing page's closing statement, the one place the slab goes to poster size below the fold.
- **Headline** (600, clamp(1.75rem → 2.625rem), 1.12): Landing section titles, balanced.
- **Door Title** (600, clamp(1.625rem → 2.25rem), 1.1): The two landing doors.
- **Title** (700, 1.75rem, 1.15, -0.025em): App page titles via the page header.
- **Doc Title** (600, 1.375rem, 1.2): The title line of a ruled document and a statement's total row.
- **Figure** (Slab 700, 1.125rem, tabular): Money and dates in rows, such as booking amounts, the credential rate and the next-shift day numeral in brass.
- **Figure LG / MD** (Slab 600, 1.5rem / 1.25rem, tabular): The credential rate in a door; the wordmark and statement figures.
- **Lede** (400, 1.1875rem, 1.55): The first paragraph of a landing section, in full ink.
- **Body** (400, 1rem, 1.5 in the app, 1.65 in landing long-form): Capped at 62–68ch.
- **Body LG** (1.0625rem): Door facts, FAQ questions, the mobile menu. **Body SM** (0.9375rem): Document rows, nav links, secondary actions. **Small** (0.875rem): Compact controls and the nav call to action.
- **Label** (600, 0.8125rem, +0.01em): Field labels, badges, table heads, captions and state words. Sentence case.
- **Caption** (0.75rem): Day names in the week strip and table sub-heads only. Never for anything a reader must act on.

### Named Rules
**The Slab Figures Rule.** Any amount a provider earns or is charged is set in Roboto Slab with tabular numerals. Money is the headline of a row.

**The Sentence Case Rule.** Labels, badges, table heads and captions are sentence case at 0.75–0.8125rem. Headlines are never introduced by a tracked uppercase line.

## Layout

The app is a sidebar shell (a navy sidebar on desktop, a bottom tab bar on mobile) wrapping single-column pages. Each page is a page header and then stacked row lists. The landing page runs full-bleed bands (navy, paper, raised paper, navy) around a 1200px container with a `clamp(16px, 4vw, 40px)` gutter. Band padding is `clamp(56px, 8vw, 104px)`, and the closing band reaches `clamp(64px, 9vw, 120px)`.

Landing content uses an asymmetric 5:6 split, text beside document, with a `clamp(32px, 6vw, 88px)` gap. It collapses to one column at 900px. The two hero doors split 7:5 and stack at 860px. Spacing follows the 4px-based scale (4–64px). Row interiors use 16/20px, and page sections use 24px. Breakpoints in use are 430, 520/560, 768, 860, 900 and 1024px.

## Elevation & Depth

The system is mostly flat and relies on tonal layering: paper, then raised paper, then navy. Depth comes from ground changes and hairlines. Soft ambient shadows exist but are rationed to a few lifted objects in the app: the auth card, the dashboard's next-shift card (which deepens on hover) and the primary button's resting 1px shadow. Documents, rows and every landing surface carry no shadow.

### Shadow Vocabulary
- **Card** (`box-shadow: 0 2px 8px rgba(0,0,0,0.06), 0 8px 32px rgba(0,0,0,0.08)`): The auth card and the next-shift card.
- **Card hover** (`box-shadow: 0 4px 16px rgba(0,0,0,0.1), 0 16px 48px rgba(0,0,0,0.12)`): Next-shift card on hover.
- **Small** (`box-shadow: 0 1px 3px rgba(0,0,0,0.05), 0 2px 8px rgba(0,0,0,0.06)`): Minor raised app elements.

### Named Rules
**The Paper Lies Flat Rule.** A document never casts a shadow. It is ruled, not lifted.

## Shapes

Three corner registers. **Controls** (buttons, inputs, selects, nav links, week cells, photos) take gently softened corners (6px). **Containers** (row lists, empty states, the landing doors, the dashboard shift card) take 12px. **Documents** (rate card, settlement statement, checklist, ranking table, FAQ list) are square. Badges and switch tracks are full pills. Initials avatars and status dots are circles. Borders are 1px hairlines. Field strokes and outline buttons use 1.5px, and document rules use 2px (list tops, statement totals) or 4px (document openers, the chosen-door rule).

## Components

### Buttons
Solid, plain and authoritative.
- **Shape:** gently softened (6px).
- **Primary:** Navy with Navy Ink text, weight 600. In the app it is a full-width `Button` with 12px/16px padding and a 1px resting shadow that lifts 1px on hover. On the landing page it is an inline link-button, 52px tall and flat.
- **Hover / Focus:** Navy darkens to navy-deep. Focus is the global brass outline, offset 3px on landing buttons. Disabled state is 45% opacity.
- **Brass (on a navy field only):** Brass with On Brass text (`--color-on-brass` #0f1829, 4.58:1; the brand navy is only 3.67:1 on brass, so it is never the label), 48px tall, used for the one call to action on the landing hero and nav. Hover lightens the brass (88% with white).
- **Secondary:** A 1.5px outline of navy mixed toward line, in navy text. On a navy field the outline is Navy Ink at 45%. Hover firms the outline and adds a 6% tint.
- **Text action:** An underlined link in ink or navy-ink with a brass underline at a 4–5px offset. This is the tertiary action everywhere.

### Badges
- **Style:** A pill with a label-weight word on a tinted ground. Variants are action (brass-strong on 16% brass), active (navy on 12% navy, or a navy ground with navy-ink text in the dark scheme), muted and danger.

### Cards / Containers
- **Row List:** Raised paper, 1px hairline border, 12px corners, hairlines between rows, no shadow. Rows supply no chrome of their own.
- **Empty State:** Raised paper at 12px, with a brass-tinted 40px icon well (6px corners, brass monoline icon), a slab title and a single underlined action. Its ground carries a 2% brass diagonal hatch.
- **Banner:** 1px border at 6px corners. Error uses danger colours, info a 7% brass wash, warning the warning ground.

### Inputs / Fields
- **Style:** A 1.5px hairline stroke on raised paper, 6px corners, 11px/16px padding, label above in label type.
- **Focus:** The stroke turns brass, with a 3px brass halo at 18%.
- **Error / Disabled:** Danger stroke with a 14% danger halo, and a danger message line below.

### Navigation
- **App sidebar:** Navy, with the wordmark and a brass dot. Links are Navy Ink at 70% and 15px/500. The active link has a 7% white ground and a 3px brass marker on its left edge. A verification-status badge sits at the top.
- **Landing nav:** A sticky navy bar (97% opacity) 60px tall, with a brass hairline at 15% beneath it. Links sit centred from 1024px. The brass CTA sits at the right, and below 1024px a 44px menu button opens a navy panel.

### Ruled Document (signature)
The landing page's only illustration, and the app's native register made visible. It opens with a 4px ink top rule, then a slab doc title and a brass-strong subject line closed by a 1px ink rule. Rows are 12px-padded and divided by hairlines, with tabular figures and right-aligned amounts. Corners are square and there is no shadow. Lists (checklist, FAQ) open with a 2px ink rule instead.

### Settlement Statement (signature)
A raised-paper sheet laid on the navy passage. It has a 4px brass top rule, square corners and no shadow. The total row takes a 2px ink rule and slab doc-title figures.

### Doors (landing hero)
Two 12px-cornered panels on the navy field, one per path. The chosen door gets a lifted ground (8% navy-ink into navy), a firmer frame and a 4px brass rule that scales in across its top over 420ms. The unchosen door drops to a transparent ground and a fainter frame, and its text keeps full contrast. Swapping the door body is the page's one authored moment. It uses a view transition where the old content fades out over 180ms and the new content rises 12px over 360ms on `cubic-bezier(0.16, 1, 0.3, 1)`. Under reduced motion the swap is instant.

## Do's and Don'ts

### Do:
- **Do** use Navy as a ground and Brass as the single active colour (see The One Brass Rule).
- **Do** set small print on navy at 76% or more Navy Ink into navy, and hold 4.5:1.
- **Do** set every amount in Roboto Slab with tabular numerals.
- **Do** draw information as ruled documents: a 4px ink opener, hairline rows, square corners, no shadow.
- **Do** use the global brass focus ring (2px, offset 2px) and brass selection (32%) unchanged.
- **Do** keep motion to 150–240ms state transitions plus at most one authored moment per surface, and make everything instant under `prefers-reduced-motion`.
- **Do** keep the landing page in the navy world in the dark scheme by re-scoping its tokens on the page root.
- **Do** extend the shared primitives (Button, Field, Badge, RowList, PageHeader, EmptyState, Icon) instead of restyling them per page.

### Don't:
- **Don't** build a slogan hero with a floating app mockup, an icon-tile feature grid or a numbered step timeline on public surfaces.
- **Don't** put gradient fills or rounded card stacks on the landing page. The faint brass hatch of the empty state is an app texture, not a fill to spread.
- **Don't** dim text to show that something is unselected. Recede the ground and frame instead.
- **Don't** give a document rounded corners or a shadow.
- **Don't** use emoji, icon packages or glyph characters as icons. Use the monoline `Icon` component.
- **Don't** introduce a headline kicker or tracked-uppercase eyebrow above a title.
- **Don't** use a status colour (danger, success, warning) for decoration.
