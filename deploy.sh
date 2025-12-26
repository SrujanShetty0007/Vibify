#!/bin/bash

# Firebase Deployment Script
# This script builds and deploys your app to Firebase Hosting

echo "🚀 Starting Firebase Deployment..."
echo ""

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null
then
    echo "❌ Firebase CLI is not installed"
    echo "📦 Installing Firebase CLI..."
    npm install -g firebase-tools
fi

# Check if user is logged in
echo "🔐 Checking Firebase authentication..."
firebase login:list

# Build the app
echo ""
echo "🔨 Building the app..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "✅ Build successful!"
echo ""

# Deploy to Firebase
echo "🚀 Deploying to Firebase Hosting..."
firebase deploy --only hosting

if [ $? -ne 0 ]; then
    echo "❌ Deployment failed!"
    exit 1
fi

echo ""
echo "✅ Deployment successful!"
echo ""
echo "🌐 Your app is live!"
echo "📱 Check your Firebase Console for the URL"
echo ""
