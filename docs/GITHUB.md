# Git & GitHub (Hackathon)

Push from **your terminal** using your GitHub account (`ch1mkin`). Do not use Cursor Cloud Agent or any Cursor GitHub integration to push — that can add Cursor as a repo collaborator.

## One-time: refresh GitHub CLI

```bash
gh auth login -h github.com
```

Choose: GitHub.com → HTTPS → Login with browser.

## Create the remote repo (first time only)

From the project root:

```bash
gh repo create transitops --public --description "Smart Transport Operations Platform — hackathon project" --source=. --remote=origin --push
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
git remote add origin https://github.com/ch1mkin/transitops.git
git branch -M main
git push -u origin main
```
