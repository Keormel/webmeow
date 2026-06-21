import { zodResolver } from "@hookform/resolvers/zod";
import { IconSpeakerphone } from "@tabler/icons-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { postAdminAnnouncement } from "@/features/broadcast/api/broadcast-client";
import {
  AdminAnnouncementSchema,
  type AdminAnnouncementValues,
} from "@/features/broadcast/types";
import { useSession } from "@/stores/session-selectors";

export function AdminAnnouncementForm() {
  const session = useSession();
  const adminName = session?.role === "admin" ? session.displayName : "Admin";

  const form = useForm<AdminAnnouncementValues>({
    resolver: zodResolver(AdminAnnouncementSchema),
    defaultValues: { message: "" },
  });

  async function handleSubmit(values: AdminAnnouncementValues) {
    try {
      await postAdminAnnouncement(values.message, adminName);
      form.reset();
      toast.success("Resort-wide announcement sent from the Lighthouse.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not send announcement."
      );
    }
  }

  const error = form.formState.errors.message?.message;
  const isSubmitting = form.formState.isSubmitting;

  return (
    <form
      onSubmit={form.handleSubmit(handleSubmit)}
      className="grid gap-3 rounded-lg border border-dashed border-primary/30 bg-accent/40 p-4"
    >
      <div className="flex items-center gap-2">
        <IconSpeakerphone size={18} className="text-primary" />
        <div>
          <p className="text-sm font-semibold text-foreground">
            Resort-wide announcement
          </p>
          <p className="text-xs text-muted-foreground">
            Broadcasts to every zone and guest feed on the island.
          </p>
        </div>
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="admin-announcement-message" className="text-xs">
          Message
        </Label>
        <Textarea
          id="admin-announcement-message"
          data-testid="admin-announcement-message"
          placeholder="Attention all guests..."
          rows={4}
          aria-invalid={!!error}
          {...form.register("message")}
        />
        {error && (
          <p
            className="text-sm text-destructive"
            data-testid="admin-announcement-error"
          >
            {error}
          </p>
        )}
      </div>

      <Button
        type="submit"
        data-testid="admin-announcement-submit"
        disabled={isSubmitting}
        className="w-full"
      >
        {isSubmitting ? "Sending..." : "Broadcast announcement"}
      </Button>
    </form>
  );
}
