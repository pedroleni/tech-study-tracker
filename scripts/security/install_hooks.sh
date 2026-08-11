#!/usr/bin/env bash
# install_hooks.sh — Point this repo's git hooks at the tracked .githooks/ directory
# Usage: bash scripts/security/install_hooks.sh [project_root]
set -euo pipefail

PROJECT_ROOT="${1:-.}"
cd "$PROJECT_ROOT"

if ! git rev-parse --show-toplevel >/dev/null 2>&1; then
    echo "Not a git repository: $PROJECT_ROOT" >&2
    exit 1
fi

chmod +x .githooks/pre-commit
git config core.hooksPath .githooks

echo "✓ core.hooksPath set to .githooks — pre-commit secrets scan is now active."
echo "  Bypass only when truly necessary with: git commit --no-verify"
