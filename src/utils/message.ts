import { Message } from "../types/Message";

export const MAX_MESSAGE_LENGTH = 2000; // the server rejects anything longer

export const toExpiredPlaceholder = (m: Message): Message => ({
  _id: m._id,
  clientId: m.clientId,
  sender: m.sender,
  receiver: m.receiver,
  sendAt: m.sendAt,
  type: 'text',
  content: '',
  expired: true,
});

// crypto.randomUUID only exists on https/localhost, so fall back when testing over a LAN IP
export const createClientId = (): string =>
  typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

const IMAGE_URL_PREFIXES = [
  'https://res.cloudinary.com/',            // current uploads
  'https://odin-blog-bucket.s3.eu-north-1', // older uploads
];

export const isImageUrl = (text: string): boolean =>
  IMAGE_URL_PREFIXES.some((prefix) => text.startsWith(prefix));

// text shown under a name in the chat list
export const lastMessagePreview = (text: string | undefined, maxLength = 30): string => {
  if (!text) return '';
  if (isImageUrl(text)) return 'Image';
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};
