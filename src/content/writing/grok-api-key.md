---
title: "How to Get a Grok API Key and Build a Bot With It"
description: "The console path to an xAI API key, why the OpenAI SDK works unchanged, and a working Telegram bot — plus the billing detail that catches people out."
date: 2026-09-09
keyword: grok api key
volume: 2400
difficulty: 19
tags: [grok, xai, api, bots]
---

Getting a Grok API key takes about three minutes. Understanding what you are
being billed for takes slightly longer, and that is the part people get wrong.

This covers both, then builds a small bot that actually runs.

## Getting the key

1. Go to **console.x.ai**. This is the developer console, and it is separate
   from the Grok consumer app — you do **not** need an X Premium subscription
   to use the API.
2. Sign up or sign in. There is a short onboarding asking what you are building
   and asking you to accept the terms.
3. Open **API Keys** in the sidebar, then **Create API Key**.
4. Copy it immediately. Like most providers, the full key is shown once.

That is the whole flow. If you are being asked to pay for X Premium, you are in
the consumer product, not the developer console.

### Before you write any code, check two things in the console

- **Your credit balance and what it is.** xAI runs promotional credits for new
  accounts, and has at times offered additional monthly credits in exchange for
  opting into a data-sharing programme. **Both the amounts and the terms have
  changed more than once** — read what your own console says rather than
  trusting any blog post, including this one. There is no permanent free tier;
  after credits, it is pay per token.
- **Whether the data-sharing option is on.** If extra credits are attached to
  sharing your API traffic for training, that is a real trade. For a hobby bot
  it is probably fine. For anything touching customer data it is a decision you
  should make deliberately, not one you should discover later.

## Store it properly

The single most common mistake with a fresh API key is committing it.

```bash
# .env  — and make sure .env is in .gitignore
XAI_API_KEY=xai-...
```

If you have already pushed one to a public repository, rotate it in the console
rather than deleting the commit. Scrapers find keys in public git history
within minutes, and the commit is not the only copy.

## The useful part: it speaks OpenAI

The thing that makes the Grok API quick to adopt is that it is
OpenAI-compatible. You do not need a new SDK. You point the OpenAI client at a
different base URL:

```python
from openai import OpenAI

client = OpenAI(
    api_key=os.environ["XAI_API_KEY"],
    base_url="https://api.x.ai/v1",
)

response = client.chat.completions.create(
    model="grok-4",
    messages=[
        {"role": "system", "content": "You are terse. Answer in one sentence."},
        {"role": "user", "content": "Why is the sky blue?"},
    ],
)

print(response.choices[0].message.content)
```

Node is the same idea:

```js
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.XAI_API_KEY,
  baseURL: "https://api.x.ai/v1",
});

const res = await client.chat.completions.create({
  model: "grok-4",
  messages: [{ role: "user", content: "Give me one fact about Bangladesh." }],
});

console.log(res.choices[0].message.content);
```

Two caveats on that compatibility:

- **Model names are xAI's, not OpenAI's.** Check the console or the models
  endpoint for what is currently available rather than guessing a version
  string. Model IDs change.
- **Compatible does not mean identical.** The common path — chat completions,
  streaming, tool calling — works. Provider-specific extras on either side do
  not always map. If something behaves oddly, that seam is the first place to
  look.

## Building a bot

The most common thing people want a Grok key for is a bot. Here is a Telegram
one that works, in about forty lines.

```python
import os
import httpx
from openai import OpenAI

XAI = OpenAI(api_key=os.environ["XAI_API_KEY"], base_url="https://api.x.ai/v1")
TG = f"https://api.telegram.org/bot{os.environ['TELEGRAM_TOKEN']}"

SYSTEM = "You are a helpful assistant in a group chat. Keep replies under 60 words."

def reply(chat_id: int, text: str) -> None:
    httpx.post(f"{TG}/sendMessage", json={"chat_id": chat_id, "text": text})

def answer(prompt: str) -> str:
    res = XAI.chat.completions.create(
        model="grok-4",
        messages=[
            {"role": "system", "content": SYSTEM},
            {"role": "user", "content": prompt},
        ],
    )
    return res.choices[0].message.content

def main() -> None:
    offset = 0
    while True:
        # long-poll Telegram; 30s timeout keeps this cheap
        r = httpx.get(f"{TG}/getUpdates", params={"offset": offset, "timeout": 30}, timeout=35)
        for update in r.json().get("result", []):
            offset = update["update_id"] + 1
            message = update.get("message", {})
            text = message.get("text")
            if not text:
                continue
            reply(message["chat"]["id"], answer(text))

if __name__ == "__main__":
    main()
```

That is deliberately the simplest thing that works. Three changes turn it into
something you would leave running:

1. **Keep conversation history per chat**, capped. Without it every message is
   context-free. With it uncapped, your token bill grows with the conversation
   forever — keep the last N turns, not all of them.
2. **Rate limit per user.** A bot in an open group is a bot anyone can spend
   your credits on. This is the failure mode that turns a hobby project into a
   bill.
3. **Handle errors.** Wrap the API call. A 429 or a 500 should mean "try again
   shortly", not a crashed process and a silent bot.

## The billing detail that catches people

You are billed per token, input and output, and **input includes everything you
send** — the system prompt, the conversation history, and any documents you
paste in. A long system prompt is not free; you pay for it on every single
call.

For a bot, the practical consequences are:

- A 500-word system prompt costs you on every message, forever. Keep it short.
- Unbounded chat history is the most common source of a surprising bill.
- Set a spend alert in the console on day one, not after the first bad week.

## When Grok is the right pick

Honestly: the API is quick to adopt because it is OpenAI-compatible, and its
distinctive asset is real-time access to what is happening on X. If your
product needs current, public conversation — a monitoring tool, a trend bot,
anything where "what are people saying right now" is the question — that is a
genuine differentiator.

If you need general reasoning or coding, the OpenAI-compatible base URL means
you can benchmark it against alternatives by changing one line. Do that with
your own prompts on your own task rather than trusting anyone's benchmark
table, including mine.

---

*I write about the tools I actually ship with — see
[more writing](/writing/), or [what I am building](/projects/).*
