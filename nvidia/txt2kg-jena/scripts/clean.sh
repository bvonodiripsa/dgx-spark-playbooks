#!/bin/bash
echo "Cleaning project..."
rm -rf node_modules
rm -rf .next
rm -rf .pnpm-store
echo "Clearing pnpm cache..."
pnpm store prune
echo "Installing dependencies..."
pnpm install
echo "Done!"
