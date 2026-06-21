import { Router } from "express";
import { v4 as uuid } from "uuid";
import { broadcast } from "../eventBus.js";
import { EventType } from "../types.js";
import { requireServiceToken } from "../auth.js";

const router = Router();
const airportToken = process.env.AIRPORT_TOKEN ?? "";

router.post("/arrival", requireServiceToken(airportToken), (req, res) => {
  const body = req.body;

  broadcast({
    id: uuid(),
    type: EventType.AIRPORT_ARRIVAL,
    timestamp: new Date().toISOString(),
    source: "airport",
    payload: {
      body,
    },
  });

  res.json({
    success: true,
  });
});

export default router;