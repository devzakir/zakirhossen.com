---
title: "Claude Code Review: The Four Built-In Options and How I Review AI-Written Code"
metaTitle: "Claude Code Review: 4 Built-In Options and My Workflow"
description: "Claude Code reviews code four ways: /code-review, ultrareview, managed Code Review and GitHub Actions. What each one does, and the review rules I use."
date: 2026-10-07
keyword: claude code review
volume: 2900
difficulty: 12
tags: [claude code, code review, ai coding agents]
---

I build my products with Claude Code every day, and I ship alone. Nobody
else reads my diffs. So review is the step I cannot skip, and
it is also the step where an agent is most tempted to tell me what I want to
hear.

"Claude Code review" can mean two things: the review features built into
Claude Code, or how you review the code Claude Code writes. This post covers
both. First the four built-in options and what each one is for, checked
against Anthropic's documentation in October 2026. Then the rules I follow,
which came from things that went wrong.

## The four built-in options

| Option | Where it runs | What it reviews | Who can use it |
|---|---|---|---|
| `/code-review` | Your machine, as a background subagent | Your current diff, a branch, a path or a PR | Any Claude Code user |
| `/code-review ultra` (ultrareview) | Anthropic's cloud, many agents | Your branch or a GitHub PR | claude.ai sign-in; research preview |
| Code Review (managed) | Anthropic's cloud, via a GitHub App | Every PR, automatically | Team and Enterprise; research preview |
| Claude Code GitHub Actions | Your own CI runners | Whatever your workflow tells it to | Anyone with an API key or subscription token |

Two related commands are worth knowing. `/security-review` checks the diff
between your branch and the default branch on `origin` for security problems
such as injection, auth issues and data exposure. `/simplify` looks for
cleanup only: reuse, simplification, efficiency. The docs are explicit that
`/simplify` does not look for correctness bugs. If you want bugs found, use
`/code-review`.

### 1. /code-review, in your terminal

```text
/code-review
```

With no target, it reviews your branch's commits ahead of its upstream plus
any uncommitted changes. You can also pass a PR number, a branch, a path or a
range such as `main...my-feature`. `/review` is an alias.

The parts that matter in practice:

- **Effort levels.** `/code-review low` through `/code-review max`. At `low`
  and `medium` it reports only the findings it is most sure of, so you see
  fewer false alarms. `high` to `max` cover more ground and may include
  findings it is less sure of. If you do not type a level, it reuses the last
  one you typed, even from an earlier session.
- **It runs in the background** as a subagent with its own context window, so
  it does not fill up the conversation you are working in.
- **`--fix` applies the findings** to your working tree. Those edits happen
  outside your session's checkpoints, so `/rewind` will not undo them. Commit
  before you run it, and use git to back out.
- **`--comment` posts the findings** on a GitHub pull request as inline
  comments.
- **It follows your `CLAUDE.md`.** It does not read `REVIEW.md` (more on that
  below). If you want a local review to enforce a rule, the rule has to be in
  `CLAUDE.md`.

This is the one to run on every change before you commit. It costs nothing
extra to start and does not need GitHub.

### 2. Ultrareview, in the cloud

```text
/code-review ultra
/code-review ultra 1234
```

Ultrareview sends the review to a cloud sandbox where a larger group of
reviewer agents works on it in parallel. Anthropic's docs say every finding
it reports is independently reproduced and verified, which is the main
difference from a local review. It reviews your branch against the default
branch, or a GitHub PR if you pass its number. Your terminal stays free while
it runs.

Limits worth knowing before you plan around it:

- It needs a claude.ai sign-in. It does not run on Amazon Bedrock, Google
  Cloud's Agent Platform or Microsoft Foundry, or for organisations with Zero
  Data Retention.
- It is a research preview. Pro and Max include a few free runs, and after
  that it uses paid usage credits.
- Claude never starts it on its own. You have to type it.
- For CI, there is a `claude ultrareview` subcommand that waits for the
  findings and prints them.

Use it for the changes where a missed bug is expensive: billing, auth,
migrations, anything that deletes data.

### 3. Code Review, the managed GitHub service

This one is for teams. An organisation Owner installs the Claude GitHub App
and picks which repositories to review. From then on, reviews start when a PR
opens, on every push, or only when someone comments `@claude review`,
depending on the setting for each repository.

Several agents look at the diff and the code around it, a verification step
filters out false positives, and the results arrive as inline comments
tagged by severity:

- **Important**: a bug that should be fixed before merging.
- **Nit**: worth fixing, not blocking.
- **Pre-existing**: a real bug that this PR did not introduce.

It never approves or blocks a PR. The check run always finishes as neutral,
so if you want findings to block a merge, you read them in your own CI.
Anthropic's docs put the average review at about 20 minutes and $15 to $25
in usage, billed separately from plan usage (October 2026). Reviewing on every
push multiplies that by the number of pushes, so manual mode with
`@claude review` on the PRs that matter is the cheaper setting.

### 4. Claude Code GitHub Actions

If you want Claude in your own CI instead of Anthropic's service, run
`/install-github-app` inside Claude Code. It installs the GitHub App, stores
your key as a repository secret, and opens a pull request with the workflow
file. After that, you can mention `@claude` in a PR or issue to get a review
or a change. This gives you the most control and the most setup.

## CLAUDE.md or REVIEW.md

The managed Code Review reads two files from your repository:

- **`CLAUDE.md`** is general project guidance. Code Review treats a new
  violation of it as a Nit, and it also flags a PR that makes a statement in
  `CLAUDE.md` out of date.
- **`REVIEW.md`** is only for review. It goes straight to the agents that find
  and verify issues, so rules there land more reliably than the same rules in
  a long `CLAUDE.md`.

Remember the catch from earlier: the local `/code-review` reads `CLAUDE.md`
and **not** `REVIEW.md`. If you use both, rules that must apply everywhere go
in `CLAUDE.md`.

Here is the kind of `REVIEW.md` I would write for a Laravel and Inertia app.
The rules come from the instructions I keep for my own Laravel projects:

```markdown
# Review instructions

## What Important means here
Important = breaks production behaviour, leaks data, or cannot be rolled
back. Style and naming are Nit at most. Report at most five Nits.

## Always check
- Index, unique and foreign key names stay under 64 characters. SQLite
  ignores the limit locally; MySQL rejects the migration in production.
- Controllers called by Inertia forms return a redirect, never
  response()->json().
- Every query that reads customer data is scoped to the current team.
- A test's assertions match its name. Read the assertion, not the title.

## Do not report
- Anything CI already enforces: formatting, lint, type errors.
- Generated files and lockfiles.
```

Keep it short. The docs warn that a long `REVIEW.md` dilutes the rules that
matter most.

## How I review code an agent wrote

The tools above find bugs in code. They do not decide what ships. These are
the rules I follow for that part.

### Run the gate before any review

Build, type check, tests. Do this before asking any reviewer, human or
agent, to read the diff. A review of code that does not compile wastes
everyone's time, and a model will happily review it anyway.

### Use a different model as the reviewer

Claude Code writes most of my code. A different model, Codex, reviews the
diff before it merges. In my experience the author model is more likely to
say its own diff looks fine. A model with different training has different
opinions, and it catches things the author missed in a way that asking the
author to re-read its work does not. I wrote more about that split in
[Claude Code vs Codex](/writing/claude-code-vs-codex/).

### Reproduce every finding before you act on it

A finding is a claim, not a fact. Before I change code because a reviewer
said so, I run the case that is supposed to fail. Some findings are real.
Some describe code paths that cannot happen.

The same rule applies to a reviewer saying a failure is "pre-existing".
Prove it: run the same test on the commit before the change. If you cannot
show it failing there, it belongs to this change.

### Read what a test asserts, not what it is called

This one hurt. On Schedule & Chill, a test named "hands the real user model
to the tools" passed for the whole time the feature it described was broken.
It checked a different way of getting the user from the one the code
actually used, so it could not fail. The name said one thing and the
assertion tested another. The details are in
[my Laravel MCP post](/writing/laravel-mcp/).

When an agent writes both the code and the test, the test was written by
something that already believed the code was right. Read the assertion line.

### Separate "can hurt money or customers" from everything else

I sort each finding into two groups before fixing anything:

1. **Blocks the merge.** Wrong data, lost data, a broken payment, a security
   hole, a user who cannot finish what they came to do.
2. **Follow-up.** Naming, structure, a cleaner way to write it.

Group 1 gets fixed now. Group 2 gets fixed if it is cheap, or written down if
it is not. Without this split, a review turns into twenty equal-looking
comments and the one that matters gets lost.

### Check facts by hand

No reviewer, built-in or not, checks whether a statement is still true. A
help page on one of my products told users to "export the result as a PDF"
for months. There was no PDF export. On a comparison page, five of eleven
competitor prices had drifted since I wrote them. Both kinds of problem
passed every code review, because neither is a code problem.

Prices, limits, feature claims and tutorial steps get checked against the
real source, by a person, every time.

### Let a human own the merge

On my own products, I am that human. On a shared codebase where another
engineer reviews my PRs, the agent does the first pass and the human decides.
An agent never approves and never merges there. Having access to the repo is
not the same as having approval.

## Which one to use

- **Every change, before you commit:** `/code-review` at `medium`, after your
  build and tests pass.
- **A change that touches money, auth or data:** add `/security-review` and,
  if you have access, `/code-review ultra`.
- **A team that already reviews on GitHub:** the managed Code Review in manual
  mode, with a short `REVIEW.md`.
- **You want it in your own CI:** GitHub Actions through `/install-github-app`.

And whichever you pick, the last reviewer is you. The built-in reviewers are
good at "does this code do what it says". Only you can check that what it
says is true.
