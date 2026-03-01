#!/bin/bash

# Injection script for Nanobot with AI Protocol Viewer Bridge
# Usage: ./inject_bridge.sh [nanobot-cli-args]

# Get the directory of this script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
PROJECT_ROOT="$( dirname "$SCRIPT_DIR" )"
UPSTREAM_DIR="$PROJECT_ROOT/upstream/nanobot-vanilla"

# Set PYTHONPATH to include the bridge module and nanobot's source
export PYTHONPATH="$PROJECT_ROOT:$UPSTREAM_DIR:$PYTHONPATH"

# Enable LiteLLM callbacks
export LITELLM_CALLBACKS="bridge.bridge.ProxyHandler"

# Run nanobot
echo "Launching Nanobot with Protocol Viewer Bridge..."
echo "Bridge: bridge.bridge.ProxyHandler"
python3 -m nanobot "$@"
