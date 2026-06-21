-- CreateTable
CREATE TABLE "ReservationGuest" (
    "reservation_id" TEXT NOT NULL,
    "guest_id" TEXT NOT NULL,

    CONSTRAINT "ReservationGuest_pkey" PRIMARY KEY ("reservation_id","guest_id")
);

-- Backfill existing reservations so every booking has at least its primary guest in the party.
INSERT INTO "ReservationGuest" ("reservation_id", "guest_id")
SELECT "id", "guest_id" FROM "Reservation"
ON CONFLICT DO NOTHING;

-- CreateIndex
CREATE INDEX "ReservationGuest_guest_id_idx" ON "ReservationGuest"("guest_id");

-- AddForeignKey
ALTER TABLE "ReservationGuest" ADD CONSTRAINT "ReservationGuest_reservation_id_fkey" FOREIGN KEY ("reservation_id") REFERENCES "Reservation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
