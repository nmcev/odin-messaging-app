import React, { Suspense, lazy, memo, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { UserContext } from '../context/UserContext';
import { AuthContext } from '../context/AuthContext';
import { Message } from '../types/Message';
import { toExpiredPlaceholder } from '../utils/message';

// Leaflet only loads when the first location message is rendered
const LocationCard = lazy(() =>
  import('./LocationCard').then((m) => ({ default: m.LocationCard }))
);

const CLOUDINARY_PREFIX = 'https://res.cloudinary.com/dw';


function displayTime(timestamp: string): string {
  const date = new Date(timestamp);
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = (hours % 12 || 12).toString().padStart(2, '0');
  return `${formattedHours}:${minutes} ${ampm}`;
}

function displayDate(timestamp: string): string {
  const date = new Date(timestamp);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  return `${day}/${month}`;
}

// old images in the database have no type, so keep the URL check as a fallback
function getKind(msg: Message): 'expired' | 'location' | 'image' | 'text' {
  if (msg.expired) return 'expired';
  if (msg.type === 'location' && msg.location) return 'location';
  if (msg.type === 'image' || msg.content.startsWith(CLOUDINARY_PREFIX)) return 'image';
  return 'text';
}

const EmptyState = () => (
  <div className="flex-1 flex items-center justify-center p-4">
    <h1 className="text-2xl font-bold text-gray-500 dark:text-gray-400">
      Start a conversation
    </h1>
  </div>
);

interface MessageBubbleProps {
  msg: Message;
  isMine: boolean;
  senderName: string;
  avatar: string;
  onImageClick: (url: string) => void;
}

function MessageBubbleBase({ msg, isMine, senderName, avatar, onImageClick }: MessageBubbleProps) {
  const kind = getKind(msg);

  return (
    <div className={`flex gap-2 ${isMine ? 'flex-row-reverse' : 'flex-row'} items-center mb-4`}>
      <div className="w-8 h-8 md:w-10 md:h-10 shrink-0 self-end">
        <img
          src={avatar}
          alt="profile"
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover rounded-full"
        />
      </div>

      <div
        className={`p-2 rounded-lg min-w-0 max-w-[80%] md:max-w-[70%] break-words ${
          isMine
            ? 'bg-[#ff9800] text-white ml-auto'
            : 'bg-gray-200 dark:bg-[#0e1621] text-gray-600 dark:text-gray-400 mr-auto'
        }`}
      >
        <p className="text-sm poppins-bold">{senderName}</p>

        {kind === 'location' && (
          <Suspense fallback={<div className="w-64 h-40 rounded-lg bg-black/10 animate-pulse" />}>
            <LocationCard lat={msg.location!.lat} lng={msg.location!.lng} />
          </Suspense>
        )}

        {kind === 'image' && (
          <div className="max-w-full sm:max-w-sm py-1 rounded-lg cursor-pointer">
            <img
              src={msg.content}
              alt="preview"
              loading="lazy"
              decoding="async"
              className="max-w-full max-h-full object-contain"
              onClick={() => onImageClick(msg.content)}
            />
          </div>
        )}

        {kind === 'text' && (
          <p className="text-sm dark:text-white text-black whitespace-pre-wrap">{msg.content}</p>
        )}

        {kind === 'expired' && (
          <p className="text-sm italic opacity-70">🕐 This message disappeared</p>
        )}
        <p className={`text-xs mt-1 ${kind === 'image' ? 'text-gray-500 dark:text-white' : ''}`}>
          {msg.sendAt && displayTime(msg.sendAt)}
          {msg.expiresAt && (
            <span
              title={`Disappears ${new Date(msg.expiresAt).toLocaleString()}`}
              className="ml-1"
            >
              🕐
            </span>
          )}
        </p>
      </div>
    </div>
  );
}

// memo: a new message no longer re-renders (and re-mounts the map in) every old bubble
const MessageBubble = memo(MessageBubbleBase);

export const MessagesDisplay = () => {
  const { chattingWith, messages } = useContext(UserContext)!;
  const { currentUser } = useContext(AuthContext)!;

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const list = chattingWith ? messages[chattingWith._id] : undefined;

  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 5000);
    return () => clearInterval(id);
  }, []);

const display = useMemo(
  () =>
    list?.map((m) =>
      !m.expired && m.expiresAt && new Date(m.expiresAt).getTime() <= now
        ? toExpiredPlaceholder(m)
        : m
    ),
  [list, now]
  );
  // scroll to the bottom when the conversation or its messages change
  useEffect(() => {
    const el = chatContainerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [list, chattingWith?._id]);

  // only listen for Escape while the image modal is open
  useEffect(() => {
    if (!selectedImage) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedImage(null);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [selectedImage]);

  if (!chattingWith) return <EmptyState />;

  return (
    <div
      className="flex-1 min-h-0 overflow-y-auto overscroll-contain flex flex-col px-3 py-4 md:px-10 lg:px-20"
      ref={chatContainerRef}
    >
      {display && display.length > 0 ? (
        display.map((msg, index) => {
          const showDate =
            index === 0 || displayDate(msg.sendAt) !== displayDate(display[index - 1].sendAt);
          const isMine = msg.sender === currentUser?.user._id;

          return (
            <React.Fragment key={msg._id ?? msg.clientId ?? `${msg.sendAt}-${index}`}>
              {showDate && (
                <div className="w-full flex justify-center">
                  <div className="bg-gray-200 dark:bg-[#0a0f16] text-gray-600 dark:text-gray-400 p-1 rounded-lg">
                    {displayDate(msg.sendAt)}
                  </div>
                </div>
              )}
              <MessageBubble
                msg={msg}
                isMine={isMine}
                senderName={isMine ? 'You' : chattingWith.username}
                avatar={isMine ? currentUser!.user.profilePic : chattingWith.profilePic}
                onImageClick={setSelectedImage}
              />
            </React.Fragment>
          );
        })
      ) : (
        <EmptyState />
      )}

      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
          <div className="relative">
            <div className="max-w-screen-sm p-2 sm:p-4 bg-white dark:bg-gray-800 rounded-lg">
              <img
                src={selectedImage}
                alt="preview"
                className="max-w-full max-h-[80dvh] object-contain cursor-pointer"
                onClick={() => setSelectedImage(null)}
              />
            </div>
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-2 right-2 bg-white text-black p-2 rounded-full"
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
