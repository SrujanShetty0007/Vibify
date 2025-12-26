# Push to GitHub Repository

## Commands to Run

Run these commands in your terminal (in order):

```bash
# 1. Initialize git (if not already done)
git init

# 2. Add all files
git add .

# 3. Commit your changes
git commit -m "Initial commit - College Chat App"

# 4. Add the remote repository
git remote add origin https://github.com/SrujanShetty0007/Vibify.git

# 5. Set the branch to main
git branch -M main

# 6. Push to GitHub
git push -u origin main
```

## If Repository Already Has Content

If the repository already has files and you get an error, use:

```bash
# Force push (WARNING: This will overwrite existing content)
git push -u origin main --force
```

Or merge existing content:

```bash
# Pull existing content first
git pull origin main --allow-unrelated-histories

# Then push
git push -u origin main
```

## Verify Push

After pushing, visit:
https://github.com/SrujanShetty0007/Vibify

You should see all your files there!

## Next Steps

After pushing to GitHub:

1. **Deploy to Vercel** (Recommended):
   - Go to [vercel.com](https://vercel.com)
   - Sign in with GitHub
   - Import the Vibify repository
   - Add environment variables
   - Deploy!

2. **Or Deploy to Firebase**:
   ```bash
   npm run deploy:firebase
   ```

See `QUICK_DEPLOY.md` for detailed deployment instructions.
