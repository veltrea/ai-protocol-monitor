# AI Protocol Viewer

A standalone, MIT-licensed utility for observing and debugging AI communication protocols.

## Overview

AI Protocol Viewer is designed for researchers and developers who need to inspect the real-time data exchange between AI models and external tools (Function Calling, MCP, etc.). It provides a clean, terminal-like interface to monitor requests, responses, and tool executions.

Implemented in **TypeScript**, it is specifically optimized for developers building **VS Code-based AI agents** or web-integrated AI tools, offering a familiar and highly extensible environment.

Initially created as a debugging aid for the Void Editor, this project has evolved into an independent tool to support a broader range of AI-tool orchestration frameworks.

## Key Features

- **Real-time Observation**: Monitor AI-tool communication via WebSocket.
- **Protocol Agnostic**: Designed to handle various JSON-based communication patterns.
- **Developer Friendly**: MIT Licensed, lightweight, and easy to integrate.
- **Filtering & Export**: Easily search through logs and export them as JSON for further analysis.

## Vision: Nanobot Integration

A primary goal for this project is to support [nanobot](https://github.com/HKUDS/nanobot). We aim to provide a way to "branch" the communication stream from nanobot and visualize it here, making it easier to understand how nanobot interacts with its environment.

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm
- **Python Dependencies** (for the bridge): `websocket-client`, `litellm`

### Installation

```bash
git clone https://github.com/veltrea/ai-protocol-viewer.git
cd ai-protocol-viewer
npm install
pip install -r requirements.txt  # Install bridge dependencies
```

### Running the Viewer

```bash
npm run dev
```

The viewer will be available at the URL provided by Vite (usually `http://localhost:5173`). It listens for logs on `ws://localhost:5175` by default.

## License

MIT License - See the [LICENSE](LICENSE) file for details.
