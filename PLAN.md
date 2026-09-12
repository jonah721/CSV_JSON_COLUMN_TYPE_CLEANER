# PLAN.md — SEO / Google Indexing for column-repair.vercel.app

## Overview

This project is a browser-based tool (React + Vite) to repair column-type damage
in CSV, XLSX, and JSON files before CRM import, deployed at
`https://column-repair.vercel.app/`.

The current problem: the site is NOT indexed by Google. Google refused to index
it for 8 days. This plan covers comprehensive on-page SEO work to diagnose and
fix that. It IS: static-file SEO fixes (index.html meta, structured data,
robots/sitemap, crawler rendering) — nothing about app features.

Note: AGENTS.md references `docs/PLAN.md`; this file lives at the repo root as
`plan.md`. Do not duplicate.

## Decisions

- 2026-09-13 — Production URL is `https://column-repair.vercel.app/`. All
  canonical, `og:url`, sitemap, and JSON-LD URLs use this origin.
- 2026-09-13 — SEO changes are static-file only (`index.html`, `public/`);
  no runtime dependencies need to be installed for this work.
- 2026-09-13 — Existing tags to keep: Google site-verification meta
  (`yGq-gFJAaziwZwGATxguE3BP1o-_p06wtHpvLqgLa9s`), favicon links, viewport.
- 2026-09-13 — Structured data: single JSON-LD `WebApplication` block
  (schema.org), `offers.price: 0`, describing the tool. No keyword-stuffing.

## Done

- 2026-09-13 — On-page SEO edits applied to `index.html`: canonical URL,
  og:url/og:site_name/og:image (+dimensions), twitter:title/description/image,
  keyword-rich meta description, and JSON-LD `WebApplication` block. Title
  extended with "Fix Data Before You Import".
- 2026-09-13 — Live-site indexing diagnosis: site returns 200, **no
  `X-Robots-Tag: noindex` header**, robots.txt allows all agents and lists the
  sitemap, sitemap returns 200 with correct canonical origin. No deployment
  protection wall detected via unauthenticated request. Conclusion: the indexing
  refusal is NOT technical blocking — most likely the URL was never
  submitted/verified in Google Search Console, or is pending quality evaluation
  ("Discovered/Crawled - not indexed"). Action: URL Inspection → Request
  Indexing in Search Console.
- 2026-09-13 — `public/og-image.png` added (1200×630 PNG, user-supplied);
  og:image / twitter:image now resolve. Backlog og-image item closed.
- Repo cloned from `github.com/jonah721/CSV_JSON_COLUMN_TYPE_CLEANER` into this folder (branch `main`).
- SEO audit of `index.html` completed. Findings:
  - No `<link rel="canonical">`, no `og:url`, no `og:image`
    (while `twitter:card` is `summary_large_image`, which expects an image).
  - Meta description is vague — no target keywords (CSV cleaner, fix column
    types, XLSX, JSON).
  - No JSON-LD structured data.
  - `robots.txt` and `sitemap.xml` exist (user-confirmed) — pending audit.
- 8-day indexing refusal diagnosis started. Likely causes to verify:
  1. `noindex` meta/robots or X-Robots-Tag header on the deployed site.
  2. Vercel Deployment Protection (authentication) blocking Googlebot.
  3. robots.txt disallowing crawlers, or sitemap URL mismatch with canonical.
  4. Domain not verified / not submitted in Google Search Console.

## In Progress

- Item: unblock Google indexing via Search Console (user action).
- Next action: in Google Search Console, run URL Inspection on
  `https://column-repair.vercel.app/` and click Request Indexing; verify the
  domain property and submit the sitemap.
- tsc could not run (`npm run lint`) because dependencies are not installed in
  this environment; only static HTML was changed, so no typecheck needed.
- Backlog og-image item remains before the og:image URL resolves.

Planned `index.html` changes:
1. `<link rel="canonical" href="https://column-repair.vercel.app/" />`
2. `<meta property="og:url" content="https://column-repair.vercel.app/" />`
3. `<meta property="og:image" content="https://column-repair.vercel.app/og-image.png" />`
   (need a 1200×630 PNG in `public/` — og-image.png)
4. `<meta name="twitter:image" content="...same..." />`
5. Sharper description with keywords, e.g.:
   "Free online tool to fix column type damage in CSV, XLSX and JSON files —
   repair dates, phone numbers and numbers in your browser before importing
   to your CRM. No upload required."
6. JSON-LD `WebApplication` block (name, description, applicationCategory,
   operatingSystem: Any, offers price 0, url).
7. Optional: `theme-color`, `og:site_name`, `twitter:title`/`twitter:description`.

Indexing-cause checklist (user-side or follow-up):
- [ ] Fetch `https://column-repair.vercel.app/robots.txt` — confirm it allows
      crawlers and lists the sitemap.
- [ ] Check sitemap URLs match the canonical origin exactly (https, no www,
      trailing-slash consistency).
- [ ] Verify Vercel project has Deployment Protection OFF for public access
      (auth-protected previews are the #1 cause of " Crawled - currently not
      indexed" on Vercel).
- [ ] In Google Search Console: URL Inspection on
      `https://column-repair.vercel.app/` — check the exact refusal reason
      (noindex? blocked? "Discovered/Crawled - not indexed"?), then
      Request Indexing.
- [ ] Check response headers for `X-Robots-Tag: noindex`.

## Backlog

- Submit sitemap in Google Search Console after fixes deploy.
- Consider a small `docs/` or blog page with use-case content for keyword coverage.
- Fix mojibake in `vite.config.ts` comment ("Do not modifyâfile watching").

## Status

All on-page SEO edits are complete (index.html meta + JSON-LD, robots.txt,
sitemap.xml, og-image). Remaining: deploy the changes to Vercel, then user
requests indexing in Google Search Console.
