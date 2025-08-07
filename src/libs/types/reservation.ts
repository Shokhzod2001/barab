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

export interface Table {
  id: string;
  capacity: number;
  available: boolean;
}
