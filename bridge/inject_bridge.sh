#!/bin/bash

# Injection script for Nanobot with AI Protocol Viewer Bridge
# Usage: ./inject_bridge.sh [nanobot-cli-args]

# Use environment variables if set, otherwise find relative to script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
PROJECT_ROOT="${AI_PROTOCOL_VIEWER_ROOT:-$( dirname "$SCRIPT_DIR" )}"
UPSTREAM_DIR="${NANOBOT_UPSTREAM_DIR:-$PROJECT_ROOT/upstream/nanobot-vanilla}"

echo "[Bridge] Project Root: $PROJECT_ROOT"
echo "[Bridge] Upstream Nanobot: $UPSTREAM_DIR"

if [ ! -d "$UPSTREAM_DIR" ]; then
    echo "Error: NANOBOT_UPSTREAM_DIR not found at $UPSTREAM_DIR"
    exit 1
fi

# Set PYTHONPATH to include the bridge module and nanobot's source
# We add PROJECT_ROOT so that 'bridge.bridge' is importable regardless of directory name
export PYTHONPATH="$PROJECT_ROOT:$UPSTREAM_DIR:$PYTHONPATH"

# Enable LiteLLM callbacks
export LITELLM_CALLBACKS="bridge.bridge.ProxyHandler"

# Run nanobot
echo "Launching Nanobot with Protocol Viewer Bridge..."
python3 -m nanobot "$@"
