import { Router } from "express";
import { v4 as uuid } from "uuid";
import { broadcast } from "../eventBus.js";
import { EventType } from "../types.js";
import { requireServiceToken } from "../auth.js";

const router = Router();
const feToken = process.env.FE_TOKEN ?? "";

router.post("/", requireServiceToken(feToken), (req, res) => {
  const { guestName, message } = req.body;

  broadcast({
    id: uuid(),
    type: EventType.PUBLIC_ANNOUNCEMENT,
    timestamp: new Date().toISOString(),
    source: guestName,
    payload: {
      message,
    },
  });

  res.json({
    success: true,
  });
});

export default router;