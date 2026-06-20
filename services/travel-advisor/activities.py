ACTIVITIES_CATALOG: list[dict] = [
    {
        "id": "ACT001",
        "name": "Beach Volleyball",
        "description": "Competitive beach volleyball tournament.",
        "tags": ["active", "beach", "socialize", "group"],
        "category": "Sports",
    },
    {
        "id": "ACT002",
        "name": "Surf Lessons",
        "description": "Beginner-friendly surf training session.",
        "tags": ["active", "water", "adventure", "learn"],
        "category": "Water Sports",
    },
    {
        "id": "ACT003",
        "name": "Snorkeling Adventure",
        "description": "Explore underwater marine life.",
        "tags": ["active", "water", "adventure", "nature"],
        "category": "Water Sports",
    },
    {
        "id": "ACT004",
        "name": "Sunrise Yoga",
        "description": "Morning yoga on the beach.",
        "tags": ["calm", "beach", "relax", "solo"],
        "category": "Wellness",
    },
    {
        "id": "ACT005",
        "name": "Kayaking Tour",
        "description": "Guided kayaking along the coastline.",
        "tags": ["active", "water", "adventure", "nature"],
        "category": "Water Sports",
    },
    {
        "id": "ACT006",
        "name": "Sandcastle Competition",
        "description": "Build the ultimate sandcastle.",
        "tags": ["calm", "beach", "family_fun", "socialize"],
        "category": "Family",
    },
    {
        "id": "ACT007",
        "name": "Beach Soccer",
        "description": "Friendly soccer matches on the sand.",
        "tags": ["active", "beach", "socialize", "group"],
        "category": "Sports",
    },
    {
        "id": "ACT008",
        "name": "Scuba Diving",
        "description": "Discover deeper ocean wonders.",
        "tags": ["active", "water", "adventure", "learn"],
        "category": "Water Sports",
    },
    {
        "id": "ACT009",
        "name": "Jet Ski Experience",
        "description": "High-speed water adventure.",
        "tags": ["active", "water", "adventure", "solo", "couple"],
        "category": "Water Sports",
    },
    {
        "id": "ACT010",
        "name": "Beach Bonfire",
        "description": "Evening gathering with music and snacks.",
        "tags": ["calm", "beach", "socialize", "relax", "group"],
        "category": "Social",
    },
    {
        "id": "ACT011",
        "name": "Fishing Excursion",
        "description": "Learn fishing techniques with experts.",
        "tags": ["calm", "water", "nature", "learn"],
        "category": "Nature",
    },
    {
        "id": "ACT012",
        "name": "Paddle Boarding",
        "description": "Relaxing paddle board session.",
        "tags": ["mixed", "water", "relax", "solo", "couple"],
        "category": "Water Sports",
    },
    {
        "id": "ACT013",
        "name": "Nature Walk",
        "description": "Guided tour of local flora and fauna.",
        "tags": ["calm", "nature", "learn", "family_fun"],
        "category": "Nature",
    },
    {
        "id": "ACT014",
        "name": "Photography Workshop",
        "description": "Capture stunning beach landscapes.",
        "tags": ["calm", "nature", "learn", "beach", "solo"],
        "category": "Creative",
    },
    {
        "id": "ACT015",
        "name": "Treasure Hunt",
        "description": "Family-friendly beach treasure hunt.",
        "tags": ["active", "beach", "family_fun", "socialize", "family"],
        "category": "Family",
    },
    {
        "id": "ACT016",
        "name": "Cooking Class",
        "description": "Learn to prepare local seafood dishes.",
        "tags": ["calm", "learn", "socialize", "couple"],
        "category": "Creative",
    },
    {
        "id": "ACT017",
        "name": "Sailing Basics",
        "description": "Introduction to sailing techniques.",
        "tags": ["active", "water", "learn", "adventure"],
        "category": "Water Sports",
    },
    {
        "id": "ACT018",
        "name": "Beach Cleanup",
        "description": "Community environmental activity.",
        "tags": ["calm", "beach", "socialize", "nature", "group"],
        "category": "Community",
    },
    {
        "id": "ACT019",
        "name": "Meditation Session",
        "description": "Relaxing guided meditation by the sea.",
        "tags": ["calm", "beach", "relax", "solo"],
        "category": "Wellness",
    },
    {
        "id": "ACT020",
        "name": "Sunset Cruise",
        "description": "Boat cruise during sunset hours.",
        "tags": ["calm", "water", "relax", "socialize", "couple"],
        "category": "Leisure",
    },
]


def get_activity_by_id(activity_id: str) -> dict | None:
    for a in ACTIVITIES_CATALOG:
        if a["id"] == activity_id:
            return a
    return None
