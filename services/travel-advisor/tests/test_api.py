import unittest
from fastapi.testclient import TestClient

from main import app
from schemas import PreferencesRequest
from profile_store import GuestProfile


class TestTravelAdvisorAPI(unittest.TestCase):
    def setUp(self):
        self.client_ctx = TestClient(app)
        self.client = self.client_ctx.__enter__()

    def tearDown(self):
        self.client_ctx.__exit__(None, None, None)

    def test_health(self):
        response = self.client.get("/health")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"status": "ok"})

    def test_profile_not_found(self):
        response = self.client.get("/profile/non-existent-guest")
        self.assertEqual(response.status_code, 404)
        self.assertIn("detail", response.json())

    def test_recommendations_not_found(self):
        response = self.client.get("/recommendations/non-existent-guest")
        self.assertEqual(response.status_code, 404)
        self.assertIn("detail", response.json())

    def test_preferences_and_retrieval_flow(self):
        payload = {
            "guest_id": "test-guest-123",
            "rest_style": "active",
            "favorite_places": ["water", "nature"],
            "vacation_goal": "adventure",
            "travel_with": "solo",
        }
        
        response = self.client.post("/preferences", json=payload)
        self.assertEqual(response.status_code, 200)
        
        data = response.json()
        self.assertEqual(data["guest_id"], "test-guest-123")
        self.assertIn("recommendations", data)
        self.assertIn("profile_summary", data)
        
        recs = data["recommendations"]
        self.assertTrue(len(recs) > 0)
        self.assertEqual(recs[0]["activity_id"], "ACT003")
        
        profile_response = self.client.get("/profile/test-guest-123")
        self.assertEqual(profile_response.status_code, 200)
        profile_data = profile_response.json()
        self.assertEqual(profile_data["guest_id"], "test-guest-123")
        self.assertEqual(profile_data["rest_style"], "active")
        
        recs_response = self.client.get("/recommendations/test-guest-123")
        self.assertEqual(recs_response.status_code, 200)
        recs_data = recs_response.json()
        self.assertEqual(recs_data["guest_id"], "test-guest-123")
        self.assertTrue(len(recs_data["recommendations"]) > 0)


if __name__ == "__main__":
    unittest.main()
