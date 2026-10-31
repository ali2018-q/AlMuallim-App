# Publish this project to GitHub

1. Create a new empty repository named `Al-Muallim` in your GitHub account.
2. Do not initialize it with README/license/gitignore because these files already exist here.
3. Extract this ZIP locally.
4. In the extracted folder, run:

```bash
git init
git add .
git commit -m "chore: initialize Al-Muallim project"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/Al-Muallim.git
git push -u origin main
```

5. Open the repository Actions tab and review CI runs.
6. Add Firebase credentials only through secure GitHub secrets or local untracked files; never commit private keys.

For Android Studio users, opening the extracted folder and allowing Gradle sync is the simplest local setup.
