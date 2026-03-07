---
description: "Audit and harden Angular application security — XSS prevention, CSP, Jira OAuth PKCE, dependency vulnerabilities, and secure coding patterns"
argument-hint: "<target description> [--depth quick|standard|comprehensive]"
---

# Angular Security Hardening

## CRITICAL BEHAVIORAL RULES

1. **Execute steps in order.** Do NOT skip ahead, reorder, or merge steps.
2. **Write output files.** Each step MUST produce its output file in `.security-hardening/` before the next step begins.
3. **Stop at checkpoints.** When you reach a `PHASE CHECKPOINT`, stop and wait for explicit user approval.
4. **Halt on failure.** If any step fails, STOP immediately and ask the user how to proceed.
5. **Angular frontend-only.** This command covers Angular SPA security only — no backend, no SIEM, no mobile, no compliance audits (SOC2/HIPAA/PCI).

## Pre-flight Checks

### 1. Check for existing session

Check if `.security-hardening/state.json` exists:

- If it exists and `status` is `"in_progress"`: Read it, display the current step, and ask:

  ```
  Found an in-progress security hardening session:
  Target: [target from state]
  Current step: [step from state]

  1. Resume from where we left off
  2. Start fresh (archives existing session)
  ```

- If it exists and `status` is `"complete"`: Ask whether to archive and start fresh.

### 2. Initialize state

Create `.security-hardening/` directory and `state.json`:

```json
{
  "target": "$ARGUMENTS",
  "status": "in_progress",
  "depth": "standard",
  "current_step": 1,
  "current_phase": 1,
  "completed_steps": [],
  "files_created": [],
  "started_at": "ISO_TIMESTAMP",
  "last_updated": "ISO_TIMESTAMP"
}
```

Parse `$ARGUMENTS` for `--depth` flag. Default is `"standard"`.

### 3. Parse target

Extract the target description from `$ARGUMENTS`. Referenced as `$TARGET` below.

---

## Phase 1: Vulnerability Assessment (Steps 1–2)

### Step 1: Dependency & Secrets Audit

Audit third-party dependencies and scan for exposed secrets.

**Actions to perform:**

1. Read `package.json` and `package-lock.json` (or `yarn.lock`) for:
   - Outdated Angular packages (`@angular/*`, `@angular/material`, `rxjs`, `zone.js`)
   - Third-party packages with known CVEs (flag packages not updated in 12+ months)
   - Packages that handle sensitive data (JWT, crypto, auth)
2. Scan the codebase for hardcoded secrets:
   - Look for patterns: `apiKey`, `clientSecret`, `password`, `token`, `secret` in `*.ts` files
   - Look for Jira credentials or OAuth secrets in `environment.ts` / `environment.prod.ts`
   - Check `.env` files committed to the repo
   - Check `angular.json` for sensitive values in `fileReplacements`
3. Check `.gitignore` for proper exclusion of:
   - `environment.prod.ts` (if it contains secrets)
   - `.env*` files
   - `dist/`, `node_modules/`
4. Look for use of `eval()`, `Function()`, `innerHTML` assignment, `document.write()` in TypeScript files

**Produce a report covering:**
- Dependency vulnerabilities found (package name, version, risk level)
- Hardcoded secrets found (file path, line, recommendation)
- `.gitignore` gaps
- Dangerous JavaScript patterns found

Save to `.security-hardening/01-dependency-secrets-audit.md`.

Update `state.json`: set `current_step` to 2.

---

### Step 2: Angular XSS & Injection Vulnerability Scan

Scan for Angular-specific XSS and injection vulnerabilities.

**Actions to perform:**

1. Search for `DomSanitizer` bypass methods:
   - `bypassSecurityTrustHtml()`
   - `bypassSecurityTrustScript()`
   - `bypassSecurityTrustUrl()`
   - `bypassSecurityTrustResourceUrl()`
   - `bypassSecurityTrustStyle()`
   → For each occurrence: note the file, line, and whether the input is user-controlled
2. Search for unsafe DOM manipulation:
   - Direct `innerHTML` or `outerHTML` assignment in components/directives
   - `Renderer2.setProperty(el, 'innerHTML', ...)`
   - `ElementRef.nativeElement.innerHTML`
3. Search for unsafe URL patterns:
   - `[href]` or `[src]` bound to unsanitized user input
   - `window.location.href = userInput`
   - `router.navigateByUrl(userInput)` without validation
4. Check template interpolation safety:
   - `{{ userInput | safeHtml }}` (non-standard pipe bypassing Angular sanitization)
   - Direct `[innerHTML]` bindings
5. Check for open redirect vulnerabilities in routing:
   - `queryParams` used directly as redirect URLs
   - Missing validation of `returnUrl` parameter in Jira OAuth callback

**Produce a report covering:**
- All `bypassSecurityTrust*` usages with risk assessment
- Unsafe DOM manipulation patterns found
- URL injection points
- Open redirect risks in OAuth flow

Save to `.security-hardening/02-xss-injection-scan.md`.

Update `state.json`: set `current_step` to "checkpoint-1".

---

## PHASE CHECKPOINT 1 — User Approval Required

You MUST stop here and present the assessment results.

Display a summary from steps 1 and 2 and ask:

```
Security assessment complete for: $TARGET

- .security-hardening/01-dependency-secrets-audit.md
- .security-hardening/02-xss-injection-scan.md

Critical findings:
- Hardcoded secrets: [count]
- XSS vulnerabilities: [count]
- Dependency issues: [count]

1. Approve — proceed to remediation
2. Request changes — tell me what to adjust
3. Pause — save progress and stop here
```

Do NOT proceed to Phase 2 until the user selects option 1.

---

## Phase 2: Security Hardening (Steps 3–5)

### Step 3: Jira OAuth 2.0 (PKCE) Security Review

Read `.security-hardening/01-dependency-secrets-audit.md`.

**Actions to perform:**

1. Find the OAuth/auth implementation files (look for `auth.service.ts`, `jira-auth.service.ts`, or similar)
2. Review the OAuth PKCE flow:
   - Is `code_verifier` generated with sufficient entropy? (`crypto.getRandomValues()` or similar)
   - Is `code_challenge` derived using SHA-256? (not plain)
   - Is `state` parameter used to prevent CSRF? Is it validated on callback?
   - Is `code_verifier` stored in `sessionStorage` (not `localStorage`)?
3. Review token storage:
   - Is the access token stored in `localStorage`? (Risk: XSS can steal it)
   - Is it stored in `sessionStorage`? (Better, but still XSS vulnerable)
   - Is there an in-memory token store? (Most secure for SPAs)
   - Is token refresh handled without exposing the refresh token to JavaScript?
4. Review token usage:
   - Are Authorization headers set via `HttpInterceptor`?
   - Is the interceptor excluding non-Jira domains?
   - Is there token expiry handling?
5. Review the OAuth callback route:
   - Is it protected against open redirects?
   - Is the `state` parameter validated before processing the code?
   - Are error states from Jira OAuth handled securely?

**Produce a report covering:**
- PKCE implementation quality (pass/fail per check)
- Token storage risks and recommendations
- Recommended code patterns for secure token handling
- Open redirect mitigation for the callback route

Save to `.security-hardening/03-oauth-security-review.md`.

Update `state.json`: set `current_step` to 4.

---

### Step 4: Content Security Policy & HTTP Security Headers

Read `.security-hardening/02-xss-injection-scan.md`.

**Actions to perform:**

1. Check `index.html` for existing `<meta http-equiv="Content-Security-Policy">` tag
2. Check `angular.json` for custom headers configuration
3. Identify all external domains the app communicates with:
   - Jira API domains (`*.atlassian.net`, `*.atlassian.com`)
   - CDN domains (fonts, material icons)
   - Any analytics scripts
4. Check Angular Material icon usage:
   - Is it loading from `fonts.googleapis.com`? (Needs CSP allowance)
   - Are icon fonts or SVG sprites used?
5. Look for inline scripts or styles that would block a strict CSP
6. Check `angular.json` for `"scripts"` array — any third-party scripts?

**Produce a report with recommended security headers for `index.html`:**

```html
<!-- Recommended headers to add (via meta tags or server config) -->

<!-- Content-Security-Policy -->
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self';
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com;
  connect-src 'self' https://*.atlassian.net https://*.atlassian.com;
  img-src 'self' data: https://*.atlassian.net;
  frame-ancestors 'none';
">

<!-- Other security headers -->
<meta http-equiv="X-Content-Type-Options" content="nosniff">
<meta http-equiv="Referrer-Policy" content="strict-origin-when-cross-origin">
```

**Also produce:**
- Explanation of each CSP directive for this app
- What would break with strict CSP (and how to fix)
- `Permissions-Policy` recommendations

Save to `.security-hardening/04-csp-headers.md`.

Update `state.json`: set `current_step` to 5.

---

### Step 5: Angular Secure Coding Fixes

Read `.security-hardening/01-dependency-secrets-audit.md` and `.security-hardening/02-xss-injection-scan.md`.

**For each issue found in Phase 1, produce concrete fixes:**

#### XSS / DomSanitizer Fixes

For each `bypassSecurityTrust*` usage found:
- Assess if the bypass is truly necessary
- If the input is user-controlled: provide an alternative approach that doesn't require bypass
- If unavoidable: provide a sanitization wrapper with input validation

```typescript
// BEFORE (risky)
this.trustedHtml = this.sanitizer.bypassSecurityTrustHtml(userInput);

// AFTER (safer — validate first)
sanitizeUserContent(input: string): SafeHtml {
  // Strip all tags except allowed subset
  const allowed = input.replace(/<(?!\/?(b|i|em|strong|p|br)\b)[^>]*>/gi, '');
  return this.sanitizer.bypassSecurityTrustHtml(allowed);
}
```

#### Secrets Management Fixes

For each hardcoded secret found:
- Move to `environment.ts` (for non-sensitive config) or build-time injection
- For Jira `clientId`: safe to put in environment (public OAuth client IDs are not secret)
- For any actual secrets: recommend environment variable injection at build time via `process.env`

```typescript
// environment.ts
export const environment = {
  production: false,
  jiraClientId: 'YOUR_CLIENT_ID', // ✅ OK — public OAuth client ID
  jiraAuthUrl: 'https://auth.atlassian.com/authorize',
  // ❌ NEVER: jiraClientSecret (PKCE doesn't use it in the browser)
};
```

#### Dependency Updates

List specific `npm install` commands for critical security updates found in Step 1.

Save to `.security-hardening/05-secure-coding-fixes.md`.

Update `state.json`: set `current_step` to "checkpoint-2".

---

## PHASE CHECKPOINT 2 — User Approval Required

Display a summary of hardening work from steps 3–5 and ask:

```
Security hardening plans ready. Please review:
- .security-hardening/03-oauth-security-review.md
- .security-hardening/04-csp-headers.md
- .security-hardening/05-secure-coding-fixes.md

OAuth security: [pass/needs-work]
CSP ready to implement: [yes/needs-adjustments]
Coding fixes: [count] issues to fix

1. Approve — proceed to auth guard & route security
2. Request changes — tell me what to adjust
3. Pause — save progress and stop here
```

Do NOT proceed to Phase 3 until the user approves.

---

## Phase 3: Route Security & Final Validation (Steps 6–7)

### Step 6: Angular Route & Guard Security Audit

Read `.security-hardening/03-oauth-security-review.md`.

**Actions to perform:**

1. Find all route definitions (look for `Routes` array in `*.routes.ts` files):
   - Which routes are protected by `canActivate` guards?
   - Which routes are accessible without authentication?
   - Is the auth guard using the correct redirect after login?
2. Review the auth guard implementation:
   - Does it check token validity (not just token existence)?
   - Does it handle token expiry before the Jira API call?
   - Is the redirect URL stored securely (not exposing sensitive data in URL params)?
3. Check lazy-loaded route security:
   - Do feature route modules have their own `canActivate` guards?
   - Can an unauthenticated user trigger a feature module to load? (not a security issue, but wasteful)
4. Review role-based access control (if applicable):
   - Is there user role checking beyond authentication?
   - Are admin routes (if any) double-protected?
5. Check for any `canDeactivate` guards on forms with sensitive Jira data

**Produce a report covering:**
- Route security matrix (route → guard → protection level)
- Auth guard improvements needed
- Missing guards on sensitive routes
- Recommended guard implementation patterns

Save to `.security-hardening/06-route-guard-audit.md`.

Update `state.json`: set `current_step` to 7.

---

### Step 7: Security Summary & Remediation Checklist

Read ALL `.security-hardening/*.md` files.

Produce a prioritized, actionable security checklist.

**Structure:**

```markdown
# Angular Security Hardening — Remediation Checklist for $TARGET

## 🔴 Critical (Fix Immediately)
- [ ] [Issue]: [File/Location] — [Fix]
...

## 🟠 High (Fix This Sprint)
- [ ] [Issue]: [File/Location] — [Fix]
...

## 🟡 Medium (Fix Next Sprint)
- [ ] [Issue]: [File/Location] — [Fix]
...

## 🟢 Low / Improvements
- [ ] [Issue]: [File/Location] — [Fix]
...

## Dependency Updates
```bash
# Run these commands:
npm audit fix
npm install @angular/core@latest @angular/material@latest rxjs@latest
```

## CSP Implementation
[Copy-paste ready CSP meta tag for index.html]

## OAuth PKCE Checklist
- [ ] code_verifier uses crypto.getRandomValues() with 32+ bytes
- [ ] code_challenge uses SHA-256 method
- [ ] state parameter generated and validated
- [ ] tokens stored in memory (not localStorage)
- [ ] HttpInterceptor attaches token only to Jira domains
```

Save to `.security-hardening/07-remediation-checklist.md`.

Update `state.json`: set `current_step` to "complete"`, set `status` to `"complete"`.

---

## Completion

Present the final summary:

```
Angular security hardening complete for: $TARGET

## Output Files
- .security-hardening/01-dependency-secrets-audit.md
- .security-hardening/02-xss-injection-scan.md
- .security-hardening/03-oauth-security-review.md
- .security-hardening/04-csp-headers.md
- .security-hardening/05-secure-coding-fixes.md
- .security-hardening/06-route-guard-audit.md
- .security-hardening/07-remediation-checklist.md

## Security Targets (Angular SPA)
- [ ] Zero use of bypassSecurityTrust* with user-controlled input
- [ ] No secrets or credentials in source code
- [ ] CSP header blocks all unauthorized script sources
- [ ] Jira PKCE OAuth flow fully validated
- [ ] All sensitive routes protected by auth guards
- [ ] npm audit shows 0 critical vulnerabilities
- [ ] Tokens stored in memory (not localStorage)

## Next Steps
1. Work through 07-remediation-checklist.md in priority order
2. Run `npm audit` after dependency updates
3. Test CSP in browser Console (look for CSP violation warnings)
4. Test OAuth flow end-to-end after auth changes
5. Use OWASP ZAP browser extension to verify XSS protections
```
