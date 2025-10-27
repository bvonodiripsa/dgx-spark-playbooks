#!/bin/bash

# Cleanup script to remove duplicated files after reorganization

echo "Cleaning up duplicated files and directories..."
echo

# Set up color for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to remove a file if it exists
remove_file() {
  if [ -f "$1" ]; then
    rm "$1"
    echo -e "${GREEN}✓${NC} Removed: $1"
  else
    echo -e "${RED}×${NC} Not found: $1"
  fi
}

# Function to remove a directory if it exists
remove_dir() {
  if [ -d "$1" ]; then
    rm -rf "$1"
    echo -e "${GREEN}✓${NC} Removed: $1/"
  else
    echo -e "${RED}×${NC} Not found: $1/"
  fi
}

echo "Removing Docker directory (now in deploy/docker/)..."
remove_dir "docker"

echo -e "\nRemoving Docker Compose files (now in deploy/compose/)..."
remove_file "docker-compose.yml"
remove_file "docker-compose.gnn.yml"
remove_file "docker-compose.neo4j.yml"

echo -e "\nRemoving frontend configuration files (now in frontend/)..."
remove_file "next.config.js"
remove_file "next.config.mjs"
remove_file "tsconfig.json"
remove_file "tailwind.config.ts"
remove_file "postcss.config.mjs"
remove_file "components.json"
remove_file "next-env.d.ts"
remove_file "next.env.d.ts"
remove_file "v0-user-next.config.mjs"

echo -e "\nCleanup complete!"
echo "Your project now has the following structure:"
find . -type d -maxdepth 2 -not -path "*/node_modules/*" -not -path "*/.git/*" -not -path "*/.next/*" | sort 