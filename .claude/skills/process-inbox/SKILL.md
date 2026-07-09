---
name: process-inbox
description: Triage new images dropped in inbox-pixiejourney.com/ at the repo root — catalog what's there, then optimize and file each one into the right place.
---

# Process Inbox

`inbox-pixiejourney.com/` (repo root, gitignored) is a drop folder for new art —
mostly ChatGPT/Midjourney-generated Lalah character art and site mockups. This
skill triages it. It does not run unattended: every batch needs a human call
on where borderline images go, so always report the catalog and confirm
before moving anything the first time a new image *shape* shows up.

## Steps

1. **List** every file in `inbox-pixiejourney.com/`. Skip if empty.
2. **View each image** and classify it:
   - **Finished, individually-usable art** (a single character pose or clean
     background, no baked-in UI chrome or text labels, transparent or plain
     background) — a real site asset candidate.
   - **Contact sheet / character library / icon grid** (multiple poses or
     icons combined in one image, usually with text captions baked in) —
     reference material, not directly usable on a page as-is.
   - **Homepage/page mockup** (a full or partial page composition with nav,
     copy, buttons) — a design concept/exploration, not a deployable asset.
   - **Design tokens / color system sheet** — reference documentation, not
     imagery.
3. **Report the catalog** to the user before moving anything: what each file
   is, its classification, and a proposed destination + filename. Flag
   anything that looks like a rebrand or naming inconsistency (e.g. mockups
   branded differently than the live site) rather than silently filing it.
4. **Route by classification** (confirm with the user first if a category
   hasn't been handled before, or if the batch is large/ambiguous):
   - Finished individual assets → optimize (`optipng -o2`, lossless — this is
     illustration art, not photography, so avoid lossy palette reduction
     unless the user asks) and move into `assets/`, following the existing
     `lalah-<descriptive-slug>.png` naming convention used there.
   - Contact sheets, icon libraries, mockups, and design-token sheets →
     `assets/design-concepts/` with a descriptive filename (e.g.
     `lalah-icon-library-v2-pixie-journey-brand.png`). This is reference
     material: preserve it, but do not wire it into any live page.
5. **Empty the inbox** once everything has a home (the folder itself is
   gitignored and untracked, so this is a plain filesystem move/delete, not a
   git operation).
6. Since `assets/` is tracked, make the actual file moves through the
   worktree flow (`uap worktree create`, commit inside
   `.worktrees/NNN-<slug>/`, PR, merge) rather than editing `main` directly —
   same as any other tracked-file change in this repo.
