import type { Request, Response, NextFunction } from "express";

export function requireServiceToken(expected: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!expected) {
      res.status(503).json({ error: "Service token not configured" });
      return;
    }

    const token = req.header("X-Service-Token");
    if (token !== expected) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    next();
  };
}
