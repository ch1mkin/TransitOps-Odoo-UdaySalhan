# Git & GitHub (Hackathon)

Push from **your terminal** using your GitHub account (`ch1mkin`). Do not use Cursor Cloud Agent or any Cursor GitHub integration to push — that can add Cursor as a repo collaborator.

## Hide `cursoragent` from GitHub contributors

GitHub lists **cursoragent** when commits include this trailer:

```
Co-authored-by: Cursor <cursoragent@cursor.com>
```

Cursor adds it automatically to agent-made commits.

### Fix (one-time, if it already happened)

```bash
# Rewrite the latest commit without the co-author line (root commit example)
TREE=$(git rev-parse 'HEAD^{tree}')
NEW=$(git commit-tree "$TREE" -m "Your commit message here")
git update-ref refs/heads/main "$NEW"
git push --force-with-lease origin main
```

### Prevent it on future commits

1. **Cursor setting:** Settings → Agents → disable **Attribution** / co-author on commits (wording may vary by Cursor version).
2. **Local hook** (already in this repo): copy `.githooks/prepare-commit-msg` to `.git/hooks/prepare-commit-msg` and `chmod +x` it — strips the Cursor co-author line before each commit.
3. **Commit from an external terminal** (iTerm, Terminal.app) instead of Cursor’s integrated terminal when possible.

Only **commit authors** count toward contributors — you do not need to remove anyone from repo Collaborators if the issue is co-author trailers.

## One-time: refresh GitHub CLI

```bash
gh auth login -h github.com
```

Choose: GitHub.com → HTTPS → Login with browser.

## Create the remote repo (first time only)

From the project root:

```bash
gh repo create TransitOps-Odoo-UdaySalhan --public --description "Smart Transport Operations Platform — hackathon project" --source=. --remote=origin --push
```

If the name `transitops` is taken, pick another:

```bash
gh repo create transitops-fleet --public --source=. --remote=origin --push
```

## Day-to-day pushes

```bash
git add .
git commit -m "Your message here"
git push origin main
```

All commits use your local git identity (`Uday Salhan` / your GitHub noreply email). Cursor is never added as a collaborator when you push this way.

## Manual alternative (no gh CLI)

1. Create an empty repo on [github.com/new](https://github.com/new) — **do not** add README, .gitignore, or license.
2. Run:

```bash
git remote add origin https://github.com/ch1mkin/TransitOps-Odoo-UdaySalhan.git
git branch -M main
git push -u origin main
```
