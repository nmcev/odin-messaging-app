import React, { useContext, useEffect, useMemo, useState } from 'react';
import { UserContext } from '../context/UserContext';
import { AuthContext } from '../context/AuthContext';
import { Socket } from 'socket.io-client';
import attachIcon from '../assets/attach.svg';
import { Message } from '../types/Message';
import { useDisappearing } from '../hooks/useDisappearing';
import { MAX_MESSAGE_LENGTH, createClientId } from '../utils/message';

interface SendMessageComponentProps {
  message: string;
  setMessage: (message: string) => void;
  setUsers?: React.Dispatch<React.SetStateAction<User[]>>;
  socket?: Socket;
}

interface User {
  _id: string;
  username: string;
  profilePic: string;
  lastMessage: string;
  lastMessageSendAt: string;
}

interface SendAck {
  ok: boolean;
  message?: Message;
}

const API_URL: string = import.meta.env.VITE_API_URL;
const ACK_TIMEOUT_MS = 10000;

export const SendMessageComponent: React.FC<SendMessageComponentProps> = ({
  message,
  setMessage,
  setUsers,
  socket,
}) => {
  const authContext = useContext(AuthContext)!;
  const { chattingWith, setMessages } = useContext(UserContext)!;
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const { seconds, setTimer } = useDisappearing(socket, chattingWith?._id);

  // one object URL per picked file, released when it changes or the dialog closes
  const previewUrl = useMemo(
    () => (selectedImage ? URL.createObjectURL(selectedImage) : null),
    [selectedImage]
  );
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  // Shared by text, image and location: show the message right away, move the chat to the
  // top of the list (adding it if this is a new conversation), then swap in the server's saved
  // copy, which carries the _id and expiresAt that disappearing messages need.
  const sendDirectMessage = (
    draft: Omit<Message, 'sender' | 'receiver' | 'sendAt' | 'clientId'>,
    preview: string
  ) => {
    if (!chattingWith) return;
    const partner = chattingWith;
    const sendAt = new Date().toISOString();
    const clientId = createClientId();
    const optimistic: Message = {
      ...draft,
      clientId,
      sender: authContext.currentUser!.user._id,
      receiver: partner._id,
      sendAt,
    };

    setMessages((prev) => ({
      ...prev,
      [partner._id]: [...(prev[partner._id] ?? []), optimistic],
    }));

    setUsers?.((prevUsers) => {
      const existing = prevUsers.find((u) => u._id === partner._id);
      const updated: User = {
        ...(existing ?? partner),
        lastMessage: preview,
        lastMessageSendAt: sendAt,
      };
      return [updated, ...prevUsers.filter((u) => u._id !== partner._id)];
    });

    const replace = (patch: (m: Message) => Message) =>
      setMessages((prev) => {
        const list = prev[partner._id];
        if (!list) return prev;
        return {
          ...prev,
          [partner._id]: list.map((m) => (m.clientId === clientId ? patch(m) : m)),
        };
      });

    if (!socket) {
      replace((m) => ({ ...m, failed: true }));
      return;
    }

    // timeout() makes the callback fire with an error if the server never answers
    socket
      .timeout(ACK_TIMEOUT_MS)
      .emit('sendMessage', optimistic, (err: Error | null, res?: SendAck) => {
        if (err || !res?.ok || !res.message) {
          replace((m) => ({ ...m, failed: true }));
          return;
        }
        const saved = res.message;
        // keep clientId so the React key (and any rendered map) stays the same
        replace((m) => ({ ...m, ...saved, clientId: m.clientId, failed: false }));
      });
  };

  // handle sending message
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = message.trim();
    if (!text || !chattingWith) return;
    sendDirectMessage({ type: 'text', content: text }, text);
    setMessage('');
  };

  // handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // reset so picking the same file again (after Cancel) still fires onChange
    e.target.value = '';
    if (file) {
      setUploadError(null);
      setSelectedImage(file);
    }
  };

  // handle sending image
  const handleSendImage = async () => {
    if (!selectedImage || !chattingWith || uploading) return;

    setUploading(true);
    setUploadError(null);
    try {
      const formData = new FormData();
      formData.append('file', selectedImage);

      const response = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        headers: {
          Authorization: `${authContext.token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Upload failed: ${error}`);
      }

      const { url } = await response.json();
      sendDirectMessage({ type: 'image', content: url }, 'Image');
      setSelectedImage(null);
    } catch (error) {
      console.error('Image upload error:', error);
      setUploadError('Upload failed. Try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleSendLocation = () => {
    if (!chattingWith || locating) return;

    // browsers only allow location on https:// or localhost (not on http://192.168.x.x)
    if (!window.isSecureContext) {
      setLocationError('Location sharing needs a secure (https) connection.');
      setTimeout(() => setLocationError(null), 4000);
      return;
    }

    if (!navigator.geolocation) {
      setLocationError('Location is not supported by your browser.');
      return;
    }

    setLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        sendDirectMessage(
          {
            type: 'location',
            content: 'Location', // the server sets this too
            location: { lat: latitude, lng: longitude },
          },
          'Location'
        );
        setLocating(false);
      },
      (error) => {
        setLocating(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError('Location permission was denied. Allow it in your browser settings.');
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError('Your location could not be determined.');
            break;
          case error.TIMEOUT:
            setLocationError('Getting your location timed out. Try again.');
            break;
          default:
            setLocationError('Could not get your location.');
        }
        setTimeout(() => setLocationError(null), 4000);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  return (
    <footer className="relative shrink-0 bg-gray-200 dark:bg-[#181A1B] text-[#191919] pt-2 px-2 md:px-4 md:pt-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] md:pb-3 flex items-center gap-1.5 sm:gap-2 md:gap-4">
      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        type="text"
        placeholder="Type a message"
        maxLength={MAX_MESSAGE_LENGTH}
        className="py-2 px-4 rounded-full flex-1 min-w-0 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-[#121212] dark:text-white"
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            handleSubmit(e);
          }
        }}
      />

      {/* Input to send image */}
      <label htmlFor="image" className="cursor-pointer shrink-0 p-1">
        <img src={attachIcon} alt="image" className="w-7 h-7 md:w-8 md:h-8" />
        <input
          id="image"
          type="file"
          onChange={handleImageChange}
          className="hidden"
          accept="image/*"
        />
      </label>


      {/* image dialog to preview image */}
      {selectedImage && (
        <dialog className="fixed inset-0 flex items-center justify-center backdrop-blur-sm backdrop-brightness-75 backdrop-opacity-75 backdrop-saturate-150" >
        <div className="bg-[#2b2b2b] rounded-2xl p-4 sm:p-8 mx-4 max-w-[calc(100vw-2rem)]">
            <img
              src={previewUrl ?? undefined}
              alt="preview"
              className="w-full max-w-64 sm:w-64 aspect-square object-cover rounded-lg mb-4 border-white  border-2"
            />
            {uploadError && <p className="text-red-400 text-sm mb-3">{uploadError}</p>}
            <button
              onClick={handleSendImage}
              disabled={uploading}
              className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {uploading ? 'Sending…' : 'Send Image'}
            </button>
            <button
              onClick={() => setSelectedImage(null)}
              disabled={uploading}
              className="bg-gray-300 text-gray-700 py-2 px-4 rounded-lg ml-4 hover:bg-gray-400 disabled:opacity-60"
            >
              Cancel
            </button>
          </div>
        </dialog>
      )}

      <select
  value={seconds}
  onChange={(e) => setTimer(Number(e.target.value))}
  title="Disappearing messages"
  className="shrink-0 text-sm rounded-lg p-1 dark:bg-[#0e1621] dark:text-white"
>
        <option value={0}>🕐 Off</option>
        <option value={15}>🕐 15s</option>
  <option value={60}>🕐 1m</option>
  <option value={300}>🕐 5m</option>
  <option value={600}>🕐 10m</option>
</select>

      {locationError && (
  <div className="absolute -top-9 left-2 right-2 sm:right-auto bg-red-600 text-white text-xs px-3 py-1 rounded-lg">
    {locationError}
  </div>
)}

<button
  type="button"
  onClick={handleSendLocation}
  disabled={locating}
  title="Share current location"
  className="shrink-0 text-2xl bg-transparent p-0 disabled:opacity-50"
>
  {locating ? '⏳' : '📍'}
</button>
      {!selectedImage && (
        <button onClick={handleSubmit} aria-label="Send" className="shrink-0 bg-orange-500 text-white p-2 sm:py-2 sm:px-4 rounded-full">
          {/* icon on phones to leave room for the input, text on bigger screens */}
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 sm:hidden">
            <path d="M3.4 20.4l17.45-7.48a1 1 0 000-1.84L3.4 3.6a.99.99 0 00-1.39.91L2 9.12c0 .5.37.93.87.99L17 12 2.87 13.88c-.5.07-.87.5-.87 1l.01 4.61c0 .71.73 1.2 1.39.91z" />
          </svg>
          <span className="hidden sm:inline">Send</span>
        </button>
      )}
    </footer>
  );
};
