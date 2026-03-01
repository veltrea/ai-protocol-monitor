# Concept: AI Protocol Viewer

## Background
AI Protocol Viewer was originally developed as a minor utility to facilitate the debugging of the Void Editor. However, given that the Void Editor is licensed under Apache 2.0, and there is a strong preference to distribute original contributions under the MIT license, the decision was made to establish this as a standalone, independent project.

## Vision and Objective
The primary objective is to evolve this utility into a lightweight, MIT-licensed tool specialized for observing AI communication protocols. While its current functionality is tethered to the Void Editor, the future direction is to provide a general-purpose interface for inspecting the "dialogue" and data exchange between AI models and various external tools.

## Key Features & Use Cases
- **Protocol Observation**: Real-time monitoring of communication between AI agents and toolsets.
- **MIT Licensed**: Ensuring the core debugging and observation logic remains open and easily redistributable.
- **Tool Integration**: A primary target for early integration is [nanobot](https://github.com/HKUDS/nanobot). The goal is to "branch" its AI communication stream and display it within this viewer, providing a clear visual representation of its internal tool-calling processes.

## Future Plans
- decouple Void Editor specific logic.
- Implement a standardized protocol for tool-to-viewer communication.
- Expand support for other popular AI-tool orchestration frameworks.
