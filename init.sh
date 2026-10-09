#!/usr/bin/env bash
# PocketReview agent harness bootstrap (Unix / Git Bash)
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"
echo "==> Working directory: $PWD"
npm ci
npm run verify
echo "Baseline verified. Start development with npm run dev."
