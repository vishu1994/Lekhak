# Lekhak — Assistant Design (v1)

> **Document status:** draft (v1 assistant; agents deferred)
> **Owner:** Vishal
> **Last updated:** 13 Sep 2026
> **Related:** [TRD.md](./TRD.md)

**Purpose:** Describe how the study assistant works in v1: what the user can do in chat, how we decide whether to search the lecture, and how a two-layer router keeps RAG off messages that do not need it.

This document is the product and design contract for chat. It **overrides** the TRD’s v1 agent (§7, six tools in the chat loop). Tool-calling and LangGraph move to **v2**.

---

## 1. What the assistant is

In v1 the assistant is a **lecture Q&A box**, not an agent.

- It **explains and locates** content in the **currently open lecture**.
- It does **not** call tools. It does not generate notes, quizzes, or flashcards, and it does not schedule revision.
- Those artifacts stay **UI actions** (tabs / buttons). The ingest job already produces notes, 10 flashcards, and a 5-question quiz.

Three ideas that must stay separate:

| Name | Meaning | Used in v1? |
| --- | --- | --- |
| **RAG** | Search this lecture’s chunks, then write an answer (often with `[mm:ss]`). | Yes, on lecture questions only |
| **Router** | A function that labels the message and picks a path. | Yes |
| **Agent** | The model chooses tools and may loop (search, then quiz, then schedule). | **v2 only** |

“What did they say about recursion?” is RAG. It is not an agent. The path is fixed: retrieve, then answer.

---

## 2. How the user interacts

### 2.1 Where chat lives

After a job finishes, the lecture page has four surfaces:

- **Notes** — read (stream while generating)
- **Flashcards** — flip the 10 cards
- **Quiz** — take the 5 questions
- **Ask** — the assistant

The assistant is scoped to **this lecture**. Opening the page **is** the lecture tag. Users do not `@mention` a video in v1.

If chat is opened with **no** lecture selected, we do not search. We tell them to open a lecture (or, for greetings only, reply briefly with no citations).

Suggested chips (pre-filled questions, still RAG):

- “Summarize the key insight”
- “What is the brute-force approach?”
- “Where do they discuss complexity?”

Show the **lecture title** above the thread so it is obvious what they are asking.

### 2.2 What we promise

**Can:** explain, locate, and quote this lecture.

**Cannot:** run ingest jobs, invent a new quiz in chat, search other videos, browse the web, or schedule revision.

If the user asks for an action we do not perform in chat, we **point at the tab**. We do not pretend we did it.

### 2.3 Typical turn (lecture question)

1. User is on lecture `video_id`, artifacts already exist.
2. They type: “What exactly is discussed about two pointers?”
3. Router labels the message `ASK`.
4. We retrieve top chunks from **that lecture only**.
5. We send: system prompt + chunks + question to the hosted LLM.
6. UI shows a short answer plus timestamps the user can use to jump (or highlight that span in the transcript).

If retrieval is empty: “I couldn’t find that in this lecture.” Do not invent a generic essay.

---

## 3. Why a router exists

Without a router, **every** message would search the lecture and call the LLM.

That is wrong for:

| User types | If we always RAG | What should happen |
| --- | --- | --- |
| “hi” | Fake-smart paragraph and a random `[03:12]` | Short greeting, no search |
| “make a quiz” | Model invents a quiz from chunks (and still cannot persist it) | Point to the Quiz tab |
| “what did they say about recursion?” | Correct path | Search, then answer |

The router does **not** answer the lecture question and does **not** retrieve chunks. It only chooses a path so **RAG runs on lecture questions and nothing else**.

```text
                    +-- GREET / HELP --> canned reply
user message ------->|
                    +-- ACTION --------> "use this tab"
                    +-- no lecture ----> "open a lecture"
                    +-- ASK -----------> search lecture -> LLM -> answer
```

RAG is one branch. The router is the fork.

### 3.1 Lecture scope vs “do we search?”

A lecture in scope (open page) answers **which** index to search.

The **type of message** answers **whether** to search.

| Message | Lecture open? | Path |
| --- | --- | --- |
| “What did they say about recursion?” | Yes | RAG |
| “Make me the quiz” | Yes | ACTION — no retrieval |
| “Thanks” | Yes | GREET — no retrieval |
| “What is a binary heap?” (generic, no lecture) | No | `NO_LECTURE` or a short generic reply — no retrieval |
| Same question while **on** that lecture | Yes | RAG (they mean *this* video) |

Bias: topic questions on an open lecture search the lecture. Chit-chat and explicit UI actions do not search.

---

## 4. Intents

The router returns **exactly one** label.

| Intent | Meaning | Retrieval? | Typical reply |
| --- | --- | --- | --- |
| `GREET` | Greeting or thanks | No | “Hi — ask anything about this lecture.” |
| `HELP` | How the assistant / app works | No | Ask about this lecture; notes / quiz / cards are tabs. |
| `ACTION` | Wants quiz, cards, notes, or a reminder | No | Point to the matching tab. Include `action` when known. |
| `ASK` | Question about this lecture or a topic in it | **Yes** | RAG answer + citations |
| `CHITCHAT` | Other, not about the lecture | No | Short reply; offer to ask about the video. |
| `NO_LECTURE` | Would need a lecture, none in scope | No | “Open a lecture first.” |

`ACTION` may carry a hint: `quiz` | `flashcards` | `notes` | `schedule`.

---

## 5. Two-layer router

The router is a **function in the API**, not a service and not an agent.

**Input:** `lecture_id` (optional) and user `text`.

**Output:** one intent (and optional `action`).

Layers run **in order**. Layer 1 tries to finish. Layer 2 runs only if layer 1 is unsure. The vector store is called **only** in the `ASK` handler.

```text
message + lecture_id
        |
        v
+---------------+
|   Layer 1     |  word lists (no model)
|   (rules)     |
+-------+-------+
        |
        +-- GREET / HELP / ACTION --> stop. no RAG.
        +-- no lecture_id (and not greet/help) --> NO_LECTURE. no RAG.
        |
        +-- no match
                |
                v
        +---------------+
        |   Layer 2     |  optional classify call
        |   (LLM)       |  one label, no chunks
        +-------+-------+
                |
                +-- ASK + lecture open --> RAG
                +-- anything else -------> no RAG
```

### 5.1 Layer 1 — rules

Normalize: lowercase, strip extra punctuation, collapse spaces.

Check lists **in this order**. First hit wins.

| Intent | Example phrases (extend from logs) |
| --- | --- |
| `GREET` | hi, hello, hey, thanks, thank you, ok, cool |
| `HELP` | help, what can you do, how do you work, what do you do |
| `ACTION` | quiz, flashcard, flash card, notes, regenerate, schedule, remind, revision |

**Order matters.** Check GREET / HELP / ACTION **before** anything that looks like a topic.

“Make a quiz about recursion” is `ACTION`, not `ASK`. If we search first, we waste retrieval and the model fakes a quiz in chat.

If `lecture_id` is missing and the message is not `GREET` or `HELP` → `NO_LECTURE`.

If nothing matches → do **not** guess. Go to layer 2 (or, in week 1, treat as `ASK` — see §5.4).

Layer 1 never calls the embedding model or the vector store.

### 5.2 Layer 2 — classify leftover messages

Used only when layer 1 does not match **and** a lecture is in scope (or you still need to distinguish `CHITCHAT` vs `ASK`).

Send **only** the user message. Do **not** send retrieved chunks (the classifier would start answering).

```text
Classify this message. Reply with exactly one label:
ASK      — question about the lecture or a topic in it
ACTION   — wants quiz, flashcards, notes, or a reminder
HELP     — how the app works
GREET    — greeting or thanks
CHITCHAT — other, not about the lecture

Message: "{user text}"
```

Settings: `temperature=0`, small `max_tokens` (e.g. 8). Parse the single label.

If the model returns garbage → default to `ASK` when a lecture is open (a wasted retrieval is better than dropping a real question).

This is **not** tool calling. The model returns a string we already know how to handle.

### 5.3 How the layers keep RAG clean

**Layer 1** blocks traffic that must never search (cheap, predictable): greetings, help, “make a quiz.”

**Layer 2** labels what slipped through: real lecture questions vs “test me on heaps” vs “what’s the weather?”

**RAG** is not a judge. It runs only after the final label is `ASK` and `lecture_id` is set.

Worked examples (lecture open unless noted):

| User text | Layer 1 | Layer 2 | RAG? |
| --- | --- | --- | --- |
| “hi” | `GREET` | skipped | No |
| “what can you do?” | `HELP` | skipped | No |
| “make a quiz” | `ACTION` | skipped | No |
| “make a quiz on recursion” | `ACTION` (`quiz`) | skipped | No |
| “thanks, make flashcards next” | `ACTION` | skipped | No |
| “What did they say about recursion?” | no match | `ASK` | **Yes** |
| “Tell me exactly what they discussed about two pointers” | no match | `ASK` | **Yes** |
| “Can you test me on the heap part?” | no match | `ACTION` | No |
| “What’s the weather?” | no match | `CHITCHAT` | No |
| Same ASK with **no** lecture | `NO_LECTURE` | skipped | No |

### 5.4 What to ship first

**Week 1:** Layer 1 + “every leftover with a lecture open is `ASK`.” Skip the classify call. Layer 1 already removed most non-questions; leftovers are almost all lecture questions. **One** LLM call per real question (the answer), not two.

**Add layer 2** when logs show leftovers that are not questions: “test me”, off-topic chat, “ignore the video, define heap in general.”

Do not start with embedding-based intent classification or a second dedicated model. Six intents and a lecture already in scope do not need it.

---

## 6. ASK path (RAG)

Only this path touches the vector store.

```text
ASK + lecture_id
  -> embed query (and/or keyword search over this lecture’s chunks)
  -> retrieve a small set of chunks for this video_id only
  -> LLM: answer using only those chunks
  -> return answer + citations [mm:ss]
```

Rules for the answer model:

- Use the retrieved text. Do not invent lecture content.
- Cite at least one timestamp when chunks have them (aligned with TRD FR-504).
- If chunks are irrelevant or empty, say we could not find it in this lecture.

Retrieval tuning (top-k, hybrid search, reranker) lives in the indexer / retrieval component, not in the router. v1 may keep retrieval simple; a small corpus per lecture does not require a heavy reranker.

---

## 7. API sketch

`POST /lectures/{video_id}/chat` (or `POST /chat` with `video_id` in the body)

**Request:** `{ "message": "..." }`

Optional later: `conversation_id` for short thread history.

**Response:**

```json
{
  "intent": "ASK",
  "action": null,
  "answer": "They introduce two pointers when …",
  "citations": [
    { "start_ts": 760, "end_ts": 810, "label": "12:40" }
  ]
}
```

For non-`ASK` intents, `citations` is empty and `answer` is the template (or a one-line model reply for `CHITCHAT` only).

The handler:

```text
intent = route(lecture_id, text)   # layer 1, then maybe layer 2

if intent == ASK:
    return rag_answer(lecture_id, text)
return template_reply(intent)
```

The API **must not** wait on Celery or call `.get()` on a task. Chat is a synchronous (or streamed) request on the `ASK` path only.

---

## 8. Observability and eval

Log every turn: `video_id`, `intent`, whether layer 2 ran, whether retrieval ran, latency, and a truncated message. Never log full transcripts in application logs (TRD SR-4).

**Router golden set (small):** ~20 rows of `message` → expected `intent`. Run in CI like the TRD gates, but this set is separate from retrieval/note quality.

When users miss (e.g. “test me” → wrongly `ASK`), add a phrase to layer 1 or turn on layer 2. Do not redesign the router until those logs exist.

---

## 9. v2 — agents (out of scope here)

v2 is when one utterance may **do** several things: “I didn’t get the last 15 minutes; quiz me on that, then make cards.”

Then the model may call tools in a loop. Keep tools small and **not** duplicates of the whole ingest job:

- `search_lecture` (topic or timestamp range)
- `make_quiz` / `make_flashcards` **scoped** to a topic or range
- `schedule_revision`

Do **not** expose whole-lecture `generate_notes` or raw `get_transcript` as the default tools; those belong to the job and the UI.

v1 chat budget and “up to 8 tool calls” do not apply until this lands. The v1 assistant stays a pipeline: **route → (maybe retrieve) → one answer.**

---

## 10. Summary

- v1 assistant = lecture-scoped Q&A. Artifacts stay in the UI. Agents wait for v2.
- Opening a lecture selects the corpus. Message type decides whether we search.
- Layer 1 (rules) drops greetings, help, and actions with no model and no RAG.
- Layer 2 (optional one-word classify) labels leftovers; week 1 may treat leftovers as `ASK`.
- Only `ASK` with a `lecture_id` hits RAG. The router never searches; the ASK handler does.
