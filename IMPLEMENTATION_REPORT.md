# JOBTI MVP Implementation Report

Date: 2026-09-15

Status: DONE_WITH_CONCERNS

## Delivered

- Next.js App Router + TypeScript + React + Tailwind CSS + Zod + Vitest + Playwright + html-to-image project scaffold.
- Mobile-first home page with the “秋招档案袋 × HR 系统 × 人格鉴定报告” visual system.
- Q0 current progress, start-month question, and 30 real four-choice autumn-recruitment questions.
- One-question-per-screen flow, immediate advance, back/edit, dual `sessionStorage`/`localStorage` resume, and four conditional mid-quiz feedback moments.
- Pure deterministic scoring pipeline: per-dimension 0–100 normalization, hard gates, 70% vector similarity + 30% tag match + bonus, main personality selection, cross-family secondary personality selection, and configured/fallback combination titles.
- Complete 24-personality default data layer with target vectors, weights, tag profiles, gates, bonuses, and report copy.
- Settlement animation and reveal gate before the complete report.
- Report sections for portrait, top attributes, symptoms, catchphrase, strengths, weakness, enemy, diagnosis, secondary personality, combination title, match wording, and share actions.
- DOM-based fixed 1080×1920 poster generation with `html-to-image`, download, copy text (clipboard + fallback), and reset. QR is explicitly a non-scannable `QR PLACEHOLDER` visual.
- README documents the default data-layer assumption and replacement boundary.

## TDD evidence

The first test run happened before the scoring modules existed and failed during module resolution (5 failed suites, 0 tests collected). The minimal implementation was then written against those tests. Current core checks are green.

## Fresh verification evidence

### Unit tests

Command: `npm test`

Result: 8 test files passed, 19 tests passed.

Coverage includes:

- normalization and zero-division/clamping behavior;
- dimension/tag hard gates;
- weighted vector + tag + bonus scoring;
- ineligible gate behavior;
- all 24 personalities being hit by deterministic fixtures;
- cross-family secondary personality and combination-title fallback;
- question count, four-choice shape, 0–3 increments, and normalized complete answers;
- versioned storage round-trip and malformed-storage recovery.

### Typecheck

Command: `npx tsc --noEmit`

Result: exit 0, no output.

### Lint

Command: `npm run lint`

Result: `✔ No ESLint warnings or errors`.

### Production build

Command: `npm run build`

Result: exit 0. `/`, `/quiz`, and `/result` compiled and prerendered successfully. Next emitted non-blocking webpack cache snapshot warnings; they do not fail the build.

### Playwright smoke/e2e

Command: `npm run test:e2e`

Result: 7 tests passed on the `mobile-chromium` project:

- home → Q0 → start month → all 30 questions → settlement → reveal → report;
- partial answers survive reload;
- the smoke path also verifies no horizontal overflow and a real poster download filename;
- round 1 regressions verify CTA contrast, real PNG pixels/dimensions, desktop CTA
  bounds, keyboard focus, feedback persistence, and legal reveal flow.

The first attempt found that the local Playwright browser revision was absent; `npx playwright install chromium` installed the required Chrome/Headless Shell and the rerun passed.

### Visual check

Fresh Pixel 5 screenshots were inspected for home, Q0 quiz, and long-form result pages. The visual pass confirmed the paper grid, file cards, stamps, warm paper/pine/vermilion palette, readable mobile type, touch-sized answer cards, result hierarchy, and no visible horizontal overflow. The generated screenshot files were moved out of the workspace after inspection.

## Concerns / intentional limits

- The referenced prior scoring table and 24-personality source vectors/copy were not included in the supplied v1.0 spec. `data/questions.ts` and `data/personalities.ts` are therefore explicitly labeled and documented as deterministic v1.0 default implementations; replacing those files does not require algorithm/UI changes.
- Next dev/e2e emits a non-blocking cross-origin warning for `127.0.0.1` assets under Next 14; production build is clean apart from cache snapshot warnings.
- No real QR destination is encoded by design, per the product requirement against fabricating an unknown-domain QR.
- No analytics endpoint was added because the MVP remains anonymous and has no backend data/API dependency; only the home shell is request-rendered to make its first preview hydration-safe.

No git commit or push was performed.

## Round 1 acceptance fixes (2026-09-15)

The authoritative `ACCEPTANCE_REPORT.md` identified eight findings. Each was
first represented by a regression test and run against the old implementation.
The intentional red evidence was:

- unit tests could not import the missing feedback/preview modules; storage
  feedback fields were absent; the legal POOL path resolved to SAFE; and an
  unconfigured pair still used the static `POOL × NOTE` title;
- the first round e2e run measured transparent home/save CTAs, a one-color
  poster, a desktop CTA bottom at `958.0625px` (past the 900px viewport), and
  focus remaining on the answer button instead of the next question heading.

Fixes and green evidence:

1. Vermilion is now one `vermilion` token in Tailwind, CSS variables, and all
   components. The CTA regression reads computed home and result button styles
   (`rgb(200, 81, 54)` background and paper text).
2. `posterToPng` clones the DOM into a visible, fixed 1080×1920 export frame,
   waits one animation frame/fonts, and removes the clone in `finally`. E2E
   reads the downloaded PNG itself: exact `1080×1920`, more than ten colors,
   and more than 10,000 non-paper pixels.
3. Legal question options now source `POOLING` (including the waiting/no-pipeline
   choices). `tests/answer-fixtures.ts` contains complete Q0 + Q-Start + 30
   option maps for all 24 personalities; the coverage test calls
   `aggregateAnswers` and the real resolver, including GAPY and RTRY.
4. Unconfigured combinations render `${primary.code} × ${secondary.code}`;
   HUMN retains `已脱离秋招物种`. Both fallback and special cases are tested.
5. Each new quiz state receives a deterministic-seedable Fisher–Yates schedule
   of four unique milestones between answers 5 and 29. The schedule and shown
   set are persisted, normalized on restore, and marking is idempotent. E2E
   covers back-navigation, completion, reload, and resume without drift or
   duplicate feedback.
6. The next question heading is focusable with `tabIndex=-1`, `aria-live`, and
   a ref focused after every step. Keyboard E2E verifies Enter → advance,
   heading focus, and the next Tab/Enter action.
7. Desktop hero type scale and section spacing were tightened at `lg`; bounding
   box E2E verifies the CTA bottom is inside both 1440×900 and 1366×768.
8. Home preview order is randomly shuffled once per mount, cycles through three
   distinct codes, and is restricted to POOL/KING/HUMN. Pure preview tests cover
   the permutation and distinct seeded first cards.

Round 1 verification commands:

```text
npm test                 → 8 files / 19 tests passed
npm run lint             → no ESLint warnings or errors
npx tsc --noEmit         → exit 0
npm run build            → exit 0 (only Next webpack cache warnings)
npm run test:e2e         → 7 tests passed (mobile-chromium)
```

The browser pass rechecked 1440px desktop and Pixel 5/mobile home, quiz, and
revealed-result layouts. The downloaded poster was opened and visually
confirmed as a populated paper report with readable type, colored sections,
bars, combination title, diagnosis, and the explicit non-scannable QR
placeholder. Temporary coverage solver scripts and the stale dev build cache
were removed from the deliverable; no dev server remains running.

## Round 2 acceptance fix (2026-09-15)

The Round 2 report isolated the last P3: the first server-rendered home card
was always POOL, with randomization only replacing it after hydration. TDD
evidence was added before the fix in `tests/e2e/round2.spec.ts`; against the
old implementation, twelve fresh HTML requests all exposed POOL and the test
failed its `seen.size > 1` assertion.

The fix makes the home route request-dynamic and generates one shuffled
`POOL/KING/HUMN` order on the server. That order is passed as a serialized
`initialOrder` prop to `HomeHero`, so the first visible HTML and the hydrated
client render are identical. The client only advances the already-random
permutation every three seconds; it no longer swaps a fixed POOL card in an
effect. This avoids both hydration mismatch and layout/content flash while
preserving the three-code allow-list and no-immediate-repeat rotation.

Round 2 regression evidence:

```text
npm run test:e2e -- tests/e2e/round2.spec.ts  → 2 passed
npm test                                      → 8 files / 19 tests passed
npm run lint                                  → no ESLint warnings or errors
npx tsc --noEmit                              → exit 0
npm run build                                 → exit 0 (only webpack cache warnings)
npm run test:e2e                              → 9 tests passed
```

The full browser run was completed after the fix, and the dev server started
by Playwright was stopped. No other scope was changed and no git commit or
push was made.

## Round 3 homepage-start fix (2026-09-15)

The user-reported regression was reproduced with a red E2E before changing
production code: injecting a complete quiz state, returning to `/`, and
clicking the CTA ended at `/result` instead of Q0. The companion incomplete
state test stayed on `/quiz` at the first unanswered question, confirming that
resume behavior itself was intact.

The minimal fix adds `clearCompletedQuizState()` in the storage layer and calls
it only from the homepage “开始秋招精神鉴定” link. A completed record clears
from both `localStorage` and `sessionStorage` before navigation, so QuizFlow
starts a fresh Q0. An incomplete record is left untouched and still resumes at
its first unanswered item. Direct `/result` access and the existing incomplete
record guard are unchanged.

Round 3 regression evidence:

```text
npm run test:e2e -- tests/e2e/round3.spec.ts  → 2 passed
```

The complete and incomplete homepage-start paths both pass after the fix; the
full verification commands below were then rerun with no dev server left
running.

Round 3 final verification:

```text
npm test                 → 8 files / 19 tests passed
npm run lint             → no ESLint warnings or errors
npx tsc --noEmit         → exit 0
npm run build            → exit 0 (only webpack cache warnings)
npm run test:e2e         → 11 tests passed
```

The e2e run includes the two new homepage-start regressions plus all prior
smoke and round 1/2 coverage. No git commit or push was performed.

## Round 4 state-consistency fix (2026-09-15)

Round 4 first added regression tests before changing production code. Against
the previous implementation, the new storage tests failed because
`isQuizComplete` did not exist and `readQuizState()` kept the older
`sessionStorage` record. The new browser tests also failed in both target
paths: opening `/quiz?start=1` in a new tab redirected a completed record to
`/result`, and a partial `complete=true` record reached the result flow
instead of showing `档案未完成`.

The fix centralizes semantic completion in `lib/storage.ts`: q0, start, and
all q01–q30 answers must exist with legal option ids and `complete` must be
true. `QuizFlow`, the homepage completed-state helper, and `ResultView` all
use that same check. The CTA now carries `/quiz?start=1`; QuizFlow consumes
the intent on the destination page, atomically clears and recreates a valid
completed record, cleans the query, and keeps incomplete records for resume.
Invalid completed records are normalized to `complete=false` and resume at
the first missing or illegal answer. `readQuizState()` now chooses the
newest parseable local/session record by `updatedAt`. ResultView initially
uses a neutral “正在读取候选档案…” state so malformed records do not flash a
generation/reveal screen before validation.

Round 4 red/green evidence:

```text
npm test -- tests/storage.test.ts                    → old code: 2 failed; fixed: 5 passed
npm run test:e2e -- tests/e2e/round4.spec.ts         → old code: 2 failed; fixed: 2 passed
npm test                                             → 8 files / 21 tests passed
npm run lint                                         → no ESLint warnings or errors
npx tsc --noEmit                                    → exit 0
npm run build                                        → exit 0 (only webpack cache warnings)
npm run test:e2e                                     → 13 tests passed (mobile-chromium)
```

The new E2E covers a direct start-intent URL in a newly opened tab (the
middle-click/new-tab bypass class), preservation of an incomplete record, and
both missing-answer and illegal-option `complete=true` records being denied
Reveal. The full browser run completed with no remaining Next dev server, and
no git commit or push was made.

## Round 6 personality image integration (2026-09-15)

### Scope and source handling

The user supplied 24 original PNGs in `/Users/yu/Desktop/jobti-photo/`. They were treated as read-only source files and were not moved, renamed, edited, or linked from the app. For web delivery, each source was converted to a same-pixel-dimension JPEG with `sips` at approximately quality 88. The 24 local files live in `public/personalities/` and are not external URLs.

Original-to-code mapping:

| Code | Source filename | Web asset |
| --- | --- | --- |
| POOL | `ChatGPT Image 2026年9月15日 20_43_46 (1).png` | `/personalities/pool.jpg` |
| MALO | `ChatGPT Image 2026年9月15日 20_43_46 (2).png` | `/personalities/malo.jpg` |
| HITO | `ChatGPT Image 2026年9月15日 20_43_47 (3).png` | `/personalities/hito.jpg` |
| COMP | `ChatGPT Image 2026年9月15日 20_43_48 (4).png` | `/personalities/comp.jpg` |
| KING | `ChatGPT Image 2026年9月15日 20_43_49 (5).png` | `/personalities/king.jpg` |
| HUMN | `ChatGPT Image 2026年9月15日 20_43_50 (6).png` | `/personalities/humn.jpg` |
| PEND | `ChatGPT Image 2026年9月15日 20_43_59 (1).png` | `/personalities/pend.jpg` |
| OCER | `ChatGPT Image 2026年9月15日 20_43_59 (2).png` | `/personalities/ocer.jpg` |
| SAFE | `ChatGPT Image 2026年9月15日 20_43_59 (3).png` | `/personalities/safe.jpg` |
| LOVE | `ChatGPT Image 2026年9月15日 20_44_00 (4).png` | `/personalities/love.jpg` |
| WISH | `ChatGPT Image 2026年9月15日 20_44_01 (5).png` | `/personalities/wish.jpg` |
| GAPY | `ChatGPT Image 2026年9月15日 20_44_02 (6).png` | `/personalities/gapy.jpg` |
| NOTE | `ChatGPT Image 2026年9月15日 20_44_03 (7).png` | `/personalities/note.jpg` |
| EXAM | `ChatGPT Image 2026年9月15日 20_44_04 (8).png` | `/personalities/exam.jpg` |
| WAIT | `ChatGPT Image 2026年9月15日 20_44_05 (9).png` | `/personalities/wait.jpg` |
| CALM | `ChatGPT Image 2026年9月15日 20_44_06 (10).png` | `/personalities/calm.jpg` |
| REFR | `ChatGPT Image 2026年9月15日 20_44_14 (1).png` | `/personalities/refr.jpg` |
| LATE | `ChatGPT Image 2026年9月15日 20_44_14 (2).png` | `/personalities/late.jpg` |
| RTRY | `ChatGPT Image 2026年9月15日 20_44_15 (3).png` | `/personalities/rtry.jpg` |
| FLEX | `ChatGPT Image 2026年9月15日 20_44_16 (4).png` | `/personalities/flex.jpg` |
| JUMP | `ChatGPT Image 2026年9月15日 20_44_16 (5).png` | `/personalities/jump.jpg` |
| HOLD | `ChatGPT Image 2026年9月15日 20_44_17 (6).png` | `/personalities/hold.jpg` |
| BARG | `ChatGPT Image 2026年9月15日 20_44_18 (7).png` | `/personalities/barg.jpg` |
| SPIN | `ChatGPT Image 2026年9月15日 20_44_19 (8).png` | `/personalities/spin.jpg` |

`lib/personality-images.ts` is the single typed manifest. It exposes the 24-code tuple, a one-to-one map, and a throwing lookup for unknown codes; tests also verify all mapped files exist, have unique lowercase names, and match the 24 personality records. A missing asset therefore fails the asset unit suite instead of silently falling back to a different personality.

### UI and poster integration

- `HomeHero` uses the manifest for the `POOL / KING / HUMN` server-seeded preview rotation. The first visible image is prioritized, has explicit dimensions/alt text, and uses a stable aspect-ratio frame so the CTA and SSR/hydration layout do not jump.
- `ResultView` puts the primary image before the code/name on mobile and beside them on desktop; the secondary personality gets a smaller local image in its own panel. Both use the same centered cover treatment.
- `SharePoster` places the primary image beside the detected code/name and keeps the required rarity, score, three attributes, secondary personality, combination title, diagnosis, and QR placeholder. `posterToPng` now waits for every cloned image to load and decode, as well as fonts, before invoking `html-to-image`.

### TDD evidence

Before implementation, `tests/personality-images.test.ts` failed during collection because the mapping module did not exist. `tests/e2e/round5-images.spec.ts` then failed on the old UI because the preview/result/poster image selectors were absent. After the manifest, assets, UI, and decode wait were added:

```text
npm test -- tests/personality-images.test.ts  → 2/2 passed
npm run test:e2e -- tests/e2e/round5-images.spec.ts → 3/3 passed
npx tsc --noEmit                              → exit 0
npm run lint                                  → no warnings/errors
```

The image-specific browser suite confirms matching preview `src`/`alt`, loaded primary and secondary result pixels (`naturalWidth > 0`), and downloaded poster dimensions of exactly 1080×1920 with a non-flat pixel palette.

### Compression accounting

| Set | Total |
| --- | ---: |
| Original PNG source set | approximately 40 MB |
| JPEG delivery set | approximately 9.6 MB |
| Reduction | approximately 76% |

`file` verification confirmed the portrait assets remain 1122×1402 or 1106×1422, and the square assets remain 1254×1254; no source aspect ratios were changed.

### Public preview hosting

The current source was deployed as a public Vercel temporary preview after the image integration. The homepage and all 24 personality JPEG endpoints returned HTTP 200 in the online smoke check, and the result page loaded the primary and secondary assets in a real browser.

Preview URL: <https://temporary-nimble-hawthorn-4ziv4te.vercel.app>

Vercel marks this anonymous preview as expiring after approximately 60 minutes. It can be kept permanently by opening the claim URL printed by the deployment and signing in; a production deployment or custom domain should be used for the final launch.
