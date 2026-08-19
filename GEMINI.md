# GEMINI.md — Playlore

Gemini CLI supports an `@` import that inlines another file into the context, so this
file stays thin and pulls in the shared rules rather than forking a second copy that will
drift. Verified against `google-gemini/gemini-cli` `docs/reference/memport.md`: the syntax
is `@` followed by a path, imports are processed by default, circular imports are
detected, and the maximum depth is 5.

@./AGENTS.md

---

## Gemini-specific notes

**If the import above did not resolve**, read [`AGENTS.md`](AGENTS.md) and
[`CLAUDE.md`](CLAUDE.md) directly — they carry the full rules. The import path must stay
inside the project root; Gemini CLI rejects anything that resolves outside it as a path
traversal attempt.

**Gemini CLI does not read `AGENTS.md` on its own.** Its default context filename is
`GEMINI.md` and there is no built-in fallback. To have it pick up `AGENTS.md` directly as
well, add `.gemini/settings.json`:

```json
{ "context": { "fileName": ["AGENTS.md", "GEMINI.md"] } }
```

That is not required here, because the `@./AGENTS.md` import above already brings the
content in.

**To inspect what actually loaded**, use `/memory show` for the concatenated context and
`/memory reload` to re-read it after editing this file. Some published documentation
still shows `/memory refresh` and `/memory add`; neither exists in the current source.
