import json
import logging
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
import os
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("mcp-server.news_search")

# Initialize official SerpApi news_search tool as specified in prompt section 6
try:
    from serpapi_search_tools import news_search

    library_news_search_fn = news_search(
        default_params={
            "hl": "en",
            "gl": "us"
        },
        mode="compact",
        response_format="json",
        result_limit=10,
        name="library_news_search",
    )
except Exception as e:
    logger.warning(f"Failed to instantiate serpapi_search_tools news_search: {e}")
    library_news_search_fn = None

def execute_news_search(query: str) -> Dict[str, Any]:
    """
    Executes a news search via SerpApi Search Tools Python package.
    Returns normalized news results with publisher, published date, and URLs.
    """
    retrieved_at = datetime.now(timezone.utc).isoformat()
    api_key = os.getenv("SERPAPI_API_KEY")

    if not api_key:
        logger.info("SERPAPI_API_KEY is not set. Returning informative notice for news.")
        return {
            "query": query,
            "results": [],
            "total": 0,
            "notice": "SERPAPI_API_KEY not configured. Live news search requires a SerpApi key.",
            "source": "serpapi_news"
        }

    if not library_news_search_fn:
        return {
            "query": query,
            "results": [],
            "total": 0,
            "error": "serpapi-search-tools news_search not available",
            "source": "serpapi_news"
        }

    try:
        raw_json_str = library_news_search_fn(query=query)
        data = json.loads(raw_json_str) if isinstance(raw_json_str, str) else raw_json_str

        normalized_results: List[Dict[str, Any]] = []

        news_items = []
        if isinstance(data, dict):
            news_items = data.get("news_results") or data.get("results") or []
        elif isinstance(data, list):
            news_items = data

        for item in news_items:
            if not isinstance(item, dict):
                continue

            title = item.get("title") or "News Announcement"
            link = item.get("link") or item.get("url") or ""
            source_info = item.get("source") or {}
            source_name = source_info.get("name") if isinstance(source_info, dict) else str(source_info)
            if not source_name or source_name == "{}":
                source_name = item.get("publisher") or "Technology News"

            date_str = item.get("date") or item.get("publishedAt") or item.get("isoDate") or None
            snippet = item.get("snippet") or item.get("description") or ""
            thumbnail = item.get("thumbnail") or item.get("thumbnailUrl") or (
                source_info.get("icon") if isinstance(source_info, dict) else None
            )

            if link:
                normalized_results.append({
                    "title": title,
                    "source": source_name,
                    "publishedAt": date_str,
                    "snippet": snippet,
                    "url": link,
                    "thumbnailUrl": thumbnail,
                    "retrievedAt": retrieved_at,
                    "sourceType": "news"
                })

        return {
            "query": query,
            "results": normalized_results,
            "total": len(normalized_results),
            "source": "serpapi_news"
        }

    except Exception as exc:
        logger.error(f"Error executing news search for '{query}': {exc}", exc_info=True)
        return {
            "query": query,
            "results": [],
            "total": 0,
            "error": str(exc),
            "source": "serpapi_news"
        }
