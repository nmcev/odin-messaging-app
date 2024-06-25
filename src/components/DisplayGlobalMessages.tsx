import React, { useContext, useEffect, useRef } from 'react';
import { UserContext } from '../context/UserContext';
import { AuthContext } from '../context/AuthContext';

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

  const chatContainerRef = useRef<HTMLDivElement>(null);



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
        console.log(msg)

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
                  className='w-full h-full object-cover rounded-full'
                />
              </div>
              <div
                className={`p-2 rounded-lg ${
                  msg.sender._id === currentUser?.user._id
                    ? 'bg-[#ff9800] text-white ml-auto'
                    : 'bg-gray-200 dark:bg-[#0e1621] text-gray-600 dark:text-gray-400 mr-auto'
                }`}
              >
                <p className='text-sm poppins-bold'>
                  {msg.sender._id === currentUser?.user._id ? 'You' : msg.sender.username}
                </p>
                {msg.content.startsWith('https://odin-blog-bucket.s3.eu-north-1') ? (
                  <>
                    <img src={msg.content} alt='content' className='w-72 h-72 object-cover rounded-lg mt-2' />
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
    </div>
  );
};