---
name: feature-qa-generator
description: Generates comprehensive, executable human QA test plans from feature specifications, deployed environments, codebases, user flows, or API contracts. Use when asked to test, QA, validate, assess release readiness, create test scenarios, build a manual test plan, define acceptance criteria, or prepare a tester report template for a feature.
---

# Feature QA Scenario Generator

Create evidence-driven manual QA plans. Human tester executes scenarios and records objective results.

## Workflow

1. Gather available inputs:
   - Feature name and description
   - Intended user outcomes and acceptance criteria
   - Relevant code, routes, components, API contracts, schemas, feature flags, and integrations
   - Deployment URL and environment
   - Supported browsers, devices, account roles, locales, and accessibility targets
   - Test accounts, seed data, permissions, and known constraints
2. Inspect relevant codebase files when available. Trace UI, validation, state transitions, API calls, persistence, authorization, errors, retries, and integration boundaries.
3. Separate verified facts from assumptions. Never invent URLs, credentials, selectors, requirements, or expected behavior.
4. Ask only for missing information that blocks useful testing. Otherwise generate plan with explicit assumptions and placeholders.
5. Prioritize scenarios by user impact, likelihood, regression risk, security exposure, and implementation complexity.
6. Produce standalone plan using format below.

## Coverage Requirements

Cover applicable categories. Mark non-applicable categories and explain why.

- Core happy paths and alternate valid paths
- Input boundaries: empty, minimum, maximum, malformed, Unicode, whitespace, duplicates, and large values
- State transitions: initial, loading, success, empty, error, retry, refresh, back navigation, and interrupted flows
- User behavior: repeated clicks, rapid changes, stale tabs, concurrent sessions, abandonment, and out-of-order actions
- Permissions and roles: unauthenticated, unauthorized, least privilege, ownership boundaries, and role changes
- Data integrity: persistence, idempotency, duplicate submission, rollback, consistency, and deletion
- API and network failures: timeout, offline, partial response, invalid response, rate limit, server errors, and recovery
- Integrations: dependency unavailable, delayed events, webhook duplication, and eventual consistency
- Compatibility: supported browsers, viewport sizes, touch, orientation, and responsive layout
- Accessibility: keyboard-only use, focus order and visibility, labels, semantics, error announcements, contrast, zoom, and reduced motion
- Security checks suitable for manual QA: unsafe input rendering, direct-object access, sensitive-data exposure, open redirects, CSRF-sensitive actions, and session boundaries
- Performance observations: perceived latency, loading feedback, large datasets, repeated operations, and obvious resource degradation
- Localization when relevant: long text, RTL, date/time, number, currency, timezone, and encoding
- Observability when accessible: useful logs, audit events, metrics, and correlation identifiers without secret leakage
- Regression risks in adjacent features

Do not claim exhaustive security, accessibility, load, or compatibility certification from manual scenarios. Flag checks requiring specialist tooling.

## Scenario Design Rules

Each scenario must be independently executable and include:

- Stable ID and priority: P0 critical, P1 high, P2 medium, or P3 low
- Category and risk addressed
- Preconditions, account role, environment, and exact test data
- Numbered atomic steps with observable actions
- Specific expected result for each meaningful checkpoint
- Objective pass/fail criteria
- Cleanup or reset steps when state changes

Avoid vague instructions such as “test validation,” “verify it works,” or “try edge cases.” Use concrete values and observable outcomes. Do not prescribe DevTools simulation without explaining exact setup and restoration steps.

Keep destructive tests clearly labeled. Never use production for destructive, security, load, fault-injection, or real-payment scenarios unless user explicitly confirms authorization and safeguards. Use sandbox data and test credentials by default. Never expose secrets in output.

## Mandatory Test-Data Cleanup

Treat cleanup as part of testing, not optional follow-up.

- Track every temporary object created during QA, including users, accounts, records, files, messages, invitations, tokens, subscriptions, projects, and external-service resources.
- Add explicit cleanup steps to each scenario that creates or mutates persistent state.
- Delete temporary objects after their final dependent test completes. Respect dependency order so parent objects are not deleted before children.
- Revoke temporary credentials, sessions, invitations, API keys, and access grants where supported.
- Restore modified shared settings, feature flags, permissions, and fixtures to their original values.
- Never delete pre-existing or unverified data. Record identifiers during creation so cleanup targets only QA-owned objects.
- Verify deletion or restoration through observable UI, API, or system state. Do not mark cleanup complete based only on clicking Delete.
- If product has no supported deletion or restoration path, do not invent one, bypass controls, or omit QA handoff. Leave object intact, exclude unsupported deletion steps, and clearly flag residual item to user with identifier, type, environment, reason cleanup is unsupported, and any impact.
- Generate QA plan and handoff regardless of cleanup limitations.

## Output Format

# QA Test Plan: [Feature Name]

## 1. Scope
- Feature under test
- In scope
- Out of scope
- Source material inspected
- Assumptions and unresolved questions

## 2. Test Environment
- URL/build/commit: [known value or placeholder]
- Browsers/devices: [matrix]
- Accounts/roles: [requirements]
- Test data: [fixtures]
- Feature flags/dependencies: [requirements]
- Reset procedure: [procedure]

## 3. Risk Summary

| Risk | Impact | Likelihood | Coverage | Priority |
|---|---|---|---|---|

## 4. Scenario Index

| ID | Scenario | Category | Priority | Role | Status |
|---|---|---|---|---|---|

## 5. Detailed Scenarios

### [ID] — [Scenario name]
- **Priority:** P0/P1/P2/P3
- **Category:** [category]
- **Risk addressed:** [risk]
- **Preconditions:** [state]
- **Role/environment:** [details]
- **Test data:** [exact values]

1. [Action]
   - **Expected:** [observable result]
2. [Action]
   - **Expected:** [observable result]

- **Pass criteria:** [objective condition]
- **Fail criteria:** [objective condition]
- **Cleanup:** [reset steps or none]
- **Result:** Pass / Fail / Partial / Blocked / Not run
- **Evidence/notes:** [tester entry]

## 6. Exploratory Charters

List time-boxed exploratory checks for risks not well represented by scripted scenarios. Include mission, focus areas, and evidence to collect.

## 7. Specialist or Automated Follow-up

List checks requiring accessibility scanners, screen readers, load tools, security tooling, browser automation, contract tests, or unit/integration tests.

## 8. Cleanup Ledger

| Temporary item | Identifier | Created by scenario | Cleanup method | Status | Reason retained / impact |
|---|---|---|---|---|---|

Allowed statuses: Deleted, Restored, Retained—deletion unsupported, Cleanup failed, or Not created. Explicitly notify user about every retained item or cleanup failure.

## 9. Release Criteria

Define measurable go/no-go conditions, including:
- Required P0/P1 pass rate
- Allowed unresolved defects by severity
- Required browser/device coverage
- Required evidence
- Blockers and accepted risks

## 10. Tester Report Template

# QA Test Report: [Feature Name]

- **Tester:**
- **Date/time:**
- **Build/commit:**
- **Environment:**
- **Browser/device:**

## Summary
- Total: ___
- Passed: ___
- Failed: ___
- Partial: ___
- Blocked: ___
- Not run: ___

## Scenario Results

| ID | Result | Observed behavior | Expected behavior | Evidence | Defect ID |
|---|---|---|---|---|---|

## Defects

### [Defect ID] — [Concise title]
- **Severity:** Critical / High / Medium / Low
- **Priority:** P0 / P1 / P2 / P3
- **Environment:**
- **Preconditions:**
- **Steps to reproduce:**
  1. ...
- **Expected:**
- **Actual:**
- **Reproducibility:** Always / Intermittent / Once
- **Evidence:** Screenshot, video, console output, network trace, or logs
- **Workaround:**

## Cleanup Results

| Temporary item | Identifier | Cleanup status | Verification | Reason retained / impact |
|---|---|---|---|---|

Explicitly call out anything not deleted or restored. If deletion is unsupported, state that item remains because product lacks deletion support; do not treat omission of unsupported deletion steps as tester failure.

## Objective Assessment
- Acceptance criteria met: Yes / No / Partial
- Release recommendation: Go / Conditional go / No-go
- Blocking defects:
- Residual risks:
- Untested scope and reason:

## Quality Checks Before Delivery

Confirm:
- Every scenario traces to requirement, implementation risk, or user behavior.
- Expected outcomes are observable and unambiguous.
- Priorities reflect impact and likelihood.
- Preconditions and test data make scenarios reproducible.
- Plan distinguishes facts, assumptions, and unknowns.
- Duplicate scenarios are consolidated.
- Tester can execute plan without inferring missing steps.
- Every temporary item has tracked cleanup and verification, or explicit unsupported-deletion notice.
- Report supports Pass, Fail, Partial, Blocked, and Not run states.
