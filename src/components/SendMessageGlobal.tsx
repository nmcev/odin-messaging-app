import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Socket } from 'socket.io-client';
import attachIcon from '../assets/attach.svg';
import { UserContext } from '../context/UserContext';

interface SendMessageComponentProps {
    globalMessage: string;
    setGlobalMessage: (message: string) => void;
  socket?: Socket;
}



const API_URL: string = import.meta.env.VITE_API_URL;

interface GlobalMessage {
  content: string;
  sender: Sender
  sendAt: string;
}


interface Sender {
  _id: string;
  profilePic: string;
  username: string;
}

export const SendMessageGlobal: React.FC<SendMessageComponentProps> = ({
  globalMessage,
  setGlobalMessage,
  socket,
}) => {

  const authContext = useContext(AuthContext)!;
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const {  setGlobalMessages } = useContext(UserContext)
 



  // handle sending message
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (globalMessage.trim()) {
      const newMessage: GlobalMessage = {
        content: globalMessage,
        sender: authContext.currentUser!.user,
        sendAt: new Date().toISOString(),
      };

      socket?.emit('sendGlobalMessage', newMessage);

      // set global message to update the UI

      setGlobalMessages((prevMessages) => {
        return [...prevMessages, newMessage];
      }
        );
      setGlobalMessage('');


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

        const newMessage: GlobalMessage = {
          content: updatedImageUrl,
          sender: authContext.currentUser!.user,
          sendAt: new Date().toISOString(),
        };

        socket?.emit('sendGlobalMessage', newMessage);

        setGlobalMessages((prevMessages) => [...prevMessages, newMessage]);

        setSelectedImage(null);
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <footer className="absolute bottom-0 left-0 right-0 bg-[#181A1B]  text-[#191919] py-3 px-4 flex items-center justify-between gap-5">
      <input
        value={globalMessage}
        onChange={(e) => setGlobalMessage(e.target.value)}
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

      {!selectedImage && (
        <button onClick={handleSubmit} className="bg-orange-500 text-white p-2 rounded-full">
          Send
        </button>
      )}
    </footer>
  );
};
