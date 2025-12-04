#!/bin/bash

# Check if a commit message was provided
if [ -z "$1" ]; then
  echo "Error: Please provide a commit message."
  echo "Usage: ./push.sh \"Your commit message\""
  exit 1
fi

echo "Adding all changes..."
git add .

echo "Committing with message: $1"
git commit -m "$1"

echo "Pushing to origin main..."
git push origin main

echo "Done! 🚀"
