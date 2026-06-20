import unittest
from unittest.mock import MagicMock, patch

from schemas import PreferencesRequest
from profile_store import GuestProfile
from advisor import (
    _build_user_prompt,
    _pre_score,
    _call_gemini,
    _fallback_recommendations,
    generate_recommendations,
)


class TestTravelAdvisorAI(unittest.TestCase):
    def setUp(self):
        self.prefs = PreferencesRequest(
            guest_id="ai-test-guest",
            rest_style="active",
            favorite_places=["water", "nature"],
            vacation_goal="adventure",
            travel_with="solo",
        )
        self.profile = GuestProfile(self.prefs)

    def test_prompt_builder(self):
        prompt = _build_user_prompt(self.prefs)
        self.assertIn("Guest Preferences", prompt)
        self.assertIn("active", prompt)
        self.assertIn("water", prompt)
        self.assertIn("nature", prompt)
        self.assertIn("adventure", prompt)
        self.assertIn("solo", prompt)
        self.assertIn("Available Activities", prompt)

    def test_pre_scoring(self):
        scores = _pre_score(self.prefs)
        self.assertIn("ACT003", scores)
        self.assertEqual(scores["ACT003"], 1.0)
        self.assertIn("ACT010", scores)
        self.assertEqual(scores["ACT010"], 0.0)

    @patch("advisor._get_client")
    async def _run_mocked_gemini_test(self, mock_get_client):
        mock_client = MagicMock()
        mock_response = MagicMock()
        mock_response.text = """{
            "profile_summary": "Test guest profile summary.",
            "recommendations": [
                {
                    "activity_id": "ACT003",
                    "activity_name": "Snorkeling Adventure",
                    "match_score": 0.95,
                    "reason": "This is a great fit."
                }
            ]
        }"""
        mock_client.models.generate_content.return_value = mock_response
        mock_get_client.return_value = mock_client

        recs = await _call_gemini(self.prefs, self.profile)
        
        self.assertEqual(self.profile.profile_summary, "Test guest profile summary.")
        self.assertEqual(len(recs), 1)
        self.assertEqual(recs[0].activity_id, "ACT003")
        self.assertEqual(recs[0].match_score, 0.95)
        self.assertEqual(recs[0].reason, "This is a great fit.")

    def test_call_gemini_mocked(self):
        import asyncio
        asyncio.run(self._run_mocked_gemini_test())

    def test_fallback_recommendations(self):
        recs = _fallback_recommendations(self.prefs)
        self.assertTrue(len(recs) > 0)
        self.assertEqual(recs[0].activity_id, "ACT001")
        self.assertTrue("Matched" in recs[0].reason)


if __name__ == "__main__":
    unittest.main()
