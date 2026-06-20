import json
import logging
from typing import Any

from google import genai
from google.genai import types

from activities import ACTIVITIES_CATALOG
from config import settings
from profile_store import GuestProfile
from schemas import ActivityRecommendation, PreferencesRequest
from services import get_beach_activities

logger = logging.getLogger(__name__)

_client: genai.Client | None = None

SYSTEM_INSTRUCTION = """\
You are a travel advisor for Purrlington Island — a fully automated resort.

You will receive:
1. A guest's preferences (rest style, favorite places, vacation goal, travel companions).
2. A catalogue of beach activities with tags.

Your job:
- Generate a profile_summary: 2-3 sentences describing this guest's ideal vacation style.
- For EVERY activity in the catalogue, produce a match_score (0.0–1.0) and a reason (1-2 sentences).
- Rank from most suitable to least suitable.

Rules:
- match_score must reflect how well the activity fits ALL of the guest's preferences.
- reason must be specific — mention the guest's preferences that make this activity a good or poor fit.
- Be honest: if an activity is a bad fit, give it a low score and say why.
- Consider travel companions: families need kid-friendly activities, couples prefer intimate ones, etc.

Respond with ONLY a valid JSON object in this exact schema:
{
  "profile_summary": "string",
  "recommendations": [
    {
      "activity_id": "string",
      "activity_name": "string",
      "match_score": 0.0,
      "reason": "string"
    }
  ]
}
"""


def _get_client() -> genai.Client:
    global _client
    if _client is None:
        _client = genai.Client(api_key=settings.gemini_api_key)
    return _client


async def close_advisor_client() -> None:
    global _client
    _client = None


def _build_user_prompt(prefs: PreferencesRequest) -> str:
    catalogue_lines = []
    for a in ACTIVITIES_CATALOG:
        catalogue_lines.append(
            f'- {a["id"]}: {a["name"]} — {a["description"]} '
            f'(tags: {", ".join(a["tags"])}; category: {a["category"]})'
        )

    return (
        f"## Guest Preferences\n"
        f"- Rest style: {prefs.rest_style}\n"
        f"- Favorite places: {', '.join(prefs.favorite_places)}\n"
        f"- Vacation goal: {prefs.vacation_goal}\n"
        f"- Traveling with: {prefs.travel_with}\n\n"
        f"## Available Activities\n"
        + "\n".join(catalogue_lines)
    )


def _pre_score(prefs: PreferencesRequest) -> dict[str, float]:
    guest_tags: set[str] = set()
    guest_tags.add(prefs.rest_style)
    guest_tags.update(prefs.favorite_places)
    guest_tags.add(prefs.vacation_goal)
    guest_tags.add(prefs.travel_with)

    scores: dict[str, float] = {}
    for activity in ACTIVITIES_CATALOG:
        overlap = len(guest_tags & set(activity["tags"]))
        total = len(activity["tags"])
        scores[activity["id"]] = round(overlap / max(total, 1), 3)
    return scores


async def generate_recommendations(
    profile: GuestProfile,
    prefs: PreferencesRequest,
) -> list[ActivityRecommendation]:
    beach_data = await get_beach_activities()
    availability: dict[str, int] = {}
    for item in beach_data:
        aid = item.get("activity_id", "")
        remaining = item.get("remaining")
        if aid and remaining is not None:
            availability[aid] = remaining

    try:
        recommendations = await _call_gemini(prefs, profile)
    except Exception:
        logger.exception("Gemini call failed, falling back to pre-scoring")
        recommendations = _fallback_recommendations(prefs)

    for rec in recommendations:
        rec.available_spots = availability.get(rec.activity_id)

    recommendations.sort(key=lambda r: r.match_score, reverse=True)

    return recommendations


async def _call_gemini(
    prefs: PreferencesRequest,
    profile: GuestProfile,
) -> list[ActivityRecommendation]:
    client = _get_client()
    prompt = _build_user_prompt(prefs)

    response = client.models.generate_content(
        model=settings.gemini_model,
        contents=prompt,
        config=types.GenerateContentConfig(
            system_instruction=SYSTEM_INSTRUCTION,
            temperature=settings.gemini_temperature,
            response_mime_type="application/json",
        ),
    )

    raw = response.text
    logger.info("Gemini raw response length: %d chars", len(raw))

    data = json.loads(raw)

    if "profile_summary" in data:
        profile.profile_summary = data["profile_summary"]

    recs: list[ActivityRecommendation] = []
    for item in data.get("recommendations", []):
        activity_id = item.get("activity_id", "")
        cat_entry = _find_catalogue_entry(activity_id)
        recs.append(
            ActivityRecommendation(
                activity_id=activity_id,
                activity_name=item.get("activity_name", cat_entry.get("name", "Unknown")),
                description=cat_entry.get("description", ""),
                match_score=_clamp(item.get("match_score", 0.0)),
                reason=item.get("reason", ""),
                category=cat_entry.get("category", "Other"),
            )
        )

    return recs


def _fallback_recommendations(prefs: PreferencesRequest) -> list[ActivityRecommendation]:
    scores = _pre_score(prefs)
    recs: list[ActivityRecommendation] = []
    for activity in ACTIVITIES_CATALOG:
        aid = activity["id"]
        score = scores.get(aid, 0.0)
        recs.append(
            ActivityRecommendation(
                activity_id=aid,
                activity_name=activity["name"],
                description=activity["description"],
                match_score=score,
                reason=f"Matched {int(score * 100)}% of your preferences based on activity tags.",
                category=activity["category"],
            )
        )
    return recs


def _find_catalogue_entry(activity_id: str) -> dict[str, Any]:
    for a in ACTIVITIES_CATALOG:
        if a["id"] == activity_id:
            return a
    return {}


def _clamp(v: float) -> float:
    return max(0.0, min(1.0, float(v)))
