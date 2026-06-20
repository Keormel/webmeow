import json
import logging

import httpx

from config import settings

logger = logging.getLogger(__name__)

TIMEOUT = 5.0

_client: httpx.AsyncClient | None = None


def _get_client() -> httpx.AsyncClient:
    global _client
    if _client is None or _client.is_closed:
        _client = httpx.AsyncClient(
            timeout=TIMEOUT,
            headers={"Content-Type": "application/json"},
        )
    return _client


async def close_client() -> None:
    global _client
    if _client is not None and not _client.is_closed:
        await _client.aclose()
        _client = None


async def get_beach_activities() -> list[dict]:
    try:
        r = await _get_client().get(f"{settings.beach_service_url}/activities")
        r.raise_for_status()
        data = r.json()
        return data.get("activities", [])
    except (httpx.ConnectError, httpx.TimeoutException) as exc:
        logger.warning("Beach service unavailable: %s", exc)
        return []
    except httpx.HTTPStatusError as exc:
        logger.warning("Beach service returned %s", exc.response.status_code)
        return []
    except Exception:
        logger.exception("Unexpected error fetching beach activities")
        return []
