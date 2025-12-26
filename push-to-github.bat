@echo off
echo ========================================
echo   Pushing to GitHub Repository
echo ========================================
echo.

REM Check if git is installed
where git >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Git is not installed!
    echo Please install Git from: https://git-scm.com/download/win
    pause
    exit /b 1
)

echo 📦 Initializing git repository...
git init

echo.
echo 📝 Adding all files...
git add .

echo.
echo 💾 Committing changes...
git commit -m "Initial commit - College Chat App"

echo.
echo 🔗 Adding remote repository...
git remote remove origin 2>nul
git remote add origin https://github.com/SrujanShetty0007/Vibify.git

echo.
echo 🌿 Setting branch to main...
git branch -M main

echo.
echo 🚀 Pushing to GitHub...
git push -u origin main

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ⚠️  Push failed! This might be because the repository already has content.
    echo.
    echo Would you like to force push? (This will overwrite existing content)
    echo Type 'yes' to force push, or 'no' to cancel:
    set /p FORCE_PUSH=
    
    if /i "%FORCE_PUSH%"=="yes" (
        echo.
        echo 🚀 Force pushing to GitHub...
        git push -u origin main --force
        
        if %ERRORLEVEL% EQU 0 (
            echo.
            echo ✅ Successfully pushed to GitHub!
        ) else (
            echo.
            echo ❌ Force push failed!
            echo Please check your GitHub credentials and repository access.
        )
    ) else (
        echo.
        echo ❌ Push cancelled.
    )
) else (
    echo.
    echo ✅ Successfully pushed to GitHub!
)

echo.
echo 🌐 View your repository at:
echo https://github.com/SrujanShetty0007/Vibify
echo.
echo 📖 Next steps:
echo 1. Deploy to Vercel: See QUICK_DEPLOY.md
echo 2. Or deploy to Firebase: npm run deploy:firebase
echo.
pause
