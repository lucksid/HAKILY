#!/bin/bash

echo "Preparing for GitHub Pages deployment..."

# Build the client-side application
echo "Building the client application..."
npx vite build --outDir=gh-pages

# Copy the index.html to the build directory
echo "Copying main index.html for GitHub Pages..."
cp index.html gh-pages/

# Create a .nojekyll file to prevent GitHub from processing with Jekyll
echo "Creating .nojekyll file..."
touch gh-pages/.nojekyll

# Deploy to GitHub Pages using gh-pages
echo "Deploying to GitHub Pages..."
npx gh-pages -d gh-pages

echo "Deployment complete! Your app should be available at your GitHub Pages URL soon."
echo "If this is your first deployment, it may take a few minutes for GitHub to process your pages."