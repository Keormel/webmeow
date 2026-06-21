import axios, { isAxiosError } from "axios";
import { z } from "zod";

import { env } from "@/config/env";

const AnnouncementResponseSchema = z.object({
  success: z.literal(true),
});

function errorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const data = error.response?.data;
    if (data && typeof data === "object" && "error" in data) {
      return String((data as { error: unknown }).error);
    }
    return error.message;
  }

  return error instanceof Error ? error.message : "Request failed";
}

export async function publishAdminAnnouncement(
  message: string,
  sender: string
): Promise<void> {
  try {
    const { data } = await axios.post(
      `${env.gatewayUrl}/api/broadcast/admin/announcement`,
      { message, sender },
      { headers: { "X-Admin-Passcode": env.adminPasscode } }
    );
    AnnouncementResponseSchema.parse(data);
  } catch (error) {
    throw new Error(errorMessage(error));
  }
}
