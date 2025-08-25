#!/bin/bash

# Nebulark Subdomain Deployment Script
# This script helps deploy the Nebulark website with subdomain support

echo "🚀 Nebulark Subdomain Deployment Script"
echo "======================================"

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI is not installed. Please install it first:"
    echo "npm i -g vercel"
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

echo "📦 Installing dependencies..."
npm install --legacy-peer-deps

echo "🔨 Building project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please check the errors above."
    exit 1
fi

echo "✅ Build successful!"

echo "🌐 Deploying to Vercel..."
vercel --prod

echo ""
echo "🎉 Deployment completed!"
echo ""
echo "📋 Next steps:"
echo "1. Go to your Vercel dashboard"
echo "2. Navigate to your project settings"
echo "3. Go to 'Domains' section"
echo "4. Add these custom domains:"
echo "   - nebulark.net"
echo "   - academy.nebulark.net"
echo "   - studio.nebulark.net"
echo ""
echo "5. Update your DNS provider with the provided records"
echo "6. Wait for DNS propagation (up to 48 hours)"
echo ""
echo "🔍 Test your subdomains:"
echo "   - https://nebulark.net"
echo "   - https://academy.nebulark.net"
echo "   - https://studio.nebulark.net"
