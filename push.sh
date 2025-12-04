#!/bin/bash

# push.sh - Script to push changes to GitHub

echo "🚀 Preparing to push changes..."

# Add all changes (including deletions of admin, blog, generate-blog-index.js)
git add -A

# Commit changes
echo "📦 Committing changes..."
git commit -m "feat: Migrate blog to Supabase

- Removed legacy admin/ directory (Decap CMS)
- Removed legacy blog/ directory (Markdown posts)
- Removed generate-blog-index.js
- Added Supabase admin panel (admin-supabase/)
- Updated blog.html to fetch from Supabase API
- Updated deployment workflow for new structure"

# Push to main branch
echo "⬆️ Pushing to GitHub..."
git push origin main

echo "✅ Done! Changes pushed to GitHub."
echo "   - The 'admin' and 'blog' directories will be removed from the repo."
echo "   - The deployment workflow will trigger automatically."
