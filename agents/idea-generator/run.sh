#!/bin/bash
# Agent Tank Idea Generator Runner
# Usage: ./run.sh [--count N] [--category CATEGORY] [--dry-run]

cd "$(dirname "$0")"
node generator.cjs "$@"
