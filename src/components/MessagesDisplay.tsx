import React, { Suspense, lazy, memo, useContext, useEffect, useRef, useState } from 'react';
import { UserContext } from '../context/UserContext';
import { AuthContext } from '../context/AuthContext';
import { Message } from '../types/Message';

// Leaflet only loads when the first location message is rendered
const LocationCard = lazy(() =>
  import('./LocationCard').then((m) => ({ default: m.LocationCard }))
);

const CLOUDINARY_PREFIX = 'https://res.cloudinary.com/dw';

// helpers live outside the component so they are created once
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
function getKind(msg: Message): 'location' | 'image' | 'text' {
  if (msg.type === 'location' && msg.location) return 'location';
  if (msg.type === 'image' || msg.content.startsWith(CLOUDINARY_PREFIX)) return 'image';
  return 'text';
}

const chatContainerStyle: React.CSSProperties = {
  height: 'calc(100vh - 6rem)',
  overflowY: 'auto',
  display: 'flex',
  flexDirection: 'column',
};

const EmptyState = () => (
  <div className="min-h-screen flex items-center justify-center">
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
      <div className="w-10 h-10">
        <img
          src={avatar}
          alt="profile"
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover rounded-full"
        />
      </div>

      <div
        className={`p-2 rounded-lg ${
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
          <div className="max-w-sm p-2 rounded-lg cursor-pointer">
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
          <p className="text-sm dark:text-white text-black">{msg.content}</p>
        )}

        <p className={`text-xs mt-1 ${kind === 'image' ? 'text-gray-500 dark:text-white' : ''}`}>
          {msg.sendAt && displayTime(msg.sendAt)}
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
      className="p-4 mt-20 overscroll-y-auto md:p-20 pb-20"
      style={chatContainerStyle}
      ref={chatContainerRef}
    >
      {list && list.length > 0 ? (
        list.map((msg, index) => {
          const showDate =
            index === 0 || displayDate(msg.sendAt) !== displayDate(list[index - 1].sendAt);
          const isMine = msg.sender === currentUser?.user._id;

          return (
            <React.Fragment key={msg._id ?? `${msg.sendAt}-${index}`}>
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
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75">
          <div className="relative">
            <div className="max-w-screen-sm p-4 bg-white dark:bg-gray-800 rounded-lg">
              <img
                src={selectedImage}
                alt="preview"
                className="max-w-full max-h-full object-contain cursor-pointer"
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