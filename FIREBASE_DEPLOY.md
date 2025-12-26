# Deploy to Firebase Hosting

## Quick Firebase Deployment (10 Minutes)

### Prerequisites
- Node.js installed
- Firebase project already created (you have this)
- Firebase CLI installed

---

## Step 1: Install Firebase CLI (1 minute)

```bash
npm install -g firebase-tools
```

---

## Step 2: Login to Firebase (1 minute)

```bash
firebase login
```

This will open your browser. Sign in with your Google account.

---

## Step 3: Initialize Firebase Hosting (2 minutes)

```bash
firebase init hosting
```

**Answer the prompts:**

1. **Select a default Firebase project**
   - Choose your existing project from the list

2. **What do you want to use as your public directory?**
   - Type: `dist`

3. **Configure as a single-page app (rewrite all urls to /index.html)?**
   - Type: `y` (Yes)

4. **Set up automatic builds and deploys with GitHub?**
   - Type: `n` (No) - or `y` if you want auto-deploy

5. **File dist/index.html already exists. Overwrite?**
   - Type: `n` (No)

This creates `firebase.json` and `.firebaserc` files.

---

## Step 4: Build Your App (2 minutes)

```bash
npm run build
```

This creates the `dist` folder with your production build.

---

## Step 5: Deploy to Firebase (2 minutes)

```bash
firebase deploy --only hosting
```

Wait for deployment to complete...

**Done!** 🎉 Your app is live at:
- `https://YOUR-PROJECT-ID.web.app`
- `https://YOUR-PROJECT-ID.firebaseapp.com`

---

## Step 6: Update Firebase Auth Settings (1 minute)

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to **Authentication** → **Settings** → **Authorized domains**
4. Your Firebase hosting domains should already be there:
   - `YOUR-PROJECT-ID.web.app`
   - `YOUR-PROJECT-ID.firebaseapp.com`
5. If not, add them manually

---

## Deploy Firestore and Storage Rules (1 minute)

Deploy your security rules:

```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Storage rules
firebase deploy --only storage:rules

# Or deploy everything at once
firebase deploy
```

---

## Future Deployments

Every time you make changes:

```bash
# 1. Build the app
npm run build

# 2. Deploy
firebase deploy --only hosting
```

Or deploy everything (hosting + rules):
```bash
npm run build
firebase deploy
```

---

## Add Custom Domain (Optional)

1. Go to Firebase Console → Hosting
2. Click "Add custom domain"
3. Enter your domain (e.g., `myapp.com`)
4. Follow the verification steps
5. Add the DNS records to your domain provider
6. Wait for SSL certificate (can take up to 24 hours)

---

## Automatic Deployment with GitHub Actions

Create `.github/workflows/firebase-deploy.yml`:

```yaml
name: Deploy to Firebase Hosting

on:
  push:
    branches:
      - main

jobs:
  build_and_deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build
        run: npm run build
        env:
          VITE_FIREBASE_API_KEY: ${{ secrets.VITE_FIREBASE_API_KEY }}
          VITE_FIREBASE_AUTH_DOMAIN: ${{ secrets.VITE_FIREBASE_AUTH_DOMAIN }}
          VITE_FIREBASE_PROJECT_ID: ${{ secrets.VITE_FIREBASE_PROJECT_ID }}
          VITE_FIREBASE_STORAGE_BUCKET: ${{ secrets.VITE_FIREBASE_STORAGE_BUCKET }}
          VITE_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.VITE_FIREBASE_MESSAGING_SENDER_ID }}
          VITE_FIREBASE_APP_ID: ${{ secrets.VITE_FIREBASE_APP_ID }}
          
      - name: Deploy to Firebase
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          channelId: live
          projectId: ${{ secrets.FIREBASE_PROJECT_ID }}
```

**Setup GitHub Secrets:**
1. Go to your GitHub repo → Settings → Secrets and variables → Actions
2. Add all your environment variables as secrets
3. Generate Firebase service account:
   ```bash
   firebase init hosting:github
   ```
   Follow the prompts to connect GitHub

---

## Troubleshooting

### Build Fails
```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

### Deployment Fails
```bash
# Check Firebase CLI version
firebase --version

# Update Firebase CLI
npm install -g firebase-tools@latest

# Re-login
firebase logout
firebase login
```

### 404 Errors
- Make sure `firebase.json` has the rewrite rule (see below)
- Redeploy: `firebase deploy --only hosting`

### Authentication Issues
- Check authorized domains in Firebase Console
- Make sure your hosting URL is added

---

## Firebase Configuration Files

### `firebase.json` (created by init)
```json
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(jpg|jpeg|gif|png|svg|webp)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      },
      {
        "source": "**/*.@(js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      }
    ]
  },
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "storage": {
    "rules": "storage.rules"
  }
}
```

### `.firebaserc` (created by init)
```json
{
  "projects": {
    "default": "your-project-id"
  }
}
```

---

## Useful Commands

```bash
# View your deployed app
firebase open hosting:site

# View deployment history
firebase hosting:channel:list

# Deploy to preview channel (for testing)
firebase hosting:channel:deploy preview

# View logs
firebase functions:log

# Check project info
firebase projects:list
```

---

## Comparison: Firebase vs Vercel

### Firebase Hosting
✅ Integrated with Firebase services
✅ Free SSL certificate
✅ Global CDN
✅ Custom domains
✅ Good for Firebase-heavy apps
❌ Manual deployment (unless CI/CD setup)
❌ More setup steps

### Vercel
✅ Automatic GitHub deployments
✅ Preview deployments for PRs
✅ Easier setup
✅ Better DX (Developer Experience)
✅ Built for React/Vite
❌ Separate from Firebase

**Recommendation**: 
- Use **Firebase Hosting** if you want everything in one place
- Use **Vercel** if you want easier deployments and better DX

---

## Post-Deployment Checklist

- [ ] App loads at Firebase URL
- [ ] Authentication works
- [ ] Public chat works
- [ ] Private chats work
- [ ] Users list loads
- [ ] Images upload
- [ ] Firestore rules deployed
- [ ] Storage rules deployed
- [ ] Authorized domains configured

---

## Your Live URLs

After deployment, your app will be available at:
- **Primary**: `https://YOUR-PROJECT-ID.web.app`
- **Alternative**: `https://YOUR-PROJECT-ID.firebaseapp.com`

You can find your exact URLs by running:
```bash
firebase hosting:sites:list
```

---

## Need Help?

- Firebase Docs: https://firebase.google.com/docs/hosting
- Firebase CLI Reference: https://firebase.google.com/docs/cli
- Check deployment logs: `firebase deploy --debug`

Your app is ready to deploy to Firebase! 🚀
