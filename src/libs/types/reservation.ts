// src/libs/types/reservation.ts
export interface Reservation {
  id: number;
  name: string;
  phone: string;
  persons: number;
  date: string;
  time: string;
  table: string;
  createdAt: Date;
  status: "confirmed" | "cancelled";
}

// src/utils/reservationStore.ts
let reservations: Reservation[] = [];

export const addReservation = (
  reservation: Omit<Reservation, "id" | "createdAt" | "status">
): Reservation => {
  const newReservation: Reservation = {
    ...reservation,
    id: Date.now(),
    createdAt: new Date(),
    status: "confirmed",
  };
  reservations.push(newReservation);
  return newReservation;
};

export const getReservations = (): Reservation[] => {
  return [...reservations].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
};

export const cancelReservation = (id: number): Reservation | null => {
  const index = reservations.findIndex((r) => r.id === id);
  if (index !== -1) {
    reservations[index].status = "cancelled";
    return reservations[index];
  }
  return null;
};
