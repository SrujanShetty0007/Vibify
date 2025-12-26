#!/bin/bash

echo "========================================"
echo "   Pushing to GitHub Repository"
echo "========================================"
echo ""

# Check if git is installed
if ! command -v git &> /dev/null
then
    echo "❌ Git is not installed!"
    echo "Please install Git from: https://git-scm.com"
    exit 1
fi

echo "📦 Initializing git repository..."
git init

echo ""
echo "📝 Adding all files..."
git add .

echo ""
echo "💾 Committing changes..."
git commit -m "Initial commit - College Chat App"

echo ""
echo "🔗 Adding remote repository..."
git remote remove origin 2>/dev/null
git remote add origin https://github.com/SrujanShetty0007/Vibify.git

echo ""
echo "🌿 Setting branch to main..."
git branch -M main

echo ""
echo "🚀 Pushing to GitHub..."
git push -u origin main

if [ $? -ne 0 ]; then
    echo ""
    echo "⚠️  Push failed! This might be because the repository already has content."
    echo ""
    read -p "Would you like to force push? (This will overwrite existing content) [yes/no]: " FORCE_PUSH
    
    if [ "$FORCE_PUSH" = "yes" ]; then
        echo ""
        echo "🚀 Force pushing to GitHub..."
        git push -u origin main --force
        
        if [ $? -eq 0 ]; then
            echo ""
            echo "✅ Successfully pushed to GitHub!"
        else
            echo ""
            echo "❌ Force push failed!"
            echo "Please check your GitHub credentials and repository access."
        fi
    else
        echo ""
        echo "❌ Push cancelled."
    fi
else
    echo ""
    echo "✅ Successfully pushed to GitHub!"
fi

echo ""
echo "🌐 View your repository at:"
echo "https://github.com/SrujanShetty0007/Vibify"
echo ""
echo "📖 Next steps:"
echo "1. Deploy to Vercel: See QUICK_DEPLOY.md"
echo "2. Or deploy to Firebase: npm run deploy:firebase"
echo ""
