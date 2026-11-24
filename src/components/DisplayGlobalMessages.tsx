import React, { useContext, useEffect, useRef, useState } from 'react';
import { UserContext } from '../context/UserContext';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { avatarProps } from '../utils/avatar';
import { ChatImage } from './ChatImage';
import { isImageUrl } from '../utils/message';

interface GlobalMessage {
  content: string;
  sender: Sender;
  sendAt: string;
}

interface Sender {
  _id: string;
  profilePic: string;
  username: string;
}

export const DisplayGlobalMessages = () => {
  const { globalMessages } = useContext(UserContext)!;
  const { currentUser } = useContext(AuthContext)!;

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [globalMessages]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedImage(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  if (!globalMessages || globalMessages.length === 0) {
    return (
      <div className='flex-1 flex items-center justify-center p-4'>
        <h1 className='text-2xl font-bold text-gray-500 dark:text-gray-400'>
          Start a conversation
        </h1>
      </div>
    );
  }

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

  let lastDisplayDate: string | null = null;

  return (
    <div className='flex-1 min-h-0 overflow-y-auto overscroll-contain flex flex-col px-3 py-4 md:px-10 lg:px-20' ref={chatContainerRef}>
      {globalMessages.map((msg: GlobalMessage, index: number) => {
        const messageDate = displayDate(msg.sendAt);
        const showDate = messageDate !== lastDisplayDate;

        if (showDate && msg.sendAt) {
          lastDisplayDate = messageDate;
        }

        return (
          <React.Fragment key={index}>
            {showDate && (
              <div className='w-full flex justify-center'>
                <div className='bg-gray-200 dark:bg-[#0a0f16] text-gray-600 dark:text-gray-400 p-1 rounded-lg'>
                  {messageDate}
                </div>
              </div>
            )}

            <div
              key={index}
              className={`flex gap-2 ${
                msg.sender._id === currentUser?.user._id ? 'flex-row-reverse' : 'flex-row'
              } items-center mb-4`}
            >
              <div className='w-8 h-8 md:w-10 md:h-10 shrink-0 self-end'>
                <img
                  src={msg.sender._id === currentUser.user._id ? currentUser?.user.profilePic : msg.sender.profilePic}
                  alt='profile'
                  {...avatarProps}
                  className='w-full h-full object-cover rounded-full cursor-pointer'
                  onClick={() => navigate(`/user/${msg.sender.username}`)}
                />
              </div>
              <div
                className={`p-2 rounded-lg min-w-0 max-w-[80%] md:max-w-[70%] break-words ${
                  msg.sender._id === currentUser?.user._id
                    ? 'bg-[#ff9800] text-white ml-auto'
                    : 'bg-gray-200 dark:bg-[#0e1621] text-gray-600 dark:text-gray-400 mr-auto'
                }`}
              >
                <p className='text-sm poppins-bold cursor-pointer' onClick={() => navigate(`/user/${msg.sender.username}`)}>
                  {msg.sender._id === currentUser?.user._id ? 'You' : msg.sender.username}
                </p>
                {isImageUrl(msg.content) ? (
                  <>
                 <ChatImage src={msg.content} onOpen={setSelectedImage} />
                    <p className='text-xs text-gray-500 dark:text-white mt-1'>
                      {msg.sendAt && displayTime(msg.sendAt)}
                    </p>
                  </>
                ) : (
                  <>
                    <p className='text-sm dark:text-white text-black whitespace-pre-wrap'>{msg.content}</p>
                    <p className='text-xs mt-1'>{msg.sendAt && displayTime(msg.sendAt)}</p>
                  </>
                )}
              </div>
            </div>
          </React.Fragment>
        );
      })}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
          <div className="relative">
          <div className='max-w-screen-sm p-2 sm:p-4 rounded-lg bg-white dark:bg-gray-800 cursor-pointer'>
                   <img src={selectedImage} alt='preview'
                    className='max-w-full max-h-[80dvh] object-contain cursor-pointer' 
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
