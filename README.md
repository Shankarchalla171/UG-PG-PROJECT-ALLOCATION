# UG-PG-PROJECT-ALLOCATION

This repository contains the FrontEnd and BackEnd for the UG/PG Project Allocation application.

## FrontEnd

The frontend is a React app located in the FrontEnd directory.

**Prerequisites:**
- Node.js (LTS recommended, >=16)
- npm (or yarn/pnpm)

**Quick setup:**

1. Change to the frontend folder:

```
cd FrontEnd
```

2. Install dependencies:

```
npm install
```

3. Run the development server:

```
npm run dev
```

4. Build for production:

```
npm run build
```


If your environment uses `yarn` or `pnpm`, replace `npm` commands accordingly.

## Git: Branching, pushing and merging

Follow these steps to create a branch with your name, push it, and merge it back into `main`.

**Create a branch (replace `<your-name>` with your name or handle):**

```
git checkout -b <your-name>
```

Make your changes, then commit:

```
git add .
git commit -m "feat(frontend): brief description"
```

Push the branch to origin:

```
git push -u origin <your-name>
```

Create a Pull Request on your Git hosting provider (GitHub/GitLab/Bitbucket) and merge via the web UI. Alternatively, merge locally:

```
git checkout main
git pull origin main
git merge --no-ff <your-name> -m "Merge <your-name>"
git push origin main
```

After merging you can delete the branch:

```
git branch -d <your-name>
git push origin --delete <your-name>
```

Recommended: use PRs for code review and CI checks before merging.

## BackEnd

Backend setup will be added later. For now this section is a placeholder.

## Where to find things

- Frontend code: [FrontEnd](FrontEnd)
- Backend code: BackEnd (placeholder)

---

If you want, I can also create the branch and open a PR for you locally — tell me the branch name to use and whether you want me to merge it after creating the PR.
