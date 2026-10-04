import json
import logging
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from urllib.parse import urlparse
import os
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("mcp-server.images_search")

# Initialize official SerpApi images_search tool as specified in prompt section 7
try:
    from serpapi_search_tools import images_search

    visual_search_fn = images_search(
        default_params={
            "safe": "active",
            "hl": "en"
        },
        mode="compact",
        response_format="json",
        result_limit=20,
        name="visual_research",
    )
except Exception as e:
    logger.warning(f"Failed to instantiate serpapi_search_tools images_search: {e}")
    visual_search_fn = None

def execute_images_search(query: str) -> Dict[str, Any]:
    """
    Executes an image search via SerpApi Search Tools Python package.
    Used for architecture diagrams, logos, and visual documentation references.
    Includes explicit rights notices and source attributions.
    """
    retrieved_at = datetime.now(timezone.utc).isoformat()
    api_key = os.getenv("SERPAPI_API_KEY")

    if not api_key:
        logger.info("SERPAPI_API_KEY is not set. Returning informative notice for images.")
        return {
            "query": query,
            "results": [],
            "total": 0,
            "notice": "SERPAPI_API_KEY not configured. Visual references require a SerpApi key.",
            "source": "serpapi_images"
        }

    if not visual_search_fn:
        return {
            "query": query,
            "results": [],
            "total": 0,
            "error": "serpapi-search-tools images_search not available",
            "source": "serpapi_images"
        }

    try:
        raw_json_str = visual_search_fn(query=query)
        data = json.loads(raw_json_str) if isinstance(raw_json_str, str) else raw_json_str

        normalized_results: List[Dict[str, Any]] = []

        images_items = []
        if isinstance(data, dict):
            images_items = data.get("images_results") or data.get("results") or []
        elif isinstance(data, list):
            images_items = data

        for item in images_items:
            if not isinstance(item, dict):
                continue

            title = item.get("title") or "Visual Reference"
            image_url = item.get("original") or item.get("link") or item.get("imageUrl") or ""
            thumbnail_url = item.get("thumbnail") or item.get("thumbnailUrl") or image_url
            source_url = item.get("source") or item.get("link") or item.get("sourceUrl") or ""
            source_title = item.get("source_name") or item.get("sourceTitle") or "Original Publisher"

            # Parse domain safely
            source_domain = None
            if source_url:
                try:
                    parsed = urlparse(source_url)
                    source_domain = parsed.netloc or source_title
                except Exception:
                    source_domain = source_title

            width = item.get("original_width") or item.get("width")
            height = item.get("original_height") or item.get("height")

            if image_url or thumbnail_url:
                normalized_results.append({
                    "title": title,
                    "imageUrl": image_url or thumbnail_url,
                    "thumbnailUrl": thumbnail_url,
                    "sourceUrl": source_url,
                    "sourceTitle": source_title,
                    "sourceDomain": source_domain,
                    "width": int(width) if width and str(width).isdigit() else None,
                    "height": int(height) if height and str(height).isdigit() else None,
                    "retrievedAt": retrieved_at,
                    "sourceType": "image",
                    "rightsNotice": "Visual reference only. Copyright belongs to the respective publisher."
                })

        return {
            "query": query,
            "results": normalized_results,
            "total": len(normalized_results),
            "source": "serpapi_images"
        }

    except Exception as exc:
        logger.error(f"Error executing images search for '{query}': {exc}", exc_info=True)
        return {
            "query": query,
            "results": [],
            "total": 0,
            "error": str(exc),
            "source": "serpapi_images"
        }
