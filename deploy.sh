#!/bin/bash

# Deploy to Cloudflare Workers
# Run: ./deploy.sh

echo "Deploying sitemaps to Cloudflare Workers..."
wrangler deploy

echo "✅ Deployed! Your sitemap is live at: https://yourdomain.com/sitemap.xml"
