import asyncio
import logging
import time
import uuid
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request

from advisor import close_advisor_client
from config import settings
from profile_store import ProfileStore
from routes import router
from services import close_client

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s level=%(levelname)s logger=%(name)s %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.store = ProfileStore(
        max_profiles=settings.max_profiles,
        ttl_seconds=settings.profile_ttl,
    )
    logger.info(
        "ProfileStore ready (max=%d, ttl=%ds)",
        settings.max_profiles,
        settings.profile_ttl,
    )
    cleanup_task = asyncio.create_task(_run_cleanup(app.state.store))
    yield
    cleanup_task.cancel()
    await close_client()
    await close_advisor_client()


async def _run_cleanup(store: ProfileStore):
    while True:
        await asyncio.sleep(60)
        store.cleanup()


async def request_context(request: Request, call_next):
    rid = request.headers.get("X-Request-ID") or uuid.uuid4().hex[:12]
    request.state.request_id = rid
    start = time.perf_counter()
    response = await call_next(request)
    logger.info(
        "rid=%s method=%s path=%s status=%s dur_ms=%.1f",
        rid,
        request.method,
        request.url.path,
        response.status_code,
        (time.perf_counter() - start) * 1000,
    )
    response.headers["X-Request-ID"] = rid
    return response


def create_app() -> FastAPI:
    app = FastAPI(title="Travel Advisor Service", lifespan=lifespan)
    app.middleware("http")(request_context)
    app.include_router(router)
    return app


app = create_app()


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=settings.port)
