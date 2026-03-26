# AI Dev Team Template

A governance framework for building software with AI agents. Turns Claude Code + Gemini into a two-agent development team with built-in quality gates, adversarial auditing, and structured project management.

## What This Is

This template encodes a development process where:

- **Claude** (Architect) writes code, follows rules, and cannot self-approve
- **Gemini** (Auditor) reviews everything adversarially and blocks merges until quality is met
- **You** (Human) set priorities and break ties

The system was battle-tested building [Urban Explorer](https://github.com/Anguijm/urban-explorer) — a production Next.js app with 100-city coverage, Firestore caching, and Playwright e2e tests, built over ~2 weeks.

## Quick Start

1. Click **"Use this template"** on GitHub (or clone directly)
2. Fill in `blueprint.md` with your project's stack, goals, and first tasks
3. Fill in `CODEX.md` with domain knowledge and design rules
4. Open Claude Code and say: *"Read CLAUDE.md and blueprint.md. Let's begin."*

That's it. Claude will follow the workflow, call Gemini for audits, and maintain the documentation.

## File Structure

```
CLAUDE.md                           # Architect: role, hard rules, workflow, implementation log
GEMINI.md                           # Auditor: role, quality bar, verdict format, anti-patterns
blueprint.md                        # Single source of truth for priorities and project state
REMEDIATION_PROTOCOL.md             # How to handle audit failures and disputes
CODEX.md                            # Domain knowledge, design tokens, business rules
audits/
  templates/MASTER_AUDIT_TEMPLATE.md  # Structured format for audit reports
  reports/                            # Gemini writes reports here (one per audit)
cold-storage/
  implementation-log-archive.md       # Archived log entries (>2 weeks old)
```

**Note:** Audit reports in `audits/reports/` should be committed to version control. They provide historical traceability for architectural decisions.

## Automated PR Auditing (GitHub Action)

The template includes `.github/workflows/gemini-audit.yml` — a GitHub Action that automatically calls Gemini to audit every PR.

**What it does:**
- Triggers on PR open/push (skips drafts)
- Sends the PR diff + your `GEMINI.md` + `blueprint.md` to Gemini 2.5 Flash
- Posts a comment with the audit result (CLEAR / WARN / FAIL)
- Fails the check on FAIL verdict

**Setup:**
1. Add `GEMINI_API_KEY` to your repo's GitHub Secrets
2. (Optional) Go to Settings → Branch Protection → require the "Gemini Adversarial Audit" check to block merges on FAIL

**Security:** Uses `pull_request` (not `pull_request_target`), so fork PRs cannot access your secrets. Uses `systemInstruction` to resist prompt injection from malicious diffs.

**Cost:** ~$0.003 per audit (Gemini 2.5 Flash). Pennies per month even on active repos.

## The Hard Rules

1. **No self-approval** — Claude cannot merge without Gemini CLEAR
2. **Mandatory audit gates** — Plans, tests (RED), implementations (GREEN), and docs all get audited
3. **No skipping "simple" fixes** — Every exception became a bug
4. **Build before CLEAR** — Local build must pass before Gemini can approve
5. **3-strike circuit breaker** — 3 consecutive fails on the same issue = halt and ask the human

## The Workflow

```
blueprint.md → Plan → Gemini audit plan
             → Write failing tests (RED) → Gemini audit tests
             → Implement (GREEN) → Gemini audit implementation
             → Build locally → Gemini verifies build output
             → Update docs → Gemini audit docs
             → CLEAR → Merge
```

## Prerequisites

- [Claude Code](https://claude.ai/code) (CLI, desktop app, or web)
- Gemini MCP server configured (see setup below)
- A git repository for your project

## Setting Up the Gemini MCP Server

Claude calls Gemini via the MCP tool `mcp__gemini__ask-gemini`. You need to configure this in your Claude Code MCP settings.

### Option 1: Gemini MCP (recommended)
Add to your Claude Code MCP configuration (`~/.claude/mcp_servers.json` or project-level `.claude/mcp_servers.json`). Several community Gemini MCP servers exist — search GitHub for `gemini-mcp-server` or use the one matching your setup.

Example configuration (adapt the command/args to your chosen server):

```json
{
  "gemini": {
    "command": "npx",
    "args": ["-y", "gemini-mcp-server"],
    "env": {
      "GEMINI_API_KEY": "your-gemini-api-key"
    }
  }
}
```

Get a Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey).

> **Note:** The specific MCP server package depends on what's available in your ecosystem. The key requirement is a tool Claude can call that forwards prompts to Gemini and returns the response.

### Option 2: Any LLM as auditor
The governance model works with any MCP tool that calls a second LLM. The key requirement is that Claude cannot self-approve — the audit must go through an external model. Adapt `CLAUDE.md` to reference your MCP tool name instead of `mcp__gemini__ask-gemini`.

## How Gemini Gets Called

Claude calls Gemini via the MCP tool with:
- Changed file paths (using `@file.ts` syntax for file inclusion)
- The current `blueprint.md` context
- `GEMINI.md` (so Gemini knows its role and quality bar)
- An adversarial prompt: *"Act as my Adversarial Auditor. Find the shortcuts I took. Be brutal."*

Gemini returns a verdict (FAIL / WARN / CLEAR) and the report is saved to `audits/reports/`.

## Customizing for Your Project

| File | What to customize |
|------|-------------------|
| `blueprint.md` | Your tech stack, current tasks, backlog |
| `CODEX.md` | Your domain knowledge, design system, business rules |
| `CLAUDE.md` | Add project-specific architectural decisions to the Session Resumption Guide |
| `GEMINI.md` | Add project-specific quality checks to the quality bar table |

The governance process (hard rules, workflow, remediation protocol) should stay as-is. They're battle-tested.

## What This Is NOT

- **Not a Claude Code skill** — It's pure Markdown, works with any AI coding tool
- **Not a replacement for human judgment** — You set priorities and break ties
- **Not gstack** — We evaluated it and rejected auto-fix tools; the system is read-only auditing, never autonomous code mutation

## Origin

Developed during the [Urban Explorer](https://github.com/Anguijm/urban-explorer) project (2026-03). The governance system emerged organically from catching real bugs:

- A naive `eval('require')` that silently broke production for days
- Gemini catching hallucinated data in city research pipelines
- Audit gates preventing brittle CSS selectors from shipping
- The 3-strike rule after watching Claude loop on the same P0 fix

Every rule exists because we broke something without it.

## License

MIT
