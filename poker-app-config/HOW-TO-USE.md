# How to load these directions

Two pieces load by different mechanisms. Both are needed.

- `CLAUDE.md` — the always-on overview. Loads because it sits in (or is imported
  into) the repo root.
- `rules/*.md` — the topic files. These only work from `.claude/rules/`, because
  that is the only place Claude Code reads `paths:` frontmatter.

## This folder is canonical — it already is installed

**There is no Desktop copy.** One existed until 6 Sep 2026, diverged, and spent
an hour serving stale answers before being deleted. Do not make another — edit
these files here, in the repo.

```
poker-ledger/
├── CLAUDE.md                     @~/Desktop/claude-config/CLAUDE.md
│                                 @poker-app-config/CLAUDE.md
├── .claude/rules -> ../poker-app-config/rules
└── poker-app-config/             <- you are here, canonical
```

The symlink is what makes `paths:` frontmatter work: Claude Code reads
path-scoped rules only from `.claude/rules/`. All of it is committed, so it
travels with a clone.

To rebuild the wiring from scratch:

```sh
cd ~/Desktop/"Claude Code Test"/poker-ledger
printf '@poker-app-config/CLAUDE.md\n' > CLAUDE.md
mkdir -p .claude && ln -s ../poker-app-config/rules .claude/rules
```


## Check it worked

Run `/context` in a session:

- **Memory files** should list `CLAUDE.md` and the two always-on rules.
- The path-scoped files will **not** appear until Claude reads a matching file.
  That is correct, not a failure. Open `site.css` and `20-design.md` loads.

To see exactly what loaded and when, use the `InstructionsLoaded` hook.

## Editing

Change the topic file, add a dated line to `CHANGELOG.md`. The changelog is the
whole point of the split — it is where you see what moved between sessions.

## What is canonical

1. `docs/launch-runbook.md` — launch order, rollback, PIPA breach handling.
2. `~/Desktop/launch-kit/` — the 312-rule audit rulebook.
3. These files, which summarise both.

Where they disagree, the higher one wins and these are stale. Re-check after any
change to monetization, advertising, or payments — those three move the app
across a legal line.
