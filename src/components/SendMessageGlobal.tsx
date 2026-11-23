import React, { useContext, useEffect, useMemo, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Socket } from 'socket.io-client';
import attachIcon from '../assets/attach.svg';
import { UserContext } from '../context/UserContext';
import { MAX_MESSAGE_LENGTH } from '../utils/message';

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
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

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
  const {  setGlobalMessages } = useContext(UserContext)
 



  // handle sending message
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = globalMessage.trim();
    if (text) {
      const newMessage: GlobalMessage = {
        content: text,
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
    // reset so picking the same file again (after Cancel) still fires onChange
    e.target.value = '';
    if (file) {
      setUploadError(null);
      setSelectedImage(file);
    }
  };

  // handle sending image
 const handleSendImage = async () => {
  if (!selectedImage || uploading) return;

  setUploading(true);
  setUploadError(null);
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
    setUploadError('Upload failed. Try again.');
  } finally {
    setUploading(false);
  }
};
  return (
    <footer className="relative shrink-0 bg-gray-200 dark:bg-[#181A1B] text-[#191919] pt-2 px-2 md:px-4 md:pt-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] md:pb-3 flex items-center gap-1.5 sm:gap-2 md:gap-4">
      <input
        value={globalMessage}
        onChange={(e) => setGlobalMessage(e.target.value)}
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
