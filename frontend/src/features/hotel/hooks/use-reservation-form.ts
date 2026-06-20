import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { postReservation } from "@/features/hotel/api/hotel-client";
import { HOTEL_KEYS } from "@/features/hotel/query-keys";
import {
  ReservationFormSchema,
  formToRequest,
  type ReservationFormValues,
} from "@/features/hotel/schemas/reservation-form-schema";
import { useSessionStore } from "@/stores/session-store";
import { addDays } from "date-fns";
import type { Reservation } from "@/features/hotel/types";
import {
  formatTokens,
  getReservationTokenAllowance,
} from "@/features/tokens/token-rules";
import { useTokenWalletStore } from "@/features/tokens/token-store";

export function useReservationForm() {
  const guest = useSessionStore((s) => s.guest);
  const creditReservationTokens = useTokenWalletStore(
    (s) => s.creditReservationTokens
  );
  const queryClient = useQueryClient();
  const [confirmed, setConfirmed] = useState<Reservation | null>(null);

  const form = useForm<ReservationFormValues>({
    resolver: zodResolver(ReservationFormSchema),
    defaultValues: {
      room_type: "STANDARD",
      guest_count: 1,
      check_in_date: new Date(),
      check_out_date: addDays(new Date(), 1),
    },
  });

  const mutation = useMutation({
    mutationFn: (values: ReservationFormValues) => {
      if (!guest) return Promise.reject(new Error("No active session"));
      return postReservation(formToRequest(values, guest.id));
    },
    onSuccess: (reservation) => {
      setConfirmed(reservation);
      const tokens = getReservationTokenAllowance(reservation);
      const credited = creditReservationTokens(
        reservation.guest_id,
        reservation.id,
        tokens
      );
      if (credited) {
        toast.success(`${formatTokens(tokens)} added to entertainment wallet`);
      }
      queryClient.invalidateQueries({
        queryKey: [...HOTEL_KEYS.RESERVATION],
      });
      queryClient.invalidateQueries({ queryKey: [...HOTEL_KEYS.ROOMS] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return {
    form,
    onSubmit: form.handleSubmit((values) => mutation.mutate(values)),
    confirmed,
    resetConfirmed: () => setConfirmed(null),
    isSubmitting: mutation.isPending,
  };
}
