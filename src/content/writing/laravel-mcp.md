---
title: "Laravel MCP: What Three Production Servers Taught Me"
metaTitle: "Laravel MCP: Lessons From Three Production Servers"
description: "How to build an MCP server with the official laravel/mcp package, and the six things that broke on my three production Laravel MCP servers."
date: 2026-10-07
keyword: laravel mcp
volume: 320
difficulty: 6
tags: [laravel, mcp, ai agents]
---

I run three MCP servers built with `laravel/mcp`, the official Laravel
package. Each one sits inside a product I already had:

- **Schedule & Chill**, a social media scheduler. Its MCP server is public:
  22 tools, reachable with an API token or over OAuth 2.1.
- **ShipTell**, a support and changelog tool. Its server covers changelogs,
  the inbox, the knowledge base and the roadmap.
- **JuggleHire**, a hiring platform. A small internal server, read-only,
  that my own agents use to look up customers.

The package makes the first version easy. This post covers that part
quickly, then spends most of its time on six things that broke after the
first version worked. They are not in the docs, and most of them are not
bugs in the package. They come from running a Laravel app for a caller that
is a model, not a person.

One warning first: `laravel/mcp` is still a 0.x package. My servers run 0.6
and 0.9, and the API changed between them. The code below follows the
[current Laravel docs](https://laravel.com/framework/docs/mcp). Check the docs for
your version before copying anything.

## The setup in four commands

```bash
composer require laravel/mcp
php artisan vendor:publish --tag=ai-routes
php artisan make:mcp-server SocialServer
php artisan make:mcp-tool GetAccounts
```

The second command creates `routes/ai.php`. That is where servers are
registered, and there are two ways to do it:

```php
// routes/ai.php
use App\Mcp\Servers\SocialServer;
use Laravel\Mcp\Facades\Mcp;

// Over HTTP, for remote clients. Protected like any other route.
Mcp::web('/mcp', SocialServer::class)
    ->middleware(['auth:sanctum', 'throttle:mcp']);

// As an Artisan command (stdio), for a client on your own machine.
Mcp::local('social', SocialServer::class);
```

`throttle:mcp` needs a rate limiter called `mcp`. Define it in a service
provider with `RateLimiter::for('mcp', ...)`, like any other named limiter.

## A tool, written for a model

Here is a tool in the shape I use most. It lists the accounts a user can post
to, so the model fetches real IDs instead of making them up:

```php
<?php

namespace App\Mcp\Tools;

use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Attributes\Name;
use Laravel\Mcp\Server\Tool;
use Laravel\Mcp\Server\Tools\Annotations\IsReadOnly;

#[Name('get_accounts')]
#[Description('List the social accounts this user can post to. Call this before scheduling anything, and use only the ids it returns.')]
#[IsReadOnly]
class GetAccounts extends Tool
{
    public function schema(JsonSchema $schema): array
    {
        return [];
    }

    public function handle(Request $request): Response
    {
        $accounts = $request->user()->socialAccounts()->get();

        return Response::structured([
            'count' => $accounts->count(),
            'accounts' => $accounts->map(fn ($account) => [
                'id' => $account->id,
                'platform' => $account->platform,
                'name' => $account->account_name,
                'health' => $account->needsReconnect() ? 'needs_reconnect' : 'ok',
            ])->all(),
        ]);
    }
}
```

Three details in there matter more than they look:

1. **The description tells the model what to do next.** "Call this before
   scheduling anything" is an instruction. The description is the only prompt
   text you control inside a tool, so use it.
2. **`health`, not `is_active`.** On Schedule & Chill, `is_active` stayed
   true for an account whose refresh token had died. A model that trusted it
   kept scheduling into a channel that could not publish. Give the model the
   field you would check yourself.
3. **`#[IsReadOnly]`** tells the client the tool changes nothing. It is a
   hint, not a guarantee, but it costs one line.

Register the tool in the server's `$tools` array. The server class also takes
an `#[Instructions('...')]` attribute. Mine says which tool to call first and
which actions cannot be undone. The client receives it when it connects.

## What broke

### 1. It worked locally and returned 404 in production

This one cost me several hours on JuggleHire.

The MCP server worked on my machine. In production, every request returned
404. The route did not exist.

The cause was `composer.json`. I had never required `laravel/mcp` myself. It
was installed only because Laravel Boost, a dev dependency, pulled it in.
Production installs with `composer install --no-dev`, so the package was not
there, its service provider never booted, and `routes/ai.php` was never
loaded.

The fix was one line, `composer require laravel/mcp`. The lesson is wider:

- Run `composer why laravel/mcp`. If the only answer is a `require-dev`
  package, production will not have it.
- **A 404 means the route is not registered. A 401 means it is.** Hit the
  endpoint without a token. If you get 404, stop debugging auth.

### 2. Local and web are two different servers in practice

`Mcp::local` and `Mcp::web` can point at the same class, but they do not run
in the same place. The local one is an Artisan command on your machine, so it
reads your local `.env` and your local database. The web one runs on your
server against production.

On JuggleHire that meant the local server answered with seed data while the
production endpoint was broken, and "it works for me" was true and
meaningless at the same time. Test the transport your users will use. If
you keep both, name them so nobody confuses them.

### 3. MCP routes in routes/web.php need a CSRF exception

The package loads `routes/ai.php` without the `web` middleware group, so
there is no CSRF check on those routes. On Schedule & Chill I registered the
MCP routes in `routes/web.php` instead. That puts them inside the `web`
group, and a POST from an AI client carries no CSRF token, so Laravel rejects
it with a 419.

If your MCP routes live in `routes/web.php`, exclude them:

```php
// bootstrap/app.php
->withMiddleware(function (Middleware $middleware): void {
    $middleware->validateCsrfTokens(except: [
        'mcp',
        'mcp-oauth',
        'oauth/register', // dynamic client registration, from Mcp::oauthRoutes()
    ]);
})
```

Or keep them in `routes/ai.php`, which is what it is for.

### 4. With OAuth, the tools saw a different user than the middleware

Schedule & Chill serves the same server twice. `/mcp` takes a Sanctum token
that people paste into a config file. `/mcp-oauth` uses Passport, so that
claude.ai, Claude Desktop and other clients can offer a "Connect" button.
The Laravel docs recommend Passport for exactly this reason: OAuth 2.1 is
what the MCP spec documents. `Mcp::oauthRoutes()` registers the discovery
documents and client registration routes the clients probe for.

On that OAuth path, my setup needed a middleware that swapped the identity
model Passport resolved for the real `User`. It called
`$request->setUserResolver()`, and the test for it passed.

Every tool call still failed. In `laravel/mcp`, `Request::user()` resolves the
user through the **auth manager**, not through the HTTP request. The `api`
guard still held the old identity model, so the first relation call died. The
fix was to also call `Auth::guard('api')->setUser($user)`.

The test passed because it asserted `request()->user()`, which the tools
never call. Two rules came out of it:

- When a framework has two ways to get the current user, test the one the
  caller actually uses.
- **A successful handshake proves nothing.** `initialize` returned 200, the
  consent screen rendered, tokens were issued. Only a real tool call that
  touches a relation shows whether anything behind the door works.

### 5. The 401 had no WWW-Authenticate header

The MCP authorization spec expects a 401 from your server to carry a
`WWW-Authenticate` header that points the client to your OAuth metadata.
`Mcp::web()` adds a middleware for it, `AddWwwAuthenticateHeader`. But
Laravel's middleware priority list runs authentication earlier, so the 401
was rendered before that middleware could add the header. Clients got a bare
401 and had nowhere to go.

The fix moves it ahead of authentication:

```php
use Illuminate\Contracts\Auth\Middleware\AuthenticatesRequests;
use Laravel\Mcp\Server\Middleware\AddWwwAuthenticateHeader;

$middleware->prependToPriorityList(
    before: AuthenticatesRequests::class,
    prepend: AddWwwAuthenticateHeader::class,
);
```

Use the `AuthenticatesRequests` **interface** as the anchor, not the
`Authenticate` class. The priority list holds the interface. Naming the class
matches nothing, and the middleware is quietly added to the end of the list,
which looks like the fix and changes nothing. Check with `curl -i` that the
header is really there.

### 6. A capped list looked like the whole list

JuggleHire's internal server has a tool that lists customers. It returned at
most 50 rows and did not say so, and production has far more customers than
that. An agent that counted the rows got 50, and nothing in the response told
it the real number was much higher. I ended up writing a warning into my own
notes: never quote that number as a total. The fix belongs in the tool, not
in my notes.

A model cannot know a list was cut unless you tell it. Any tool that limits
results should return the total and say the list is partial:

```php
return Response::structured([
    'total' => $total,
    'returned' => $customers->count(),
    'truncated' => $total > $customers->count(),
    'customers' => $customers->all(),
]);
```

The same rule applies to anything the server decides for the model. On
Schedule & Chill, scheduling tools return the time we understood in UTC, in
local time and with the timezone name, so an agent can check our reading of
its input. It cannot look at a calendar to confirm.

## Errors are instructions

The Laravel docs say it directly: on validation failure, AI clients act on
the error messages you give them. So write messages a model can act on:

```php
$request->validate([
    'scheduled_at' => ['required', 'date', 'after:now'],
], [
    'scheduled_at.after' => 'scheduled_at must be in the future. Send an ISO-8601 time after the current time, with a timezone offset.',
]);
```

On Schedule & Chill every tool error is a JSON object with `code`, `problem`,
`cause` and `fix`. The `fix` field is the one that matters. A model that can
read it corrects itself without asking the human.

One more thing about errors: the error path must never throw. Error messages
often include outside text, such as an account name or a platform's error
body. On Schedule & Chill one invalid UTF-8 byte in that text made
`json_encode` throw, and the whole tool call failed instead of returning the
error. Clean outside strings before you encode them.

## Testing it

The package has two built-in ways to test, and both are worth using.

**Unit tests** call a tool directly on the server class:

```php
it('lists the user\'s accounts', function () {
    $user = User::factory()->create();
    SocialAccount::factory()->for($user)->create(['account_name' => 'Acme on LinkedIn']);

    SocialServer::actingAs($user)
        ->tool(GetAccounts::class)
        ->assertOk()
        ->assertSee('Acme on LinkedIn');
});
```

**The MCP Inspector** connects to a running server so you can call tools by
hand: `php artisan mcp:inspector mcp` for the web server at `/mcp`, or
`php artisan mcp:inspector social` for the local one.

Then do the test that finds the real problems. Connect an actual client and
give it a plain-language task that needs three or four tool calls, without
naming the tools. In Claude Code:

```bash
claude mcp add --transport http social https://your-app.test/mcp \
  --header "Authorization: Bearer YOUR_TOKEN"
```

Watch which tool it calls first, which argument it guesses, and which
description sends it the wrong way. That found more problems in my servers
than all the schema work did.

## Who this is not for

If your code decides which endpoint to call and the model only writes text,
you do not need an MCP server. A normal API call is simpler. I wrote about
where that line sits in [MCP vs API](/writing/mcp-vs-api/). For the
framework-neutral version of this post, with the TypeScript SDK and the
mistakes every MCP server makes, see
[how to build an MCP server](/writing/how-to-build-an-mcp-server/).

If you are already on Laravel and your users work in Claude, Cursor or
another MCP client, the package is the shortest path I know. You are not
building a second app. You are exposing the one you have, with its policies,
validation and services intact. The work is in what this post covers: making
it behave when the caller is a model.
