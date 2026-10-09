**LibraryLens — Search Less. Research Smarter. Decide with Evidence.**
### Evidence-Backed AI Research & Technical Decision Intelligence

**LibraryLens** is an AI-powered research platform that helps developers evaluate software libraries and compare AI models using live search, package registries, release information, and source-backed evidence.

Instead of relying solely on static knowledge or generic AI answers, LibraryLens combines **Google Gemini, SerpApi, Model Context Protocol (MCP), and direct technical data sources** to investigate technologies, validate claims, compare alternatives, and generate explainable recommendations.

> **NO SOURCE = NO FACT**

---

## Table of Contents

* [Problem Statement](#problem-statement)
* [Solution](#solution)
* [Key Features](#key-features)
* [How It Works](#how-it-works)
* [SerpApi and MCP Integration](#serpapi-and-mcp-integration)
* [Technology Stack](#technology-stack)
* [Installation](#installation)
* [Environment Variables](#environment-variables)
* [Running the Application](#running-the-application)
* [Example Use Cases](#example-use-cases)
* [Architecture](#architecture)
* [Security](#security)
* [Limitations](#limitations)
* [Roadmap](#roadmap)
* [Demo and Links](#demo-and-links)

---

## Problem Statement

Developers face several challenges when selecting technologies:

* **Outdated information:** AI-generated recommendations may reference deprecated APIs, old versions, or incorrect specifications.
* **Rapid model evolution:** AI models change frequently in their capabilities, pricing, and availability.
* **Fragmented research:** Technical evidence is scattered across documentation, GitHub, package registries, changelogs, and news.
* **Unverifiable claims:** Many comparison tools present conclusions without sufficient supporting evidence.
* **Time-consuming decisions:** Engineers must manually gather and reconcile information before choosing a technology.

## Our Solution

LibraryLens transforms technical research into an evidence-driven decision workflow.

Users can compare software libraries, investigate AI models, specify project requirements, and examine supporting sources before making a decision.

The platform focuses on four principles:

1. **Research** — Retrieve relevant, current information from external sources.
2. **Verify** — Validate claims against collected evidence and source URLs.
3. **Compare** — Evaluate technical capabilities, specifications, and trade-offs.
4. **Recommend** — Match available evidence to the user's requirements.

When sufficient evidence cannot be found, the system is designed to report insufficient evidence rather than invent unsupported facts.

---

## Key Features

| Feature                          | Description                                                                                     |
| -------------------------------- | ----------------------------------------------------------------------------------------------- |
| AI Model Comparison              | Compare documented context limits, input/output pricing, and capabilities.                      |
| AI Model Recommendations         | Analyze user requirements and identify potentially suitable models.                             |
| Software Library Research        | Investigate package metadata, releases, architecture, and technical trade-offs.                 |
| SerpApi-Powered Search           | Retrieve relevant web results, news, and visual references.                                     |
| MCP Integration                  | Expose search capabilities to the backend through a dedicated Python MCP service.               |
| Evidence and Citation Validation | Check generated citations against retrieved source information.                                 |
| Claim Challenge                  | Trigger targeted research to investigate a specific claim or recommendation.                    |
| Model Radar                      | Discover new, updated, or deprecated models through provider catalog integrations.              |
| Live Research Progress           | Stream research activity to the frontend using Server-Sent Events (SSE).                        |
| Package Ecosystem Detection      | Resolve packages across npm, PyPI, and crates.io.                                               |
| Research History                 | Store reports and support version review and research-step replay.                              |
| Export and Sharing               | Support Markdown export, print-friendly PDF output, clipboard copy, and shareable report links. |
| Resilient Storage                | Use MongoDB persistence with an in-memory fallback when configured and available.               |

---

## How It Works

```text
User Requirements
       |
       v
React + Vite Frontend
       |
       v
Node.js + Express Backend
       |
       +---------------------------+
       |                           |
       v                           v
Python MCP Server           Direct Data Sources
       |                    npm / PyPI / crates.io
       v                    GitHub Releases
SerpApi Search              AI Provider Catalogs
Web / News / Images                |
       |                           |
       +-------------+-------------+
                     |
                     v
              Evidence Collector
                     |
                     v
           Deduplication & Ranking
                     |
                     v
          Citation / Claim Validation
                     |
                     v
              Google Gemini
                     |
                     v
       Comparison / Research Report
                     |
                     v
             MongoDB / Cache
                     |
                     v
             Frontend Results
```

### Research Workflow

1. The user submits a library comparison, model comparison, or recommendation request.
2. The backend normalizes names and identifies relevant technical ecosystems.
3. Search tools and direct data-source integrations retrieve relevant information.
4. The evidence layer deduplicates and ranks the collected sources.
5. Gemini analyzes the available evidence and generates a structured report.
6. Citation validation checks references against the retrieved sources.
7. The backend stores the report and streams progress and results to the frontend.

---

## SerpApi and MCP Integration

SerpApi is a core part of LibraryLens's external research layer.

The project uses a dedicated Python MCP service to make search functionality available to the Node.js backend.

### SerpApi capabilities

* **Web search:** Discover relevant technical documentation and web pages.
* **News search:** Investigate announcements and recent developments.
* **Image search:** Retrieve visual references where useful.

### Why MCP?

The Model Context Protocol provides a standardized interface for connecting compatible AI workflows with external tools. By separating the search service from the main backend, LibraryLens keeps search integration modular and easier to maintain.

### Why SerpApi matters

Technical ecosystems change continuously. SerpApi allows LibraryLens to retrieve relevant external information at research time, rather than depending entirely on information embedded in an AI model.

The retrieved results are then processed by the evidence and reasoning layers to support source-backed technical analysis.

**SerpApi retrieves information. MCP connects the tools. Gemini reasons over the evidence. LibraryLens delivers the research experience.**

---

## Technology Stack

| Category         | Technologies                                   |
| ---------------- | ---------------------------------------------- |
| Frontend         | React 18, Vite, TypeScript                     |
| UI and Animation | Tailwind CSS, Framer Motion, Lucide            |
| Backend          | Node.js, Express, TypeScript                   |
| AI Reasoning     | Google Gemini API                              |
| Search           | SerpApi                                        |
| Tool Integration | Python 3.10+, FastAPI, MCP                     |
| Database         | MongoDB, Mongoose                              |
| External Data    | npm Registry, PyPI, crates.io, GitHub REST API |
| Model Discovery  | Provider catalog adapters                      |
| Streaming        | Server-Sent Events (SSE)                       |
| Testing          | Vitest                                         |

---

## Installation

### Prerequisites

Install the following before starting:

* Node.js 18 or later
* npm 9 or later
* Python 3.10 or later
* API keys for Gemini and SerpApi
* MongoDB or MongoDB Atlas if persistent database storage is required

### 1. Clone the repository

```bash
git clone https://github.com/SyedAman1907/Library_Lens.git
cd Library_Lens
```

### 2. Configure environment variables

Create a local environment file using the provided template:

```bash
cp .env.example .env
```

On Windows PowerShell, you can use:

```powershell
Copy-Item .env.example .env
```

Add the required credentials to `.env`.

### 3. Install Node.js dependencies

From the project root:

```bash
npm run install:all
```

If the root installation script is unavailable, install the dependencies separately:

```bash
npm install

cd backend
npm install
cd ..

cd frontend
npm install
cd ..
```

### 4. Install Python MCP dependencies

**Windows PowerShell**

```powershell
cd mcp-server
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
cd ..
```

**Linux / macOS**

```bash
cd mcp-server
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cd ..
```

---

## Environment Variables

Configure the variables supported by your project in the root `.env` file.

| Variable          | Purpose                                       | Required                             |
| ----------------- | --------------------------------------------- | ------------------------------------ |
| `SERPAPI_API_KEY` | SerpApi search access                         | Yes, for live search                 |
| `GEMINI_API_KEY`  | Gemini reasoning and synthesis                | Yes, for AI analysis                 |
| `MCP_SERVER_URL`  | Python MCP service address                    | Yes, for MCP search                  |
| `PORT`            | Backend server port                           | No                                   |
| `CLIENT_URL`      | Frontend origin for CORS                      | No                                   |
| `MONGODB_URI`     | MongoDB connection                            | No, if fallback storage is supported |
| `GITHUB_TOKEN`    | Higher GitHub API rate limits                 | Optional                             |
| Provider API keys | Provider-specific discovery and health checks | Optional, depending on features      |

Additional provider keys and model synchronization settings are documented in the project's `.env.example`.

**Security:** Never commit real API keys, access tokens, or database credentials to GitHub.

---

## Running the Application

### Option A: Start all services

If the root `dev` script is configured to launch all services:

```bash
npm run dev
```

This should start the MCP server, backend API, and frontend concurrently.

### Option B: Start services individually

Open three terminals.

**Terminal 1 — MCP server**

```bash
cd mcp-server
python server.py
```

**Terminal 2 — Backend**

```bash
cd backend
npm run dev
```

**Terminal 3 — Frontend**

```bash
cd frontend
npm run dev
```

Open the frontend URL printed by Vite, typically:

`http://localhost:5173`

The MCP server and backend should also be running and reachable at their configured addresses.

---

## Example Use Cases

### 1. Compare AI Models

Compare two models to investigate:

* Context-window limits.
* Published input and output token pricing.
* Documented capabilities.
* Shared and model-specific features.
* Supporting evidence and source links.

### 2. Research Software Libraries

For example, compare **Zustand** and **Redux Toolkit** for a project with frequent state updates.

LibraryLens can collect package metadata, investigate GitHub releases, retrieve relevant search results, and generate a structured comparison of technical trade-offs.

### 3. Find a Suitable AI Model

Describe your use case, budget, context requirements, and required capabilities. The recommendation workflow analyzes the requirements against the available model information.

### 4. Challenge a Technical Claim

Select a statement in a research report and initiate targeted research to look for supporting or contradictory evidence.

### 5. Discover Model Updates

Use Model Radar to inspect model catalog information and identify newly discovered, updated, or deprecated entries.

---

## Security and Reliability

LibraryLens includes several measures intended to improve operational reliability and information traceability:

* Server-side handling of third-party credentials.
* Input validation for API requests.
* Sanitization of sensitive information in logs.
* Citation validation against collected search results.
* MongoDB persistence with an optional in-memory fallback.
* Source freshness evaluation and research history.
* External source links for independent review.

These measures help improve transparency and resilience, but they do not guarantee that every generated claim is correct. Important technical decisions should still be verified against authoritative sources.

---

## Limitations

* Live web and news research depends on SerpApi availability and account limits.
* GitHub and package registry requests are subject to upstream rate limits.
* Model pricing and capability information can change after retrieval.
* Citation matching confirms source correspondence, not necessarily the truth of every claim.
* Documented model specifications do not replace real-world performance benchmarking.
* Some model discovery integrations may require additional provider credentials.

---

## Roadmap

Potential future enhancements include:

* Automated head-to-head model benchmarks.
* Local model integrations through Ollama and vLLM.
* Automated dependency and breaking-change checks in CI/CD pipelines.
* Collaborative research workspaces.
* Improved evidence conflict detection and reproducible research reports.

---

## Hackathon Value

LibraryLens explores how AI agents can make technical research more useful by combining external search, structured evidence collection, and AI-assisted reasoning.

Its key contribution is the integration of **SerpApi, MCP, and Gemini** into a workflow designed to investigate technical questions, compare alternatives, and provide source-backed recommendations.

Rather than treating an AI-generated answer as unquestionable, LibraryLens encourages users to inspect the evidence, review trade-offs, and challenge claims.

---

## Demo and Links

| Resource          | Link                                                                      |
| ----------------- | ------------------------------------------------------------------------- |
| GitHub Repository | [SyedAman1907/Library_Lens](https://github.com/SyedAman1907/Library_Lens) |


## Author

**Syed Aman Mirzanullah**
Project Lead · Full-Stack Development · AI Research Systems

---

<p align="center">

**LibraryLens — Search Less. Research Smarter. Decide with Evidence.**

</p>
