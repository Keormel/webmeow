from fastapi import Header, HTTPException

from config import settings


async def require_admin(
    x_admin_passcode: str | None = Header(None, alias="X-Admin-Passcode"),
) -> None:
    if not settings.admin_passcode:
        raise HTTPException(status_code=503, detail="Admin access not configured")
    if x_admin_passcode != settings.admin_passcode:
        raise HTTPException(status_code=401, detail="Unauthorized")


def assert_guest_match(guest_id: str, x_guest_id: str | None) -> None:
    if not x_guest_id or x_guest_id != guest_id:
        raise HTTPException(status_code=403, detail="Forbidden")
