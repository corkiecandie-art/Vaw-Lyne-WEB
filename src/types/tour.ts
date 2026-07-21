export interface TourEvent {
  id: string;
  date: string;
  venue: string;
  location: string;
  status: 'upcoming' | 'past';
  ticketUrl?: string;
}
