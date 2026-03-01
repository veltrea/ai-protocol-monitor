# Nanobot Viewer Example

This is a minimalist, pre-integrated example of [nanobot](https://github.com/HKUDS/nanobot) (lite version) designed to demonstrate the **AI Protocol Viewer** in action.

The AI Protocol Viewer is intentionally implemented in **TypeScript**, making it an ideal companion for developers building **VS Code-based AI agents** or extensions who want to integrate protocol observation directly into their web-standard toolchain.

## Overview

This example uses a stripped-down version of the `nanobot` core and includes the `bridge` integration out of the box. Every AI communication made by this agent is intercepted and sent to the AI Protocol Viewer for real-time observation.

## Prerequisites

- [uv](https://github.com/astral-sh/uv) (recommended) or Python 3.12+
- Node.js (for the Viewer)

## Getting Started

1. **Start the AI Protocol Viewer**:
   In the project root, run:
   ```bash
   npm run dev     # UI
   npm run server  # Log Server (WS: 5175)
   ```

2. **Run the Viewed Agent**:
   In this directory (`example/nanobot-viewer`), run:
   ```bash
   uv run viewer_agent.py "Your prompt here"
   ```
   *Note: If you don't have an API key, it will use a dummy key and may show an error in the console, but the intercepted **request** will still appear in the Protocol Viewer.*

## How it Works

The magic happens in `viewer_agent.py`:
- It imports `bridge.bridge.ProxyHandler`.
- It registers it as a `litellm.callbacks`.
- LiteLLM automatically triggers the handler for every request and response, which then forwards the data to the Viewer.

This setup is **Zero-Touch** — the actual `nanobot` logic is not modified to support logging!
