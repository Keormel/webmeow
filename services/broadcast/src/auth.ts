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

export function requireAdminPasscode(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const expected = process.env.ADMIN_PASSCODE ?? "";
  if (!expected) {
    res.status(503).json({ error: "Admin access not configured" });
    return;
  }

  const passcode = req.header("X-Admin-Passcode");
  if (passcode !== expected) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  next();
}
