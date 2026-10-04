from typing import List, Optional, Literal
from pydantic import BaseModel, Field

class WebSearchRequest(BaseModel):
    query: str = Field(..., description="Target search query")
    engine: Optional[Literal["google_light", "google"]] = Field(
        default="google_light",
        description="SerpApi engine to use. Default is google_light for compact results."
    )

class NormalizedWebResult(BaseModel):
    title: str
    url: str
    snippet: str
    source: str
    retrievedAt: str
    sourceType: str = "web"
    engine: Optional[str] = None

class WebSearchResponse(BaseModel):
    query: str
    results: List[NormalizedWebResult]
    total: int
    source: str = "serpapi_web"

class NewsSearchRequest(BaseModel):
    query: str = Field(..., description="Target keyword query for Google News")

class NormalizedNewsResult(BaseModel):
    title: str
    source: str
    publishedAt: Optional[str] = None
    snippet: str
    url: str
    thumbnailUrl: Optional[str] = None
    retrievedAt: str
    sourceType: str = "news"

class NewsSearchResponse(BaseModel):
    query: str
    results: List[NormalizedNewsResult]
    total: int
    source: str = "serpapi_news"

class ImageSearchRequest(BaseModel):
    query: str = Field(..., description="Target query for Google Images (e.g. library architecture or logo)")

class NormalizedImageResult(BaseModel):
    title: str
    imageUrl: str
    thumbnailUrl: Optional[str] = None
    sourceUrl: Optional[str] = None
    sourceTitle: Optional[str] = None
    sourceDomain: Optional[str] = None
    width: Optional[int] = None
    height: Optional[int] = None
    retrievedAt: str
    sourceType: str = "image"
    rightsNotice: str = "Visual reference only; copyright belongs to the respective source owner."

class ImageSearchResponse(BaseModel):
    query: str
    results: List[NormalizedImageResult]
    total: int
    source: str = "serpapi_images"

class MCPToolDefinition(BaseModel):
    name: str
    description: str
    inputSchema: dict

class MCPToolCallRequest(BaseModel):
    name: str
    arguments: dict
