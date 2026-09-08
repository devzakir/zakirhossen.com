---
title: "Claude Code vs Codex: What Actually Changed After Six Months of Both"
description: "I run both daily on production Laravel and TypeScript work. Here is where each one wins, where the benchmark numbers stop being useful, and the workflow I settled on."
date: 2026-09-09
keyword: claude code vs codex
volume: 5400
difficulty: 6
tags: [claude code, codex, ai coding agents]
---

I ship software alone. There is no team to catch my mistakes, so the tools that
write code with me get judged on one thing: how much of what they produce
survives to production without me rewriting it.

I have run both Claude Code and OpenAI's Codex CLI daily for about six months
across Laravel, Inertia/React and TypeScript codebases. This is what I actually
found, including the parts where the tool I use more lost.

## The short version

| | Claude Code | Codex CLI |
|---|---|---|
| Where it fits | Long, multi-file work you want to steer | Bounded tasks you want done and returned |
| Interaction | Interactive, shows reasoning, stops to ask | More autonomous, sandboxed, review at the end |
| Token appetite | Higher | Noticeably lower for the same task |
| Best single use | Building a feature across many files | Reviewing a diff someone else wrote |
| Where it frustrates me | Cost, and it will over-build if you let it | Less steerable once it has started |

If you only take one thing: **they are not really competing for the same job.**
I stopped choosing between them around month three and started using both,
which I explain at the end.

## Be careful with the benchmark numbers

Search for this comparison and you will find SWE-bench Verified scores quoted
to one decimal place, usually both above 96%. I am not going to repeat those as
if I verified them, because I did not, and neither did most of the posts
quoting them.

Two things are worth knowing about that:

1. **The gap between the top agents on those benchmarks is now smaller than
   the gap between a good prompt and a lazy one.** When two tools are within a
   point of each other, the benchmark has stopped being the deciding factor for
   your work.
2. **Benchmarks measure "did the test pass", not "would you merge this".**
   Those are different questions, and the second one is the one that costs me
   time.

So the rest of this is what I observed, framed as observation rather than
measurement. Where I say "faster" or "cheaper" I mean in my work, on my
codebases, which is a sample of one.

## Where Claude Code wins for me

**Multi-file work where the plan matters more than the code.** The thing I do
most is change a feature that touches a controller, a React page, a migration,
a config file and three tests. Claude Code holds that shape in its head. It
reads the surrounding code and matches it — my naming, my comment density, the
way I structure a Laravel domain folder — rather than writing generically
correct code that reads like it came from somewhere else.

**It tells you when it disagrees.** More than once it has stopped and said the
approach I asked for would break something else, and it was right. That is
worth real money when nobody else is reviewing your work.

**Skills, subagents and hooks.** This is the part that changed how I work, not
just how fast I type. I keep a set of skill files that encode things I have
learned the hard way — how my deploy pipeline works, which database gotchas
bite me when SQLite passes locally and MySQL fails in production, what my
commit messages should look like. Claude Code loads the relevant one on its
own. Codex has no real equivalent that I have found.

**Worktrees.** I often run several sessions on the same repository. Claude Code
handles git worktrees well enough that I can genuinely parallelise, which was
not true six months ago.

## Where Codex wins for me

**It uses far fewer tokens for the same result.** This is the difference I feel
most in the bill. On a bounded task — "add validation to this endpoint and
update the test" — Codex gets there with a fraction of the back-and-forth.
Claude Code will read more files than it strictly needed to.

**Review is its best mode.** This surprised me. Handing Codex a diff and asking
what is wrong with it produces tighter, less agreeable feedback than asking
Claude Code the same thing. Claude Code is more likely to tell me the diff
looks good. Codex is more likely to find the thing I missed.

**Sandboxed autonomy.** When I genuinely do not want to watch — a mechanical
refactor across forty files, a dependency bump — letting it run and reviewing
at the end is the right shape, and Codex is built for that shape.

## Where both of them still fail

Neither tool checks whether what it wrote is *true*.

This is the failure that has cost me the most. A tool page on one of my
products had a step in its instructions saying "export the result as a PDF".
There was no PDF export. The code offered clipboard copy and a `.txt`
download, and the prose next to it had been confidently wrong for months. Both
agents had read that page. Neither flagged it, because prose that contradicts
the component beside it is not a syntax error.

The same class of thing bit me on competitor pricing: five of eleven prices on
a comparison page had drifted since they were written, and no amount of code
review catches a number that is simply out of date.

**So the rule I ended up with: agents are good at "does this run" and bad at
"is this still true".** Anything factual — a price, a limit, a capability
claim, a step in a tutorial — gets verified by me against the actual thing,
every time. I now write tests that fail when a claim goes stale, which is the
only version of this that survives me forgetting.

The second shared failure is over-building. Ask for a fix, get a fix plus a
refactor plus three new tests plus a README section nobody asked for. Claude
Code does this more than Codex does. The prompt that works is boring and
specific: say what to change, say what not to touch.

## What I actually do now

I stopped picking one:

1. **Claude Code writes the feature.** It gets the multi-file work, the
   planning, and anything where matching the existing codebase matters.
2. **Codex reviews the diff before it merges.** Different model, different
   training, genuinely different opinions — it catches things the author
   missed, in a way that asking the author to re-read its own work does not.
3. **I verify every factual claim myself.** Prices, limits, capabilities,
   tutorial steps. Neither agent does this and both will state a wrong thing
   confidently.

That third step is not optional and it is the one people skip.

## Which should you pick, if you can only pick one

- **Building something new, or working alone with nobody reviewing you** —
  Claude Code. The steerability and the skills system compound over months in a
  way that raw speed does not.
- **Working in a team with review already in place, or cost-sensitive** —
  Codex. You already have humans catching mistakes; you want throughput, and it
  is cheaper per task.
- **Mostly reviewing rather than writing** — Codex, without much hesitation.

And if the honest answer is that you have not tried either seriously for more
than a week: pick either one and use it on real work for a month. The
difference between the two is much smaller than the difference between using
one properly and using it as autocomplete.

---

*I build [software products](/projects/) solo under Lomeyo, LLC — a hiring
platform, a social scheduler, and a few smaller things. Everything above comes
out of that work.*
