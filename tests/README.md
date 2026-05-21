# Animate — Cypress Test Suite

End-to-end tests for the [animate](https://github.com/pvollenweider/animate) Jahia module.
Tests run against a live Jahia 8.2+ instance and verify that the `jmix:animate` render filter
correctly wraps content nodes with CSS animations, that all delay/iteration/reduced-motion
behaviours work as expected, and that the implementation is WCAG 2.1 AA compliant.

---

## Table of contents

- [Requirements](#requirements)
- [Quick start](#quick-start)
- [Running against an existing Jahia instance](#running-against-an-existing-jahia-instance)
- [Environment variables](#environment-variables)
- [Running the tests](#running-the-tests)
- [Generating reports](#generating-reports)
- [Project structure](#project-structure)
- [Shared helpers](#shared-helpers)
- [Test coverage](#test-coverage)

---

## Requirements

| Tool | Minimum version | Notes |
|------|----------------|-------|
| Node.js | **18.x** | 20.x recommended |
| Yarn | 1.22.x | Classic (v1) |
| Jahia | **8.2.0.0** EE | Instance must be reachable at `JAHIA_URL` |

---

## Quick start

### 1 — Build the module JAR

```bash
cd ..
mvn clean install
cd tests
```

This produces `../target/animate-2.0.0-SNAPSHOT.jar` (or the current release version).

### 2 — Install dependencies

```bash
yarn install --ignore-engines
```

> `--ignore-engines` is required on Node 18, which is below Cypress's stated minimum.
> Tests run correctly on Node 18 in practice.

### 3 — Configure your environment

```bash
cp .env.example .env
```

Edit `.env` and set at minimum:

```bash
JAHIA_URL=http://localhost:8080
SUPER_USER_PASSWORD=root1234
```

### 4 — Run the tests

```bash
yarn e2e:ci        # headless
yarn e2e:debug     # Cypress interactive UI
```

---

## Running against an existing Jahia instance

The `01-setup.cy.ts` spec automatically:
- deploys the `empty-templates` module (if not already present)
- deploys the animate JAR from `../target/`
- creates the `animatetest` site
- creates a test page with a `jnt:text` content node
- applies `jmix:animate` mixin and publishes

No manual Jahia setup is required. Just build, configure `.env`, and run.

---

## Environment variables

Set these in `.env` (copied from `.env.example`).

| Variable | Default | Description |
|----------|---------|-------------|
| `JAHIA_URL` | `http://localhost:8080` | Base URL of the Jahia instance |
| `SUPER_USER_PASSWORD` | `root1234` | Password for the `root` superuser |

The test suite reads `JAHIA_URL` via `Cypress.env('JAHIA_URL')` and
`SUPER_USER_PASSWORD` via `Cypress.env('SUPER_USER_PASSWORD')`.

---

## Running the tests

### Headless / CI

```bash
yarn e2e:ci
```

### Interactive (Cypress UI)

```bash
yarn e2e:debug
```

### Single spec

```bash
yarn e2e:ci --spec "cypress/e2e/02-animation-render.cy.ts"
```

Specs are numbered to enforce run order. **01** creates the `animatetest` site and
test content; **99** deletes them. Always run the full suite unless you know the
site and content already exist.

> **Important:** `01-setup.cy.ts` must complete successfully before any spec runs
> in isolation — it creates the `animatetest` site and the `jnt:text` content node
> that every other spec depends on.

---

## Generating reports

After `yarn e2e:ci`, reports land in `results/reports/`. Merge and render:

```bash
yarn report:merge   # merge per-spec JSON files → results/reports/report.json
yarn report:html    # render results/reports/report.html
```

Screenshots land in `results/screenshots/` and videos in `results/videos/`.

---

## Project structure

```
tests/
├── cypress/
│   ├── e2e/                              # Spec files (run in numbered order)
│   │   ├── 01-setup.cy.ts               # Deploy modules, create site/content, sanity checks
│   │   ├── 02-animation-render.cy.ts    # CSS loaded, wrapper div, classes, visibility
│   │   ├── 03-animation-delay.cy.ts     # delayBeforeAnimation vs delayBeforeDisplay modes
│   │   ├── 04-animation-iteration.cy.ts # Pause/resume button for looping animations
│   │   ├── 05-reduced-motion.cy.ts      # prefers-reduced-motion: reveals but no classes
│   │   ├── 06-edit-mode.cy.ts           # Edit mode: no CSS, no animation, always visible
│   │   ├── 07-accessibility.cy.ts       # WCAG 2.1 AA: inert, aria-hidden, pause button
│   │   └── 99-teardown.cy.ts            # Delete animatetest site
│   ├── fixtures/
│   │   ├── graphql/animate/
│   │   │   ├── addAnimateMixin.graphql       # Step 1: add jmix:animate mixin to a node
│   │   │   └── setAnimateProperties.graphql  # Step 2: set animation properties
│   │   ├── groovy/animate/
│   │   │   └── flushHtmlCache.groovy         # Flush all Jahia HTML cache instances
│   │   └── modules/
│   │       └── empty-templates-1.0.0.jar     # Template set deployed by 01-setup
│   ├── plugins/
│   │   └── index.js                     # Cypress plugin setup (@jahia/cypress)
│   └── support/
│       ├── animate.ts                   # Shared helpers (see table below)
│       └── e2e.js                       # Global Cypress setup (log collector, cache disable)
├── cypress.config.ts
├── .env.example
├── reporter-config.json
├── tsconfig.json
└── package.json
```

---

## Shared helpers

All helpers are exported from `cypress/support/animate.ts`.

| Helper | Purpose |
|--------|---------|
| `pageUrl(name)` | Live render URL: `/cms/render/live/en/sites/animatetest/home/<name>.html` |
| `editFrameUrl(name)` | Edit frame URL: `/cms/editframe/default/en/sites/animatetest/home/<name>.html` |
| `textNodePath(pageName)` | Full JCR path to the `jnt:text` test content node |
| `deployEmptyTemplates()` | Install `empty-templates` via provisioning API (no-op if already present) |
| `deployAnimateModule()` | Install the animate JAR from `../target/` via provisioning API |
| `createTestSite()` | Create the `animatetest` site with `empty-templates` template set and enable the animate module |
| `deleteTestSite()` | Delete the `animatetest` site |
| `createTestPage(name)` | Add a `jnt:page` under `/sites/animatetest/home` with an empty `pagecontent` list |
| `createTextContent(pageName)` | Add a `jnt:text` node inside the page's `pagecontent` list |
| `addAnimateMixin(pathOrId)` | **Step 1** — add `jmix:animate` mixin to an existing content node. Call once at setup time, right after `createRichTextContent`. Idempotent (safe to call again). |
| `setAnimationProps(pathOrId, props?)` | **Step 2** — set or update animation properties on a node that already has `jmix:animate`. Called in each test's `before()` to configure the specific scenario. All props optional — defaults: `animation=fadeIn`, `animationDelay=0`, `animationIterationCount=1`, `animationDelayUsage=delayBeforeAnimation`. |
| `publishNode(pathOrId, opts?)` | Publish a node to the live workspace. `opts.includeSubTree` (default `true`), `opts.waitMs` (default `3000`). Always call explicitly — autopublish timing is non-deterministic. |
| `flushHtmlCache()` | Flush all Jahia HTML render caches via Groovy. Required after mutations that do not automatically invalidate cached page HTML. |

---

## Test coverage

### 01 — Setup (`01-setup.cy.ts`)

Deploys modules, creates site, page, and animated content.

- animate OSGi bundle is deployed and in `STARTED` state
- Test page returns HTTP 200 in live mode
- Rendered page contains `<body>` element

### 02 — Animation render (`02-animation-render.cy.ts`)

Verifies the full render pipeline for a basic `fadeIn` animation.

- Aggregated CSS bundle (`/generated-resources/{hash}.min.css`) loads with HTTP 200 and contains animate.css rules (Jahia merges all CSS into a single bundle — no direct `animate.min.css` link is expected)
- Wrapper `div[id^="animate-"]` exists in DOM
- Wrapper contains the text content
- `animated` and `fadeIn` classes applied after IntersectionObserver fires
- Element visible after reveal
- `inert` attribute removed after reveal
- `aria-hidden` attribute removed after reveal

### 03 — Animation delay (`03-animation-delay.cy.ts`)

Tests both delay modes.

**`delayBeforeAnimation`** (CSS delay — element reveals immediately, animation delayed):
- Element reveals without waiting for the delay
- `animation-delay` CSS property is set on the wrapper

**`delayBeforeDisplay`** (JS timeout — element stays hidden until delay expires):
- Element opacity is `0` immediately after page load
- Element becomes visible after the timeout

### 04 — Animation iteration (`04-animation-iteration.cy.ts`)

Tests loop detection and the WCAG 2.2.2 pause control.

**Infinite loop:**
- Wrapper has `position: relative` (for pause button positioning)
- Pause button `[id^="animate-pause-"]` is present and visible
- Initial `aria-pressed="false"`, text "Pause animation"
- Clicking pause: `animation-play-state: paused`
- Clicking pause: `aria-pressed="true"`, text "Resume animation"
- Clicking resume: `animation-play-state: running`, `aria-pressed="false"`, text "Pause animation"

**Single iteration (default):**
- Pause button is absent

### 05 — Reduced motion (`05-reduced-motion.cy.ts`)

Emulates `prefers-reduced-motion: reduce` via Chrome DevTools Protocol.

- Element is revealed (content always accessible — WCAG 1.3.1)
- `animated` class NOT added
- `fadeIn` class NOT added
- `inert` attribute removed (element reachable by keyboard)

### 06 — Edit mode (`06-edit-mode.cy.ts`)

Visits the page via the Jahia edit frame URL (authenticated).

- Wrapper div exists (content visible in editor)
- No `animate.min.css` link tag (CSS not injected in edit mode)
- No `inert` attribute (editor must be able to interact with content)
- Opacity not `0` (always fully visible in editor)
- No `animated` class (IntersectionObserver script not injected)

### 07 — Accessibility (`07-accessibility.cy.ts`)

WCAG 2.1 AA compliance checks.

**Initial hidden state** (IntersectionObserver stubbed — never fires):
- Wrapper has `inert` attribute (SC 1.3.1 — keyboard focus suppressed)
- Wrapper has `aria-hidden="true"` (SC 1.3.1 — hidden from AT)
- Wrapper has `visibility: hidden` (SC 1.3.1)

**Revealed state:**
- `inert` absent after reveal
- `aria-hidden` absent after reveal
- Element is visible and keyboard-reachable (SC 2.1.1)

**Pause button (WCAG 2.2.2 — Pause, Stop, Hide):**
- Button is a native `<button>` (keyboard focusable without tabindex)
- `aria-pressed` attribute present (SC 4.1.2 — Name, Role, Value)
- Button label matches `pause|resume` (SC 2.4.6 — Headings and Labels)

**Exit animation (WCAG 2.4.3 — Focus Order):**
- `aria-hidden="true"` set after `animationend` fires on a `fadeOut` animation
- `display: none` set after `animationend` (element removed from layout)

### 99 — Teardown (`99-teardown.cy.ts`)

Deletes the `animatetest` site.

---

## How caching works

Jahia caches rendered HTML per page. After mutating JCR content (add mixin, set
properties) and publishing, the cache for that page is not always invalidated
automatically — especially for mutations on ancestor nodes.

`flushHtmlCache()` flushes all Ehcache instances used by Jahia's HTML render
cache. Call it after `publishNode()` whenever a test changes animation
properties on an existing node and needs the live page to reflect the change.

---

## License

MIT — see [LICENSE.txt](../LICENSE.txt) at the root of the repository.
