---
title: "How to Build an MCP Server (And the Five Things That Broke Mine)"
metaTitle: "How to Build an MCP Server (and 5 Things That Broke Mine)"
description: "Build a production MCP server: tool design, transports, OAuth, and the five failures that only show up once a real model starts calling it."
date: 2026-09-09
updated: 2026-10-07
keyword: how to build an mcp server
volume: 480
difficulty: 1
tags: [mcp, tutorial, ai agents, laravel]
---

Building an MCP server that connects is easy. There is a quickstart in every
SDK and it works in about ten minutes.

Building one a model uses *correctly* took me considerably longer, and the gap
between those two things is what this post is about. I run MCP servers on four
products now. Everything below is a mistake I made and had to fix.

## The ten-minute version

Every MCP server is the same three things:

1. **A list of tools**, each with a name, a description and a JSON schema for
   its arguments.
2. **A handler per tool** that does the work and returns a result.
3. **A transport** — stdio for something running on the user's machine, HTTP
   for something running on yours.

Here is the smallest useful shape, in TypeScript, using v2 of the official
SDK (`@modelcontextprotocol/server`), the stable line since July 2026:

```ts
import { McpServer } from "@modelcontextprotocol/server";
import { StdioServerTransport } from "@modelcontextprotocol/server/stdio";
import * as z from "zod/v4";

const server = new McpServer({ name: "my-server", version: "1.0.0" });

server.registerTool(
  "list_accounts",
  {
    description:
      "List the social accounts this user can post to. Call this before scheduling anything so you use real account ids.",
    inputSchema: z.object({
      platform: z.string().optional().describe("Only accounts on this platform, e.g. linkedin"),
    }),
  },
  async ({ platform }) => {
    const accounts = await db.accounts.findMany({ where: platform ? { platform } : {} });
    return {
      content: [{ type: "text", text: JSON.stringify(accounts) }],
    };
  },
);

await server.connect(new StdioServerTransport());
```

The SDK turns the Zod schema into the JSON Schema the model sees, and it
rejects arguments that do not match before your handler runs. Two notes from
the SDK docs: over stdio, stdout is the protocol channel, so log with
`console.error`, never `console.log`. And if you are still on v1
(`@modelcontextprotocol/sdk`), the imports and some method names differ, so
follow the v1 docs rather than this snippet.

That runs. Now here is what goes wrong.

## 1. The model invents IDs

This was the first thing to break and it is the one I would warn everyone
about.

My scheduling tool took `social_account_ids`. A developer using the REST
version fetches the accounts once and hardcodes them. A model does not. Given a
tool that wants account IDs, it will confidently supply account IDs that do not
exist. The schema validates. The call either fails oddly or hits the wrong
account.

**The fix is a tool, not documentation.** Add `list_accounts` — or whatever the
equivalent is in your domain — and say in the *description* of every tool that
consumes an ID that the model should call it first. Descriptions are prompt
text. They are the only place you get to instruct the model.

## 2. Error messages written for humans

`422 Unprocessable Entity` is fine for a developer with docs open. To a model
it is a dead end, and a model at a dead end guesses.

Compare:

```
// Useless to a model
{ "error": "Validation failed", "code": 422 }

// Useful
{ "error": "scheduled_at must be in the future. You sent 2026-01-01T10:00:00Z,
   which is in the past. Current time is 2026-09-09T14:22:00Z. Send a timestamp
   after that." }
```

The second one tells the model what to do next. Every error your MCP server
returns should read like an instruction, and should include the value that was
wrong and what a correct one looks like.

## 3. Silently dropped arguments

This one cost me a real production mistake, so it gets its own section.

Most MCP servers — mine included, at first — accept an options object and
ignore keys they do not recognise. The call returns success. The feature you
thought you enabled was never enabled, because you guessed the key name and the
server threw it away without saying anything.

If a caller passes `platform_options: { threadReply: true }` and your server
expects `thread_reply`, and you silently drop unknown keys, the post publishes
with the default and reports success. Nothing in the logs says otherwise.

**Fix it in two places.** Reject unknown keys loudly, and ship a
`get_capabilities` tool that returns the exact option keys each surface
accepts, so the model can ask instead of guessing. Guessing is the default
behaviour of every model and you cannot prompt it away.

## 4. Publishing is irreversible and models are not careful

Anything your server can do that cannot be undone needs a safe default.

For a scheduler that means: the natural tool is `schedule_post` with a future
timestamp, not `publish_now`. The review window costs nothing and cancel undoes
anything wrong. `publish_now` exists but it is the explicit choice, not the
path of least resistance.

Apply this generally. Ask which of your tools are irreversible, then make the
reversible version the obvious one — in the tool name, in the description, and
in what happens when a required field is missing.

## 5. Remote MCP means OAuth, and OAuth is most of the work

stdio is easy: the server runs on the user's machine as their user, so
authentication is "it already is them".

Remote is a different product. Once your MCP server runs on your infrastructure
and serves many users over HTTP, you need:

- A real OAuth flow, including the consent screen and the callback.
- Token storage and refresh, per user, that survives your deploys.
- Scoping, so a token cannot reach another tenant's data.
- A way for the user to revoke it.

None of that is MCP-specific and all of it is required. Budget for it. If you
already have OAuth for your product, you are most of the way there; if you do
not, the MCP server is not the small project it looked like.

## What Laravel developers should know

If you are on Laravel — I mostly am — the ecosystem got much better. The
official Laravel MCP package lets you register a server as a route and define
tools as classes, which means your existing authorisation, validation and
service layer apply unchanged. That is the main advantage: you are not building
a parallel application, you are exposing the one you have.

The trap is the same as everywhere else. Your form requests were written to
return validation errors to a human looking at a form. Read them again as if a
model is the reader.

I wrote the full Laravel version separately:
[Laravel MCP: what three production servers taught me](/writing/laravel-mcp/)
covers the package setup and six failures that only showed up in production.

## The test that actually tells you it works

Not a unit test. Connect a real client — Claude Desktop or Claude Code — and
give it a task in plain language that requires three or four tool calls in
sequence, without telling it which tools to use.

Watch what it calls. You will find:

- The tool it reached for first, which is rarely the one you expected.
- The argument it guessed instead of fetching.
- The description that was ambiguous enough to send it the wrong way.

That fifteen-minute exercise found more real problems in my servers than any
amount of schema work. Do it before you ship, then again after every tool you
add.

## The short checklist

- One tool that lists the real IDs, and descriptions telling the model to call
  it first.
- Errors that say what to do next, with the bad value and a correct example.
- Unknown arguments rejected loudly, plus a `get_capabilities` tool.
- The reversible action is the obvious one; irreversible actions are explicit.
- Remote means OAuth, scoping and revocation — plan for it as its own project.
- Test by watching a real model use it cold.

---

*More on what this protocol is and is not:
[MCP vs API](/writing/mcp-vs-api/) — why an MCP server sits on top of your API
rather than replacing it, and when building one is a waste of time.*
