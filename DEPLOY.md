# Deployment Instructions for GitHub

## Step 1: Create GitHub Repository

1. Go to [GitHub](https://github.com) and sign in
2. Click the **"+"** icon in the top right corner
3. Select **"New repository"**
4. Repository name: `colegios_cataluna`
5. Description: "Interactive map of schools in Catalonia, Spain"
6. Choose **Public** or **Private**
7. **DO NOT** initialize with README, .gitignore, or license (we already have these)
8. Click **"Create repository"**

## Step 2: Connect Local Repository to GitHub

After creating the repository, GitHub will show you commands. Use these:

```bash
# Add the remote repository (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/colegios_cataluna.git

# Push your code to GitHub
git push -u origin main
```

## Step 3: Update Homepage in package.json

Before deploying to GitHub Pages, update the homepage field in `package.json`:

1. Open `package.json`
2. Find the line: `"homepage": "https://YOUR_USERNAME.github.io/colegios_cataluna"`
3. Replace `YOUR_USERNAME` with your actual GitHub username
4. Save the file
5. Commit the change:
   ```bash
   git add package.json
   git commit -m "Update homepage for GitHub Pages"
   git push
   ```

## Step 4: Deploy to GitHub Pages

Once your code is on GitHub:

```bash
npm run deploy
```

This will:
1. Build your React app
2. Deploy it to the `gh-pages` branch
3. Make it available at: `https://YOUR_USERNAME.github.io/colegios_cataluna/`

## Step 5: Enable GitHub Pages (if needed)

1. Go to your repository on GitHub
2. Click **Settings**
3. Scroll to **Pages** section
4. Under **Source**, select **gh-pages** branch
5. Click **Save**

Your site will be live at: `https://YOUR_USERNAME.github.io/colegios_cataluna/`

## Troubleshooting

- If deployment fails, make sure you've updated the homepage in `package.json`
- The first deployment may take a few minutes
- After deployment, wait 1-2 minutes for GitHub Pages to update

