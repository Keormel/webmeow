import { Router } from "express";
import { v4 as uuid } from "uuid";
import { broadcast } from "../eventBus.js";
import { EventType } from "../types.js";

const router = Router();

function configuredAdminPasscode() {
  return process.env.ADMIN_PASSCODE || process.env.VITE_ADMIN_PASSCODE || "";
}

router.post("/announcement", (req, res) => {
  const expectedPasscode = configuredAdminPasscode();
  const providedPasscode = req.header("X-Admin-Passcode") || "";

  if (!expectedPasscode || providedPasscode !== expectedPasscode) {
    res.status(403).json({ error: "Admin authorization required" });
    return;
  }

  const message =
    typeof req.body?.message === "string" ? req.body.message.trim() : "";
  const sender =
    typeof req.body?.sender === "string" && req.body.sender.trim()
      ? req.body.sender.trim()
      : "Admin";

  if (!message) {
    res.status(400).json({ error: "Announcement message is required" });
    return;
  }

  const event = {
    id: uuid(),
    type: EventType.RESORT_ANNOUNCEMENT,
    timestamp: new Date().toISOString(),
    source: "broadcast",
    payload: {
      message,
      sender,
      channel: "resort-wide",
    },
  };

  broadcast(event);
  res.json({ success: true, event });
});

export default router;
