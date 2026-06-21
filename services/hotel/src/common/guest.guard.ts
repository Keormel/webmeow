import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import type { Request } from 'express';

export type GuestRequest = Request & { guestId?: string };

@Injectable()
export class GuestGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<GuestRequest>();
    const guestId = request.headers['x-guest-id'];

    if (typeof guestId !== 'string' || !guestId.trim()) {
      throw new ForbiddenException({ error: 'Guest identity required' });
    }

    request.guestId = guestId.trim();
    return true;
  }
}

export function assertGuestMatch(
  requestGuestId: string | undefined,
  resourceGuestId: string,
): void {
  if (!requestGuestId || requestGuestId !== resourceGuestId) {
    throw new ForbiddenException({ error: 'Not authorized for this guest' });
  }
}
