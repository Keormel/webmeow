import { z } from "zod";

export const PostAdminAnnouncementResponseSchema = z.object({
  success: z.literal(true),
});

export type PostAdminAnnouncementResponse = z.infer<
  typeof PostAdminAnnouncementResponseSchema
>;

export const AdminAnnouncementSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, "Write an announcement for the whole resort.")
    .max(500, "Keep announcements under 500 characters."),
});

export type AdminAnnouncementValues = z.infer<typeof AdminAnnouncementSchema>;
