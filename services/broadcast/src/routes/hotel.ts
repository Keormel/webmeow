import { Router } from "express";
import { v4 as uuid } from "uuid";
import { broadcast } from "../eventBus.js";
import { EventType } from "../types.js";
import { requireServiceToken } from "../auth.js";

const router = Router();
const hotelToken = process.env.HOTEL_TOKEN ?? "";

router.post("/confirm", requireServiceToken(hotelToken), (req, res) => {
  const body = req.body;

  broadcast({
    id: uuid(),
    type: EventType.HOTEL_CONFIRM,
    timestamp: new Date().toISOString(),
    source: "hotel",
    payload: {
      body
    },
  });

  res.json({
    success: true,
  });
});

router.post("/cancel", requireServiceToken(hotelToken), (req, res) => {
  const body = req.body;

  broadcast({
    id: uuid(),
    type: EventType.HOTEL_CANCEL,
    timestamp: new Date().toISOString(),
    source: "hotel",
    payload: {
      body
    },
  });

  res.json({
    success: true,
  });
});

export default router;