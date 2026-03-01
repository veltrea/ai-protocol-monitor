# Changelog

## [0.2.0] - 2026-03-02

### Added
- **Streaming Support**: Implemented `log_api_event` in `bridge.py` to intercept real-time chunks from LiteLLM.
- **Dynamic Chunk Merging**: Updated Viewer UI (`App.tsx`) to merge streaming response chunks by `requestId`.
- **Metadata Inspector**: Added an expandable/collapsible JSON view for log metadata in the UI.
- **Dependency Management**: Added root `requirements.txt` for bridge dependencies (`websocket-client`, `litellm`).
- **Defensive Imports**: Added `HAS_WEBSOCKET` check in `bridge.py` to prevent crashes when dependencies are missing.

### Changed
- **Unified Branding**: Renamed all instances of `monitor` to `viewer` across the codebase, documentation, and samples.
- **Persistent Connections**: Refactored `bridge.py` to use a thread-safe, persistent WebSocket connection (Singleton pattern) instead of reconnecting for every event.
- **Improved Serialization**: Enhanced `ProxyHandler.serializer` to robustly handle complex LiteLLM/Pydantic objects and circular references.
- **Flexible Injection**: Updated `inject_bridge.sh` to allow path overrides via environment variables (`AI_PROTOCOL_VIEWER_ROOT`), improving portability.
- **Default UI Ports**: Adjusted Vite dev server configuration for better environment compatibility.

### Fixed
- Fixed a bug where frequent connections caused log loss in high-traffic scenarios.
- Fixed a naming inconsistency where `bridge.bridge` import paths were sensitive to the parent directory name.
- Fixed UI layout issues where large raw metadata dumps broke the terminal view flow.
