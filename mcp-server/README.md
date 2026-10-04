# LibraryLens AI — MCP Research Server

This directory contains the Python Model Context Protocol (MCP) server that powers the live research discovery layer using **SerpApi Search Tools**.

## Features

- **MCP Tools List & Call Protocol**: Supports standard MCP tool discovery (`/tools/list`) and invocation (`/tools/call`).
- **SerpApi `web_search`**: Utilizes `from serpapi_search_tools import web_search` configured with Google Light and Google engines for fast, compact, official documentation and release research.
- **SerpApi `news_search`**: Utilizes `from serpapi_search_tools import news_search` for keyword-level Google News discovery on breaking updates, release announcements, and security advisories.
- **SerpApi `images_search`**: Utilizes `from serpapi_search_tools import images_search` for optional visual references (architecture diagrams, logos) with strict copyright notices and source attribution.
- **Resilient Fallback**: Gracefully handles missing API keys without throwing unhandled exceptions or crashing the main research orchestrator.

## Installation

```bash
python -m venv .venv
# On Windows:
.venv\Scripts\activate
# On Linux/macOS:
source .venv/bin/activate

pip install -r requirements.txt
```

## Running the Server

```bash
# Windows
.venv\Scripts\python.exe server.py
```

Runs by default on `http://127.0.0.1:5005`.
