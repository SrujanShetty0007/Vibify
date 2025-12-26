@echo off
REM Firebase Deployment Script for Windows
REM This script builds and deploys your app to Firebase Hosting

echo 🚀 Starting Firebase Deployment...
echo.

REM Check if Firebase CLI is installed
where firebase >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Firebase CLI is not installed
    echo 📦 Installing Firebase CLI...
    npm install -g firebase-tools
)

REM Check if user is logged in
echo 🔐 Checking Firebase authentication...
firebase login:list

REM Build the app
echo.
echo 🔨 Building the app...
call npm run build

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Build failed!
    exit /b 1
)

echo ✅ Build successful!
echo.

REM Deploy to Firebase
echo 🚀 Deploying to Firebase Hosting...
firebase deploy --only hosting

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Deployment failed!
    exit /b 1
)

echo.
echo ✅ Deployment successful!
echo.
echo 🌐 Your app is live!
echo 📱 Check your Firebase Console for the URL
echo.
pause
