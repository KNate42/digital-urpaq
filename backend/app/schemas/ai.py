from pydantic import BaseModel, Field


class RecommendationRequest(BaseModel):
    age: int = Field(ge=3, le=25)
    interests: list[str] = Field(default_factory=list, max_length=12)
    skills: list[str] = Field(default_factory=list, max_length=12)


class RecommendationItem(BaseModel):
    club_id: int
    club_name: str
    category: str
    score: int
    explanation: str


class RecommendationResponse(BaseModel):
    recommendations: list[RecommendationItem]
