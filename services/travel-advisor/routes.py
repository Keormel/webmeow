import logging

from fastapi import APIRouter, HTTPException, Request

from advisor import generate_recommendations
from profile_store import GuestProfile, ProfileStore
from schemas import (
    PreferencesRequest,
    ProfileResponse,
    RecommendationsResponse,
)

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/health")
async def health():
    return {"status": "ok"}


@router.post("/preferences", response_model=RecommendationsResponse)
async def submit_preferences(req: PreferencesRequest, request: Request):
    store: ProfileStore = request.app.state.store

    profile = GuestProfile(req)
    store.upsert(profile)

    try:
        recommendations = await generate_recommendations(profile, req)
    except Exception as e:
        logger.exception("Recommendation generation failed for %s", req.guest_id)
        raise HTTPException(
            status_code=502, detail="AI advisor service unavailable"
        ) from e

    profile.recommendations = recommendations
    store.upsert(profile)

    return RecommendationsResponse(
        guest_id=req.guest_id,
        recommendations=recommendations,
        profile_summary=profile.profile_summary,
    )


@router.get("/recommendations/{guest_id}", response_model=RecommendationsResponse)
async def get_recommendations(guest_id: str, request: Request):
    store: ProfileStore = request.app.state.store
    profile = store.get(guest_id)

    if profile is None:
        raise HTTPException(
            status_code=404,
            detail="Profile not found. Please complete the onboarding first.",
        )

    if not profile.recommendations:
        raise HTTPException(
            status_code=404,
            detail="No recommendations available yet. Please submit your preferences.",
        )

    return RecommendationsResponse(
        guest_id=guest_id,
        recommendations=profile.recommendations,
        profile_summary=profile.profile_summary,
    )


@router.get("/profile/{guest_id}", response_model=ProfileResponse)
async def get_profile(guest_id: str, request: Request):
    store: ProfileStore = request.app.state.store
    profile = store.get(guest_id)

    if profile is None:
        raise HTTPException(
            status_code=404,
            detail="Profile not found. Please complete the onboarding first.",
        )

    return ProfileResponse(
        guest_id=profile.guest_id,
        rest_style=profile.rest_style,
        favorite_places=profile.favorite_places,
        vacation_goal=profile.vacation_goal,
        travel_with=profile.travel_with,
        profile_summary=profile.profile_summary,
    )
