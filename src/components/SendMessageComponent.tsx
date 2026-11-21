import React, { useContext, useState } from 'react';
import { UserContext } from '../context/UserContext';
import { AuthContext } from '../context/AuthContext';
import { Socket } from 'socket.io-client';
import attachIcon from '../assets/attach.svg';
import { Message } from '../types/Message';
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

const API_URL: string = import.meta.env.VITE_API_URL;



export const SendMessageComponent: React.FC<SendMessageComponentProps> = ({
  message,
  setMessage,
  setUsers,
  socket,
}) => {
  const authContext = useContext(AuthContext)!;
  const { chattingWith, messages, setMessages } = useContext(UserContext)!;
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

const [locating, setLocating] = useState(false);
const [locationError, setLocationError] = useState<string | null>(null);


  // handle sending message
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && chattingWith && messages[chattingWith._id]) {
      const newMessage: Message = {
        type: 'text',
        content: message,
        sender: authContext.currentUser!.user._id,
        receiver: chattingWith._id,
        sendAt: new Date().toISOString(),
      };

      // send message to the server
      socket?.emit('sendMessage', newMessage);

      setUsers?.((prevUsers) => {
        const updatedUsers = prevUsers.map((user) => {
          if (user._id === chattingWith._id) {
            return {
              ...user,
              lastMessage: message,
              lastMessageSendAt: new Date().toISOString(),
            };
          }
          return user;
        });

        const chattingUser = updatedUsers.find((user) => user._id === chattingWith._id);
        if (chattingUser) {
          const otherUsers = updatedUsers.filter((user) => user._id !== chattingWith._id);
          return [chattingUser, ...otherUsers];
        }

        return updatedUsers;
      });

      setMessages((prevMessages) => ({
        ...prevMessages,
        [chattingWith._id]: [...prevMessages[chattingWith._id], newMessage],
      }));

      setMessage('');
    }
  };

  // handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
    }
  };

  // handle sending image
const handleSendImage = async () => {
  if (!selectedImage || !chattingWith) return;

  try {
    const formData = new FormData();
    formData.append('file', selectedImage);

    const token = authContext.token;

    const response = await fetch(`${API_URL}/api/upload`, {
      method: 'POST',
      headers: {
        Authorization: `${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Upload failed: ${error}`);
    }

    const { url } = await response.json();

    const newMessage: Message = {
      type: 'image',
      content: url,
      sender: authContext.currentUser!.user._id,
      receiver: chattingWith._id,
      sendAt: new Date().toISOString(),
    };

    socket?.emit('sendMessage', newMessage);

    setUsers?.((prevUsers) => {
      const updatedUsers = prevUsers.map((user) => {
        if (user._id === chattingWith._id) {
          return {
            ...user,
            lastMessage: 'Image',
            lastMessageSendAt: new Date().toISOString(),
          };
        }

        return user;
      });

      const chattingUser = updatedUsers.find(
        (user) => user._id === chattingWith._id
      );

      if (chattingUser) {
        const otherUsers = updatedUsers.filter(
          (user) => user._id !== chattingWith._id
        );

        return [chattingUser, ...otherUsers];
      }

      return updatedUsers;
    });

    setMessages((prevMessages) => ({
      ...prevMessages,
      [chattingWith._id]: [
        ...prevMessages[chattingWith._id],
        newMessage,
      ],
    }));

    setSelectedImage(null);
       } catch (error) {
          console.error('Image upload error:', error);
     }
    };


 const handleSendLocation = () => {
  if (!chattingWith || locating) return;

  if (!navigator.geolocation) {
    setLocationError('Location is not supported by your browser.');
    return;
  }

  setLocating(true);
  setLocationError(null);

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      const now = new Date().toISOString();

      const newMessage: Message = {
        type: 'location',
        content: 'Location', // the server sets this too
        sender: authContext.currentUser!.user._id,
        receiver: chattingWith._id,
        sendAt: now,
        location: { lat: latitude, lng: longitude },
      };

      socket?.emit('sendMessage', newMessage);

      setUsers?.((prevUsers) => {
        const updatedUsers = prevUsers.map((user) =>
          user._id === chattingWith._id
            ? { ...user, lastMessage: 'Location', lastMessageSendAt: now }
            : user
        );
        const chattingUser = updatedUsers.find((u) => u._id === chattingWith._id);
        if (chattingUser) {
          const others = updatedUsers.filter((u) => u._id !== chattingWith._id);
          return [chattingUser, ...others];
        }
        return updatedUsers;
      });

      setMessages((prevMessages) => ({
        ...prevMessages,
        [chattingWith._id]: [...(prevMessages[chattingWith._id] ?? []), newMessage],
      }));

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
    <footer className="absolute bottom-0 left-0 right-0 bg-[#181A1B]  text-[#191919] py-3 px-4 flex items-center justify-between gap-5">
      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        type="text"
        placeholder="Type a message"
        className="p-2 rounded-full w-full focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-[#121212] dark:text-white"
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            handleSubmit(e);
          }
        }}
      />

      {/* Input to send image */}
      <label htmlFor="image" className="cursor-pointer">
        <img src={attachIcon} alt="image" className="w-8 h-8" />
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
        <div className="bg-[#2b2b2b] rounded-2xl p-8">
            <img
              src={URL.createObjectURL(selectedImage)}
              alt="preview"
              className="w-64 h-64 object-cover rounded-lg mb-4 border-white  border-2"
            />
            <button
              onClick={handleSendImage}
              className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
            >
              Send Image
            </button>
            <button
              onClick={() => setSelectedImage(null)}
              className="bg-gray-300 text-gray-700 py-2 px-4 rounded-lg ml-4 hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </dialog>
      )}


      {locationError && (
  <div className="absolute -top-9 left-4 bg-red-600 text-white text-xs px-3 py-1 rounded-lg">
    {locationError}
  </div>
)}

<button
  type="button"
  onClick={handleSendLocation}
  disabled={locating}
  title="Share current location"
  className="text-2xl disabled:opacity-50"
>
  {locating ? '⏳' : '📍'}
</button>
      {!selectedImage && (
        <button onClick={handleSubmit} className="bg-orange-500 text-white p-2 rounded-full">
          Send
        </button>
      )}
    </footer>
  );
};
