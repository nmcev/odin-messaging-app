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
  if (!selectedImage) return;

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
      const errorText = await response.text();
      throw new Error(`Failed to upload image: ${errorText}`);
    }

    const { url } = await response.json();

    const newMessage: GlobalMessage = {
      content: url,
      sender: authContext.currentUser!.user,
      sendAt: new Date().toISOString(),
    };

    socket?.emit('sendGlobalMessage', newMessage);

    setGlobalMessages((prevMessages) => [
      ...prevMessages,
      newMessage,
    ]);

    setSelectedImage(null);
  } catch (error) {
    console.error('Image upload error:', error);
  }
};
  return (
    <footer className="relative shrink-0 bg-gray-200 dark:bg-[#181A1B] text-[#191919] pt-2 px-2 md:px-4 md:pt-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] md:pb-3 flex items-center gap-2 md:gap-4">
      <input
        value={globalMessage}
        onChange={(e) => setGlobalMessage(e.target.value)}
        type="text"
        placeholder="Type a message"
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
              src={URL.createObjectURL(selectedImage)}
              alt="preview"
              className="w-full max-w-64 sm:w-64 aspect-square object-cover rounded-lg mb-4 border-white  border-2"
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
        <button onClick={handleSubmit} className="shrink-0 bg-orange-500 text-white py-2 px-4 rounded-full">
          Send
        </button>
      )}
    </footer>
  );
};
