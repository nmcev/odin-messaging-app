export interface Message {
  _id?: string;
  type?: 'text' | 'image' | 'location';
  content: string;
  sender: string;
  receiver: string;
  sendAt: string;
  location?: { lat: number; lng: number };
  expiresAt?: string;
  readAt?: string; // set once the receiver has opened the chat
  clientId?: string;
  expired?: boolean;
  failed?: boolean; // client-only: the server rejected it or never answered
}