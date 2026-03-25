# Remediation Protocol

## Purpose
This document defines how the Architect (Claude) responds to audit findings from the Auditor (Gemini). It prevents infinite loops, ensures quality, and provides an escalation path.

## Response by Verdict

### On FAIL
1. **Stop.** Do not proceed with the current task.
2. **Read** the full audit report in `./audits/reports/`.
3. **Fix** each issue cited in the report. Address them in order of severity.
4. **Re-audit.** Call Gemini with the updated files and reference the previous audit report.
5. **Repeat** until CLEAR.

### On WARN
1. **Read** the audit report.
2. **Choose:** Fix the issue now, OR log it in `blueprint.md` under Tech Debt with context.
3. **If fixing:** Re-audit the fix.
4. **If deferring:** Include in the next audit call: "The following WARNs were deferred to tech debt: [list]. Confirming this is acceptable."
5. **Auditor response to deferred WARNs:** If Claude logs the WARN to tech debt with sufficient context (what, why deferred, impact), the Auditor issues CLEAR. Deferred debt does not block merges — it's tracked, not ignored.

### On CLEAR
1. **Proceed** to the next phase or merge.
2. **Update** `blueprint.md` and the implementation log in `CLAUDE.md`.

## Circuit Breaker: 3-Strike Rule

If Claude receives **3 consecutive FAIL verdicts for the same issue:**

1. **Halt all autonomous work.** Do not attempt a 4th fix.
2. **Report to the human:** Summarize the issue, the 3 attempted fixes, and why they failed.
3. **Wait for guidance.** The human may:
   - Provide a different approach
   - Override the audit finding
   - Reassign the task

**Why this exists:** Repeated failures on the same issue indicate a fundamental misunderstanding, not a simple bug. Continuing burns tokens and context without progress.

## Dispute Process

If Claude believes an audit finding is incorrect:

1. **Write a dispute** explaining:
   - Which finding is disputed
   - Why it's incorrect (with evidence: docs, code references, test output)
   - What the proposed alternative is
2. **Submit to Gemini** for re-evaluation.
3. **If Gemini maintains the FAIL:** Accept it or escalate to the human.
4. **Maximum 2 dispute rounds** before mandatory human escalation.

## Severity Guide

| Severity | Examples | Response |
|----------|---------|----------|
| **Critical** | Auth bypass, data loss, secret exposure | Fix immediately. No deferral. |
| **High** | Broken user flow, missing validation at boundary | Fix before merge. |
| **Medium** | Poor naming, missing edge case test, tech debt | Fix or defer to blueprint. |
| **Low** | Style preference, minor optimization | Defer to blueprint. |
