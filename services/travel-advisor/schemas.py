from pydantic import BaseModel, Field
from typing import Literal


class PreferencesRequest(BaseModel):
    guest_id: str = Field(min_length=1, max_length=100)
    rest_style: Literal["calm", "active", "mixed"]
    favorite_places: list[Literal["beach", "water", "nature", "social"]] = Field(min_length=1)
    vacation_goal: Literal["relax", "adventure", "learn", "socialize", "family_fun"]
    travel_with: Literal["solo", "couple", "family", "group"]


class ProfileResponse(BaseModel):
    guest_id: str
    rest_style: str
    favorite_places: list[str]
    vacation_goal: str
    travel_with: str
    profile_summary: str


class ActivityRecommendation(BaseModel):
    activity_id: str
    activity_name: str
    description: str
    match_score: float = Field(ge=0.0, le=1.0)
    reason: str
    available_spots: int | None = None
    category: str


class RecommendationsResponse(BaseModel):
    guest_id: str
    recommendations: list[ActivityRecommendation]
    profile_summary: str
