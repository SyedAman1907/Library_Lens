import json
import logging
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
import os
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("mcp-server.web_search")

# Initialize official SerpApi web_search tool as specified in prompt section 5
try:
    from serpapi_search_tools import web_search

    documentation_search_fn = web_search(
        allowed_engines=["google_light", "google"],
        default_engine="google_light",
        result_limit=10,
        response_format="json",
        name="documentation_search",
    )
except Exception as e:
    logger.warning(f"Failed to instantiate serpapi_search_tools web_search: {e}")
    documentation_search_fn = None

def execute_web_search(query: str, engine: str = "google_light") -> Dict[str, Any]:
    """
    Executes a web search via SerpApi Search Tools Python package.
    Returns normalized evidence-ready search items.
    """
    retrieved_at = datetime.now(timezone.utc).isoformat()
    api_key = os.getenv("SERPAPI_API_KEY")

    if not api_key:
        logger.info("SERPAPI_API_KEY is not set. Returning informative notice.")
        return {
            "query": query,
            "results": [],
            "total": 0,
            "notice": "SERPAPI_API_KEY not configured. Live web research requires a SerpApi key.",
            "source": "serpapi_web"
        }

    if not documentation_search_fn:
        return {
            "query": query,
            "results": [],
            "total": 0,
            "error": "serpapi-search-tools web_search not available",
            "source": "serpapi_web"
        }

    try:
        # Call the configured SerpApi tool
        raw_json_str = documentation_search_fn(query=query, engine=engine)
        data = json.loads(raw_json_str) if isinstance(raw_json_str, str) else raw_json_str

        normalized_results: List[Dict[str, Any]] = []

        # Parse organic or general search results
        organic_results = []
        if isinstance(data, dict):
            organic_results = data.get("organic_results") or data.get("results") or data.get("search_results") or []
        elif isinstance(data, list):
            organic_results = data

        for item in organic_results:
            if not isinstance(item, dict):
                continue
            title = item.get("title") or item.get("name") or "Untitled Document"
            url = item.get("link") or item.get("url") or ""
            snippet = item.get("snippet") or item.get("description") or item.get("content") or ""
            source = item.get("source") or item.get("displayed_link") or "Web Source"

            if url:
                normalized_results.append({
                    "title": title,
                    "url": url,
                    "snippet": snippet,
                    "source": source,
                    "retrievedAt": retrieved_at,
                    "sourceType": "web",
                    "engine": engine
                })

        return {
            "query": query,
            "results": normalized_results,
            "total": len(normalized_results),
            "source": "serpapi_web"
        }

    except Exception as exc:
        logger.error(f"Error executing web search for '{query}': {exc}", exc_info=True)
        return {
            "query": query,
            "results": [],
            "total": 0,
            "error": str(exc),
            "source": "serpapi_web"
        }
