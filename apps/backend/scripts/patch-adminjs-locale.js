#!/usr/bin/env node

/**
 * This script previously patched AdminJS locale assets. The assets were removed,
 * but the npm lifecycle hook still expects the script to exist. Make the hook a
 * no-op so production startup can proceed.
 */
console.info("[patch-adminjs-locale] No locale patch required – skipping.");
