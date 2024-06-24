import React, { useContext, useState, useEffect } from 'react';
import { UserContext } from '../context/UserContext';
import { AuthContext } from '../context/AuthContext';
import { io, Socket } from 'socket.io-client';
import attachIcon from '../assets/attach.svg';

interface SendMessageComponentProps {
  message: string;
  setMessage: (message: string) => void;
  setUsers?: React.Dispatch<React.SetStateAction<User[]>>;
}

interface User {
  _id: string;
  username: string;
  profilePic: string;
  lastMessage: string;
  lastMessageSendAt: string;
}

const API_URL: string = import.meta.env.VITE_API_URL;

interface Message {
  content: string;
  sender: string;
  receiver: string;
  sendAt: string;
}

export const SendMessageComponent: React.FC<SendMessageComponentProps> = ({
  message,
  setMessage,
  setUsers,
}) => {
  const authContext = useContext(AuthContext)!;
  const { chattingWith, messages, setMessages } = useContext(UserContext)!;
  const [socket, setSocket] = useState<Socket | undefined>(undefined);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);


  // socket connection
  useEffect(() => {
    const newSocket = io(API_URL);

    newSocket.on('connect', () => {
      setSocket(newSocket);
    });
    newSocket.emit('register', authContext.currentUser.user._id);

    newSocket.on('receiveMessage', (receivedMessage: Message) => {
      setMessages((prevMessages: Record<string, Message[]>) => ({
        ...prevMessages,
        [receivedMessage.sender.toString()]: [
          ...(prevMessages[receivedMessage.sender.toString()] || []),
          receivedMessage,
        ],
      }));
    });

    return () => {
      newSocket.disconnect();
    };
  }, [authContext.currentUser.user._id, setMessages]);

  // handle sending message
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && chattingWith && messages[chattingWith._id]) {
      const newMessage: Message = {
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
    if (selectedImage) {
      try {
        const response = await fetch(`${API_URL}/api/upload`);
        if (!response.ok) {
          throw new Error('Failed to upload image');
        }

        const { url } = await response.json();

        const imgUrlResponse = await fetch(url, {
          method: 'PUT',
          body: selectedImage,
          headers: {
            'Content-Type': selectedImage.type,
          },
        });

        if (!imgUrlResponse.ok) {
          throw new Error('Failed to upload image');
        }

        const updatedImageUrl = url.split('?')[0];

        const newMessage: Message = {
          content: updatedImageUrl,
          sender: authContext.currentUser!.user._id,
          receiver: chattingWith!._id,
          sendAt: new Date().toISOString(),
        };

        socket?.emit('sendMessage', newMessage);

        setUsers?.((prevUsers) => {
          const updatedUsers = prevUsers.map((user) => {
            if (user._id === chattingWith!._id) {
              return {
                ...user,
                lastMessage: 'Image',
                lastMessageSendAt: new Date().toISOString(),
              };
            }
            return user;
          });

          const chattingUser = updatedUsers.find((user) => user._id === chattingWith!._id);
          if (chattingUser) {
            const otherUsers = updatedUsers.filter((user) => user._id !== chattingWith!._id);
            return [chattingUser, ...otherUsers];
          }

          return updatedUsers;
        });

        setMessages((prevMessages) => ({
          ...prevMessages,
          [chattingWith!._id]: [...prevMessages[chattingWith!._id], newMessage],
        }));

        setSelectedImage(null);
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <footer className="absolute bottom-0 left-0 right-0 bg-[#2b2b2b] text-[#191919] py-3 px-4 flex items-center justify-between gap-5">
      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        type="text"
        placeholder="Type a message"
        className="p-2 rounded-full w-full focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-[#121212] dark:text-white"
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

      {!selectedImage && (
        <button onClick={handleSubmit} className="bg-orange-500 text-white p-2 rounded-full">
          Send
        </button>
      )}
    </footer>
  );
};
