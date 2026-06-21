import { Router } from "express";
import { v4 as uuid } from "uuid";
import { requireAdminPasscode } from "../auth.js";
import { broadcast } from "../eventBus.js";
import { EventType } from "../types.js";

const router = Router();

router.post("/announcement", requireAdminPasscode, (req, res) => {
  const { message, admin_name: adminName } = req.body ?? {};

  if (typeof message !== "string" || !message.trim()) {
    res.status(400).json({ error: "Message is required" });
    return;
  }

  const trimmed = message.trim().slice(0, 500);
  const source =
    typeof adminName === "string" && adminName.trim()
      ? adminName.trim().slice(0, 80)
      : "Lighthouse";

  broadcast({
    id: uuid(),
    type: EventType.RESORT_WIDE_ANNOUNCEMENT,
    timestamp: new Date().toISOString(),
    source,
    payload: {
      message: trimmed,
    },
  });

  res.json({ success: true });
});

export default router;
