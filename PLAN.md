# PLAN.md - SEO / Google Indexing for column-repair.vercel.app

## Overview

This project is a browser-based tool (React + Vite) to repair column-type damage
in CSV, XLSX, and JSON files before CRM import, deployed at
`https://column-repair.vercel.app/`.

The original problem: the site was NOT indexed by Google and Google refused to
index it for 8 days. This plan covered comprehensive on-page SEO work to
diagnose and fix that. It IS: static-file SEO fixes (index.html meta, structured
data, robots/sitemap, crawler rendering) - nothing about app features.

Note: AGENTS.md references `docs/PLAN.md`; this file lives at the repo root as
`PLAN.md`. Do not duplicate.

## Decisions

- 2026-09-13 - Production URL is `https://column-repair.vercel.app/`. All
  canonical, `og:url`, sitemap, and JSON-LD URLs use this origin.
- 2026-09-13 - SEO changes are static-file only (`index.html`, `public/`);
  no runtime dependencies needed for the SEO work itself.
- 2026-09-13 - Existing tags kept: Google site-verification meta
  (`yGq-gFJAaziwZwGATxguE3BP1o-_p06wtHpvLqgLa9s`), favicon links, viewport.
- 2026-09-13 - Structured data: single JSON-LD `WebApplication` block
  (schema.org), `offers.price: 0`, describing the tool. No keyword-stuffing.
- 2026-09-13 - Copy style: no em dashes anywhere (user request, avoids the
  AI-writing tell). Punctuation is sentence-appropriate: colons for the title
  and definition lists, commas/periods elsewhere. Legitimate compound-word
  hyphens (client-side, in-browser) and all code arithmetic are kept.

## Done

- 2026-09-13 - Repo cloned from `github.com/jonah721/CSV_JSON_COLUMN_TYPE_CLEANER`
  into this folder (branch `main`).
- 2026-09-13 - SEO audit of `index.html`: no canonical, no og:url/og:image,
  vague description, no JSON-LD.
- 2026-09-13 - On-page SEO edits applied to `index.html` (PR #1, commit
  9756a6b, merged f78ea3a): canonical URL, og:url/og:site_name/og:image
  (+dimensions), twitter:title/description/image, keyword-rich meta
  description, and JSON-LD `WebApplication` block.
- 2026-09-13 - Live-site indexing diagnosis: site returns 200, no
  `X-Robots-Tag: noindex` header, robots.txt allows all agents and lists the
  sitemap, sitemap returns 200 with correct canonical origin. Conclusion: the
  indexing refusal was NOT technical blocking; most likely the URL was never
  submitted/verified in Google Search Console, or was pending quality
  evaluation ("Discovered/Crawled - not indexed").
- 2026-09-13 - `public/og-image.png` added (1200x630 PNG, user-supplied);
  og:image / twitter:image now resolve.
- 2026-09-13 - Crawlable static SEO content added inside `#root` (commit
  c2c575b): keyword-rich H1/H2/H3, feature list, how-it-works, and FAQ.
  Crawlers see full text in the raw HTML; React's `createRoot().render()`
  replaces it at runtime. `<noscript>` fallback added. Sitemap `lastmod`
  refreshed to 2026-09-13 and XML validated.
- 2026-09-13 - Crawlability verified on the live deployment: HTTP 200, no
  noindex meta, no X-Robots-Tag header, no redirect, robots.txt allows all,
  full static HTML served (5.2 KB of crawlable content).
- 2026-09-13 - Copy/punctuation sweep complete across the entire site,
  including the final flow screens (commits ce4358e, c38eb16): all 41 em
  dashes removed and replaced with natural punctuation (colons, commas,
  sentence splits) in index.html, PLAN.md, AGENTS.md, ExportStep.tsx, and
  FeedbackModal.tsx. Verified zero em dashes and zero stray " - " in visible
  copy through the last user-facing page. Code arithmetic and compound-word
  hyphens intentionally kept. `tsc --noEmit` passes after dependency install.
- 2026-09-13 - Geo-targeting check: no hreflang or country signals in any
  href tag; site is eligible worldwide (no tier restrictions).

## In Progress

- Item: unblock Google indexing via Search Console (user action).
- Next action: in Google Search Console, run URL Inspection on
  `https://column-repair.vercel.app/` and click Request Indexing. The sitemap
  was already submitted once; no re-submission required (Google re-crawls
  sitemaps periodically, and lastmod is refreshed).
- Optional user check: verify og-image renders via a social platform's link
  debugger or a cache-busting query string (`?v=2`) when sharing.

## Backlog

- Consider a small `docs/` or blog page with use-case content for keyword coverage.
- Fix mojibake in `vite.config.ts` comment ("Do not modifyfile watching").
- Full copy proofread of every visible UI string (phrasing, not punctuation).
- GitHub Actions check to validate sitemap XML and required meta tags per push.
- If the tool grows multiple pages/states, give each a real URL with links.

## Status

All on-page SEO work is complete and deployed (meta tags, JSON-LD, og-image,
static crawlable content, sitemap lastmod, punctuation sweep). The site is
fully crawlable with no technical blocks. Remaining: user requests indexing
in Google Search Console; indexing should follow within days.
