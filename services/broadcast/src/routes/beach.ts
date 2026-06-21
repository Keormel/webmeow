import { Router } from "express";
import { v4 as uuid } from "uuid";
import { broadcast } from "../eventBus.js";
import { EventType } from "../types.js";
import { requireServiceToken } from "../auth.js";

const router = Router();
const beachToken = process.env.BEACH_TOKEN ?? "";

router.post("/full", requireServiceToken(beachToken), (req, res) => {
  const body = req.body;

  broadcast({
    id: uuid(),
    type: EventType.BEACH_FULL,
    timestamp: new Date().toISOString(),
    source: "beach",
    payload: {
      body,
    },
  });

  res.json({
    success: true,
  });
});

router.post("/available", requireServiceToken(beachToken), (req, res) => {
  const body = req.body;

  broadcast({
    id: uuid(),
    type: EventType.BEACH_AVAILABLE,
    timestamp: new Date().toISOString(),
    source: "beach",
    payload: {
      body,
    },
  });

  res.json({
    success: true,
  });
});

export default router;