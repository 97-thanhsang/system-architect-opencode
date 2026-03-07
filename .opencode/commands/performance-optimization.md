---
description: "Analyze and optimize Angular application performance — bundle size, change detection, lazy loading, and Core Web Vitals"
argument-hint: "<component or feature to optimize> [--focus bundle|change-detection|lazy-loading|core-web-vitals|all]"
---

# Angular Performance Optimization

## CRITICAL BEHAVIORAL RULES

1. **Execute steps in order.** Do NOT skip ahead, reorder, or merge steps.
2. **Write output files.** Each step MUST produce its output file in `.performance-optimization/` before the next step begins.
3. **Stop at checkpoints.** When you reach a `PHASE CHECKPOINT`, stop and wait for explicit user approval.
4. **Halt on failure.** If any step fails, STOP immediately and ask the user how to proceed.
5. **Angular 17+ only.** Focus exclusively on Angular frontend — no backend, no database, no mobile.

## Pre-flight Checks

### 1. Check for existing session

Check if `.performance-optimization/state.json` exists:

- If it exists and `status` is `"in_progress"`: Read it, display the current step, and ask the user:

  ```
  Found an in-progress performance optimization session:
  Target: [name from state]
  Current step: [step from state]

  1. Resume from where we left off
  2. Start fresh (archives existing session)
  ```

- If it exists and `status` is `"complete"`: Ask whether to archive and start fresh.

### 2. Initialize state

Create `.performance-optimization/` directory and `state.json`:

```json
{
  "target": "$ARGUMENTS",
  "status": "in_progress",
  "focus": "all",
  "current_step": 1,
  "current_phase": 1,
  "completed_steps": [],
  "files_created": [],
  "started_at": "ISO_TIMESTAMP",
  "last_updated": "ISO_TIMESTAMP"
}
```

Parse `$ARGUMENTS` for `--focus` flag. Use `"all"` as default.

### 3. Parse target

Extract the target description from `$ARGUMENTS` (everything before the flags). This is referenced as `$TARGET` below.

---

## Phase 1: Bundle Analysis & Baseline (Steps 1–2)

### Step 1: Bundle Size Analysis

Analyze the Angular application bundle and establish baseline metrics.

**Actions to perform:**

1. Check `angular.json` for build configuration (optimization flags, budgets, lazy chunks)
2. Look for `webpack-bundle-analyzer` or `source-map-explorer` in `package.json`
3. Scan `src/app/` for:
   - Barrel files (`index.ts`) that may cause over-bundling
   - Large third-party imports (check imports in `*.ts` files)
   - Non-lazy-loaded routes (look for `loadComponent` vs `component` in routing files)
   - `CommonModule` imported in standalone components (should use specific imports)
4. Check `tsconfig.json` for `paths` aliases that may indicate large shared modules
5. Look for `@NgModule` declarations that bundle everything eagerly

**Produce a report covering:**
- Estimated bundle issues found (list files and patterns)
- Routes that are NOT lazy-loaded
- Heavy imports that could be tree-shaken
- Recommendations for `ng build --stats-json` + webpack-bundle-analyzer
- Angular budget thresholds in `angular.json` (current vs recommended)

Save to `.performance-optimization/01-bundle-analysis.md`.

Update `state.json`: set `current_step` to 2.

---

### Step 2: Change Detection Audit

Audit change detection strategy across the application.

**Actions to perform:**

1. Scan all `@Component` decorators in `src/app/`:
   - Count components using default `ChangeDetectionStrategy.Default` vs `OnPush`
   - Find components that would benefit from `OnPush` (presentational/dumb components)
2. Look for `ngDoCheck`, `ngOnChanges` implementations — are they optimized?
3. Find uses of `async` pipe vs manual subscriptions with `subscribe()`:
   - Manual subscriptions that forget to unsubscribe (missing `takeUntilDestroyed`, `ngOnDestroy`)
   - Places where `async` pipe would be better
4. Scan for `*ngFor` without `trackBy` (in Angular 17+: `@for` without `track`)
5. Look for expensive computations in component templates (method calls, getters without memoization)
6. Find `BehaviorSubject` / `Subject` usage — are they used in templates via `async` pipe?
7. Check for signal usage (`signal()`, `computed()`) — Angular 17+ preferred pattern

**Produce a report covering:**
- List of components with `Default` CD that should use `OnPush`
- Untracked `ngFor` / `@for` loops
- Problematic subscriptions (missing cleanup)
- Template expressions with side effects or heavy computation
- Opportunities to replace with Angular signals

Save to `.performance-optimization/02-change-detection-audit.md`.

Update `state.json`: set `current_step` to "checkpoint-1".

---

## PHASE CHECKPOINT 1 — User Approval Required

You MUST stop here and present the analysis for review.

Display a summary from steps 1 and 2 and ask:

```
Angular performance analysis complete. Please review:
- .performance-optimization/01-bundle-analysis.md
- .performance-optimization/02-change-detection-audit.md

Key findings:
- Bundle issues: [summary]
- Change detection issues: [summary]

1. Approve — proceed to optimization implementation
2. Request changes — tell me what to adjust
3. Pause — save progress and stop here
```

Do NOT proceed to Phase 2 until the user selects option 1.

---

## Phase 2: Lazy Loading & Code Splitting (Step 3)

### Step 3: Lazy Loading Implementation Plan

Read `.performance-optimization/01-bundle-analysis.md`.

**Actions to perform:**

1. Identify all routes in routing files (`app.routes.ts`, feature route files):
   - List routes using static `component:` (eager) that should use `loadComponent:`
   - List feature modules using `loadChildren:` — verify they're correctly lazy
2. Check for `@defer` block usage in templates (Angular 17+ deferred loading):
   - Heavy components that render below the fold (good candidates for `@defer`)
   - Components that only appear on user interaction (use `@defer (on interaction)`)
3. Identify large Angular Material components imported globally vs locally
4. Check `app.config.ts` / `app.module.ts` for providers that should be lazy

**Produce an implementation plan covering:**
- Exact route changes needed (`component:` → `loadComponent:` with import paths)
- `@defer` block opportunities with suggested triggers (`on idle`, `on viewport`, `on interaction`)
- Material components to move from global imports to component-level imports
- Expected bundle size reduction per change

Save to `.performance-optimization/03-lazy-loading-plan.md`.

Update `state.json`: set `current_step` to 4.

---

## Phase 2 continued: Change Detection Fixes (Step 4)

### Step 4: OnPush & Signal Migration Plan

Read `.performance-optimization/02-change-detection-audit.md`.

**Actions to perform:**

1. For each component identified as needing `OnPush`:
   - Check if it uses mutable object mutations (which break OnPush)
   - Verify inputs are passed as new object references, not mutated
   - Note if `ChangeDetectorRef.markForCheck()` will be needed
2. For `*ngFor` / `@for` without tracking:
   - Suggest `trackBy` function or `track item.id` syntax
3. For manual subscriptions missing cleanup:
   - Suggest `takeUntilDestroyed()` (Angular 16+) or `DestroyRef`
4. For template method calls / expensive expressions:
   - Suggest moving to `computed()` signals or `memo` pattern
5. Identify 2-3 components best suited for signal migration as a starting point

**Produce a migration plan covering:**
- Step-by-step OnPush adoption order (start with leaf/presentational components)
- Code snippets for each fix (before/after)
- Signal migration examples for priority components
- Risk assessment (which changes are safe vs risky)

Save to `.performance-optimization/04-cd-optimization-plan.md`.

Update `state.json`: set `current_step` to "checkpoint-2".

---

## PHASE CHECKPOINT 2 — User Approval Required

Display a summary from steps 3 and 4 and ask:

```
Optimization plans ready. Please review:
- .performance-optimization/03-lazy-loading-plan.md
- .performance-optimization/04-cd-optimization-plan.md

1. Approve — proceed to Core Web Vitals & runtime optimizations
2. Request changes — tell me what to adjust
3. Pause — save progress and stop here
```

Do NOT proceed to Phase 3 until the user approves.

---

## Phase 3: Core Web Vitals & Runtime (Steps 5–6)

### Step 5: Core Web Vitals Assessment

Read `.performance-optimization/01-bundle-analysis.md` and `.performance-optimization/03-lazy-loading-plan.md`.

**Actions to perform:**

1. Scan `index.html` and `app.component.html` for:
   - Images missing `width`/`height` attributes (causes CLS)
   - Images missing `loading="lazy"` for below-the-fold images
   - Missing `<link rel="preconnect">` for Jira API domain
   - Large inline scripts or render-blocking resources
2. Check `angular.json` for `NgOptimizedImage` directive usage
3. Check for Angular SSR / prerendering config (affects LCP)
4. Look for large Angular Material theme imports:
   - Is the full theme imported or just what's needed?
   - Is the theme using M3 or older M2?
5. Check font loading strategy (`@font-face` vs Google Fonts link)
6. Look for animation-heavy components (check `@angular/animations` usage) that may affect CLS

**Produce a report covering:**
- LCP optimization opportunities (largest contentful element, preloading)
- CLS fixes needed (image dimensions, layout shift sources)
- FID/INP improvements (input delay, animation performance)
- Concrete changes for `index.html` and `angular.json`

Save to `.performance-optimization/05-core-web-vitals.md`.

Update `state.json`: set `current_step` to 6.

---

### Step 6: Runtime Performance & HTTP Caching

Read `.performance-optimization/01-bundle-analysis.md` and `.performance-optimization/02-change-detection-audit.md`.

**Actions to perform:**

1. Scan HTTP service files for Jira API calls:
   - Are responses cached? (check for `shareReplay`, custom cache service, or HTTP cache headers)
   - Are there repeated calls to the same endpoints? (candidate for caching)
   - Are `switchMap`/`exhaustMap`/`debounceTime` used for search inputs?
2. Check for `Virtual Scrolling` from `@angular/cdk/scrolling`:
   - Any long lists (`ngFor` / `@for`) over ~50 items that aren't virtualized?
3. Check for `@angular/platform-browser` `DomSanitizer` usage — unnecessary calls?
4. Look for `setTimeout` / `setInterval` in components (should use `NgZone.runOutsideAngular`)
5. Check for heavy pipes that are not `pure: true` (default is pure — check for `pure: false`)

**Produce a report covering:**
- HTTP caching strategy for Jira API responses
- Virtual scrolling candidates
- `runOutsideAngular` opportunities
- Any impure pipe issues

Save to `.performance-optimization/06-runtime-optimizations.md`.

Update `state.json`: set `current_step` to "checkpoint-3".

---

## PHASE CHECKPOINT 3 — User Approval Required

Display a summary from steps 5–6 and ask:

```
Core Web Vitals & runtime analysis complete. Please review:
- .performance-optimization/05-core-web-vitals.md
- .performance-optimization/06-runtime-optimizations.md

1. Approve — proceed to final implementation summary
2. Request changes — tell me what to adjust
3. Pause — save progress and stop here
```

Do NOT proceed to Phase 4 until the user approves.

---

## Phase 4: Implementation Summary (Step 7)

### Step 7: Prioritized Action Plan

Read ALL previous `.performance-optimization/*.md` files.

Produce a prioritized, actionable implementation plan that a developer can follow step by step.

**Structure the plan as:**

```markdown
# Angular Performance Optimization — Action Plan

## Quick Wins (< 1 hour each)
[List highest-impact, lowest-effort changes]

## Medium Effort (1–4 hours each)
[List changes with good ROI but requiring more work]

## Long-term Improvements (1+ day each)
[Signal migration, full lazy loading refactor, etc.]

## Measurement
- How to run: `ng build --stats-json && npx webpack-bundle-analyzer dist/stats.json`
- How to measure CWV: Chrome DevTools Lighthouse, PageSpeed Insights
- How to profile CD: Angular DevTools browser extension
- Performance budgets to set in `angular.json`
```

Save to `.performance-optimization/07-action-plan.md`.

Update `state.json`: set `current_step` to "complete", set `status` to `"complete"`.

---

## Completion

Present the final summary:

```
Angular performance optimization analysis complete for: $TARGET

## Output Files
- .performance-optimization/01-bundle-analysis.md
- .performance-optimization/02-change-detection-audit.md
- .performance-optimization/03-lazy-loading-plan.md
- .performance-optimization/04-cd-optimization-plan.md
- .performance-optimization/05-core-web-vitals.md
- .performance-optimization/06-runtime-optimizations.md
- .performance-optimization/07-action-plan.md

## Success Targets
- Initial bundle (main.js): < 500KB (gzipped < 150KB)
- Lazy chunk load time: < 200ms on fast 3G
- Core Web Vitals: LCP < 2.5s, CLS < 0.1, INP < 200ms
- Angular DevTools shows 0 unnecessary change detection cycles on stable view
- All lists > 50 items use virtual scrolling or @defer

## Next Steps
1. Follow the Quick Wins in 07-action-plan.md first
2. Run `ng build --stats-json` before and after to measure bundle impact
3. Use Angular DevTools to verify OnPush reduces CD cycles
4. Run Lighthouse in Chrome to track Core Web Vitals
```
