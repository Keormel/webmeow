import { api } from "@/lib/api-client";
import { env } from "@/config/env";
import {
  PostAdminAnnouncementResponseSchema,
  type PostAdminAnnouncementResponse,
} from "@/features/broadcast/types";

function adminHeaders() {
  return env.adminPasscode
    ? { headers: { "X-Admin-Passcode": env.adminPasscode } }
    : {};
}

export function postAdminAnnouncement(
  message: string,
  adminName?: string
): Promise<PostAdminAnnouncementResponse> {
  return api.broadcast.post(
    PostAdminAnnouncementResponseSchema,
    "/admin/announcement",
    {
      message,
      admin_name: adminName,
    },
    adminHeaders()
  );
}
