import { Message } from "../types/Message";
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
