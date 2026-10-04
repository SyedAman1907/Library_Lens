import os
import logging
from typing import Dict, Any, List
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv

load_dotenv()

# Import tool implementations
from tools.web_search import execute_web_search
from tools.news_search import execute_news_search
from tools.images_search import execute_images_search
from schemas.search_schemas import (
    WebSearchRequest,
    NewsSearchRequest,
    ImageSearchRequest,
    MCPToolCallRequest,
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("librarylens-mcp")

app = FastAPI(
    title="LibraryLens MCP Server",
    description="Model Context Protocol (MCP) server wrapping SerpApi Search Tools for software library research",
    version="1.0.0"
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Tool definitions adhering to Model Context Protocol (MCP) specification
MCP_TOOLS: List[Dict[str, Any]] = [
    {
        "name": "web_search",
        "description": "Searches the web using SerpApi Google Light/Google engine for official software documentation, releases, changelogs, and technical guides.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "query": {"type": "string", "description": "Search query keywords"},
                "engine": {
                    "type": "string",
                    "enum": ["google_light", "google"],
                    "default": "google_light",
                    "description": "SerpApi search engine. Default is google_light for fast, compact results."
                }
            },
            "required": ["query"]
        }
    },
    {
        "name": "documentation_search",
        "description": "Specialized web search focused on official technical documentation, migration manuals, and API specifications.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "query": {"type": "string", "description": "Documentation search query"}
            },
            "required": ["query"]
        }
    },
    {
        "name": "news_search",
        "description": "Searches Google News for recent software release announcements, breaking security notices, and major company/project developments.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "query": {"type": "string", "description": "Target keyword query for news"}
            },
            "required": ["query"]
        }
    },
    {
        "name": "images_search",
        "description": "Searches Google Images for architecture diagrams, official system designs, and library visual references. Visual references are non-authoritative.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "query": {"type": "string", "description": "Visual reference search query (e.g. 'React architecture diagram')"}
            },
            "required": ["query"]
        }
    }
]

@app.get("/health")
def health_check():
    """Health status check for MCP server and SerpApi configuration."""
    has_serpapi_key = bool(os.getenv("SERPAPI_API_KEY"))
    return {
        "status": "healthy",
        "service": "librarylens-mcp-server",
        "serpapi_configured": has_serpapi_key,
        "tools_count": len(MCP_TOOLS),
        "protocol": "mcp/1.0"
    }

@app.get("/tools/list")
@app.get("/mcp/v1/tools/list")
def list_tools():
    """Returns available MCP tools list for client discovery."""
    return {
        "tools": MCP_TOOLS
    }

@app.post("/tools/call")
@app.post("/mcp/v1/tools/call")
def call_tool(call_req: MCPToolCallRequest):
    """Executes a tool call requested by an MCP client."""
    name = call_req.name
    args = call_req.arguments or {}

    logger.info(f"MCP tool call: {name} with args: {args}")

    if name in ["web_search", "documentation_search"]:
        query = args.get("query", "")
        engine = args.get("engine", "google_light")
        if not query:
            raise HTTPException(status_code=400, detail="Missing 'query' in arguments")
        result = execute_web_search(query=query, engine=engine)
        return {"content": [{"type": "text", "text": str(result)}], "result": result}

    elif name == "news_search":
        query = args.get("query", "")
        if not query:
            raise HTTPException(status_code=400, detail="Missing 'query' in arguments")
        result = execute_news_search(query=query)
        return {"content": [{"type": "text", "text": str(result)}], "result": result}

    elif name in ["images_search", "image_search"]:
        query = args.get("query", "")
        if not query:
            raise HTTPException(status_code=400, detail="Missing 'query' in arguments")
        result = execute_images_search(query=query)
        return {"content": [{"type": "text", "text": str(result)}], "result": result}

    else:
        raise HTTPException(status_code=404, detail=f"Tool '{name}' not found on MCP server")

# REST endpoints for direct backend consumption
@app.post("/api/search/web")
def api_web_search(req: WebSearchRequest):
    return execute_web_search(query=req.query, engine=req.engine or "google_light")

@app.post("/api/search/news")
def api_news_search(req: NewsSearchRequest):
    return execute_news_search(query=req.query)

@app.post("/api/search/images")
def api_images_search(req: ImageSearchRequest):
    return execute_images_search(query=req.query)

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("MCP_SERVER_PORT", "5005"))
    logger.info(f"Starting LibraryLens MCP server on port {port}...")
    uvicorn.run("server:app", host="127.0.0.1", port=port, reload=False)
