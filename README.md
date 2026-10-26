# Spark Lab

Ideas = GitHub Issues. This site just displays them.

## Setup
1. Create a **public** GitHub repo (e.g. `idea-board`) and push this folder's contents to it.
2. Edit `config.js`: set `repo` to `your-username/idea-board`.
3. Repo → Settings → Pages → Deploy from branch → `main` / root.
4. Create labels: `status:spark`, `status:exploring`, `status:building` (closing an issue = done).
5. Repo → Settings → Collaborators → invite your friend.

## Workflow
- Capture: "+ Capture idea" button (or the Issues tab / GitHub mobile app).
- Claim: assign the issue to yourself.
- Progress: change the status label; discuss in comments; close when done.

Note: unauthenticated GitHub API allows 60 requests/hour per visitor, plenty for this.

## Markdown backup / progress log
`.github/workflows/sync-ideas.yml` writes every idea to `ideas/NNN-title.md` (status, owners, description, and all comments as a dated progress log) whenever an issue or comment changes. Read these files to see what has been done so far, even offline. Edit ideas on GitHub (the issue), not in the files; they are overwritten on the next sync.
