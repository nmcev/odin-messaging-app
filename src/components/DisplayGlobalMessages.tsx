import React, { useContext, useEffect, useRef, useState } from 'react';
import { UserContext } from '../context/UserContext';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

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

  const chatContainerStyle: React.CSSProperties = {
    height: 'calc(100vh - 6rem)',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
  };

  if (!globalMessages || globalMessages.length === 0) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
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
    <div className='p-4 mt-20 overscroll-y-auto md:p-20 pb-20' style={chatContainerStyle} ref={chatContainerRef}>
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
              <div className='w-10 h-10'>
                <img
                  src={msg.sender._id === currentUser.user._id ? currentUser?.user.profilePic : msg.sender.profilePic}
                  alt='profile'
                  className='w-full h-full object-cover rounded-full cursor-pointer'
                  onClick={() => navigate(`/user/${msg.sender.username}`)}
                />
              </div>
              <div
                className={`p-2 rounded-lg ${
                  msg.sender._id === currentUser?.user._id
                    ? 'bg-[#ff9800] text-white ml-auto'
                    : 'bg-gray-200 dark:bg-[#0e1621] text-gray-600 dark:text-gray-400 mr-auto'
                }`}
              >
                <p className='text-sm poppins-bold cursor-pointer' onClick={() => navigate(`/user/${msg.sender.username}`)}>
                  {msg.sender._id === currentUser?.user._id ? 'You' : msg.sender.username}
                </p>
                {msg.content.startsWith('https://odin-blog-bucket.s3.eu-north-1') ? (
                  <>
                 <div className=' max-w-sm max-h-screen-lg p-2 rounded-lg  cursor-pointer'>
                   <img src={msg.content} alt='preview'
                    className='max-w-full max-h-full object-contain cursor-pointer' 
                    onClick={() => setSelectedImage(msg.content)}
                    />
                </div>
                    <p className='text-xs text-gray-500 dark:text-white mt-1'>
                      {msg.sendAt && displayTime(msg.sendAt)}
                    </p>
                  </>
                ) : (
                  <>
                    <p className='text-sm dark:text-white text-black'>{msg.content}</p>
                    <p className='text-xs mt-1'>{msg.sendAt && displayTime(msg.sendAt)}</p>
                  </>
                )}
              </div>
            </div>
          </React.Fragment>
        );
      })}
      {selectedImage && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75">
          <div className="relative">
          <div className=' max-w-sm max-h-screen-lg p-2 rounded-lg bg-white dark:bg-gray-800  cursor-pointer'>
                   <img src={selectedImage} alt='preview'
                    className='max-w-full max-h-full object-contain cursor-pointer' 
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
