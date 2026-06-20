import time
from schemas import PreferencesRequest, ActivityRecommendation


class GuestProfile:
    __slots__ = (
        "guest_id",
        "rest_style",
        "favorite_places",
        "vacation_goal",
        "travel_with",
        "profile_summary",
        "recommendations",
        "last_accessed",
    )

    def __init__(self, req: PreferencesRequest) -> None:
        self.guest_id = req.guest_id
        self.rest_style = req.rest_style
        self.favorite_places = list(req.favorite_places)
        self.vacation_goal = req.vacation_goal
        self.travel_with = req.travel_with
        self.profile_summary: str = ""
        self.recommendations: list[ActivityRecommendation] = []
        self.last_accessed: float = time.time()

    def touch(self) -> None:
        self.last_accessed = time.time()


class ProfileStore:
    def __init__(self, max_profiles: int = 500, ttl_seconds: int = 3600) -> None:
        self._max = max_profiles
        self._ttl = ttl_seconds
        self._profiles: dict[str, GuestProfile] = {}

    def upsert(self, profile: GuestProfile) -> None:
        profile.touch()
        self._profiles[profile.guest_id] = profile
        self._maybe_evict()

    def get(self, guest_id: str) -> GuestProfile | None:
        p = self._profiles.get(guest_id)
        if p is not None:
            p.touch()
        return p

    def cleanup(self) -> None:
        now = time.time()
        expired = [gid for gid, p in self._profiles.items() if now - p.last_accessed > self._ttl]
        for gid in expired:
            del self._profiles[gid]
        self._maybe_evict()

    def _maybe_evict(self) -> None:
        if len(self._profiles) <= self._max:
            return
        by_age = sorted(self._profiles, key=lambda g: self._profiles[g].last_accessed)
        for gid in by_age[: len(self._profiles) - self._max]:
            del self._profiles[gid]
