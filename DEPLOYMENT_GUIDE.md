# Deployment Guide

## Deploy to Vercel (Recommended)

### Prerequisites
- GitHub account
- Vercel account (free at vercel.com)
- Your code pushed to GitHub

### Step-by-Step Deployment

#### 1. Push Your Code to GitHub
```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

#### 2. Deploy to Vercel

**Option A: Using Vercel Website (Easiest)**

1. Go to [vercel.com](https://vercel.com)
2. Click "Sign Up" and sign in with GitHub
3. Click "Add New Project"
4. Import your GitHub repository
5. Configure project:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

6. Add Environment Variables:
   - Click "Environment Variables"
   - Add each variable from your `.env` file:
     ```
     VITE_FIREBASE_API_KEY=your_api_key
     VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
     VITE_FIREBASE_PROJECT_ID=your_project_id
     VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
     VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
     VITE_FIREBASE_APP_ID=your_app_id
     ```

7. Click "Deploy"
8. Wait 2-3 minutes for deployment to complete
9. Your app will be live at: `https://your-project-name.vercel.app`

**Option B: Using Vercel CLI**

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy (from your project directory)
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? Select your account
# - Link to existing project? No
# - Project name? (press enter for default)
# - Directory? ./ (press enter)
# - Override settings? No

# Add environment variables
vercel env add VITE_FIREBASE_API_KEY
# Paste your API key when prompted
# Repeat for all environment variables

# Deploy to production
vercel --prod
```

#### 3. Configure Firebase for Your Domain

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to **Authentication** → **Settings** → **Authorized domains**
4. Add your Vercel domain: `your-project-name.vercel.app`
5. Click "Add domain"

#### 4. Update Firestore and Storage Rules (if needed)

Make sure your Firebase rules are properly configured for production:

**Firestore Rules** (already in `firestore.rules`):
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /publicChats/{chatId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.senderId;
    }
    
    match /privateChats/{chatId}/messages/{messageId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

**Storage Rules** (already in `storage.rules`):
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /profile-photos/{userId}/{fileName} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

Deploy these rules:
```bash
# Install Firebase CLI if not already installed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase (if not done)
firebase init

# Deploy rules
firebase deploy --only firestore:rules
firebase deploy --only storage:rules
```

---

## Deploy to Firebase Hosting (Alternative)

### Step-by-Step

#### 1. Install Firebase CLI
```bash
npm install -g firebase-tools
```

#### 2. Login to Firebase
```bash
firebase login
```

#### 3. Initialize Firebase Hosting
```bash
firebase init hosting

# Select options:
# - Use existing project
# - Public directory: dist
# - Single-page app: Yes
# - GitHub auto-deploy: No (optional)
```

#### 4. Build Your App
```bash
npm run build
```

#### 5. Deploy
```bash
firebase deploy --only hosting
```

Your app will be live at: `https://your-project-id.web.app`

#### 6. Add Custom Domain (Optional)
1. Go to Firebase Console → Hosting
2. Click "Add custom domain"
3. Follow the instructions to verify and connect your domain

---

## Environment Variables

**IMPORTANT**: Never commit your `.env` file to GitHub!

Your `.env` file should contain:
```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

Make sure `.env` is in your `.gitignore` file (it already is).

---

## Troubleshooting

### Build Fails
- Check that all dependencies are in `package.json`
- Run `npm install` locally and test `npm run build`
- Check build logs for specific errors

### Firebase Connection Issues
- Verify all environment variables are set correctly
- Check Firebase Console for authorized domains
- Ensure Firebase rules are deployed

### 404 Errors on Refresh
- Make sure `vercel.json` has the rewrite rule (already configured)
- For Firebase: Ensure single-page app option was selected

### Authentication Not Working
- Add your deployment domain to Firebase authorized domains
- Check that environment variables are set in Vercel/Firebase

---

## Continuous Deployment

### Vercel (Automatic)
Once connected to GitHub, Vercel automatically deploys:
- **Production**: Every push to `main` branch
- **Preview**: Every pull request

### Firebase (Manual or CI/CD)
Set up GitHub Actions for auto-deployment:

Create `.github/workflows/deploy.yml`:
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
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          channelId: live
          projectId: your-project-id
```

---

## Recommended: Vercel

**Why Vercel?**
- ✅ Easiest deployment process
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Automatic deployments from GitHub
- ✅ Preview deployments for PRs
- ✅ Free tier is generous
- ✅ Built for React/Vite apps

**Deployment Time**: ~3 minutes
**Cost**: Free for personal projects

---

## Post-Deployment Checklist

- [ ] App loads correctly
- [ ] Authentication works (sign up/login)
- [ ] Public chat works
- [ ] Private chats work
- [ ] Users list loads
- [ ] Images upload correctly
- [ ] Mobile responsive
- [ ] All environment variables set
- [ ] Firebase authorized domains configured
- [ ] Firestore rules deployed
- [ ] Storage rules deployed

---

## Support

If you encounter issues:
1. Check Vercel/Firebase deployment logs
2. Check browser console for errors
3. Verify Firebase configuration
4. Check that all environment variables are set correctly

Your app is now ready for production! 🚀
