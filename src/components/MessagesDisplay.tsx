import React, { useContext } from 'react'
import { UserContext } from '../context/UserContext'

import { AuthContext } from '../context/AuthContext';
export const MessagesDisplay = () => {

    const { chattingWith, messages } = useContext(UserContext)!;
    const { currentUser } = useContext(AuthContext)!;

    const chatContainerStyle: React.CSSProperties = {
        height: 'calc(100vh - 6rem)',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
      };


      if(!chattingWith) {
        return (
          <div className='min-h-screen flex items-center justify-center'>
            <h1 className='text-2xl font-bold text-gray-500 dark:text-gray-400'>
              Start a conversation
            </h1>
          </div>
        );
      }

  return (

    <div className='p-4 mt-20 overscroll-y-auto md:p-20 pb-20' style={chatContainerStyle}>
    {messages[chattingWith._id] && messages[chattingWith._id].length > 0 ? (
      messages[chattingWith._id].map((msg, index) => (
        <div
          key={index}
          className={`flex gap-2 ${
            msg.sender === currentUser?.user._id ? 'flex-row-reverse' : 'flex-row'
          } items-center mb-4`}
        >
          <div className='w-10 h-10'>
            <img
              src={msg.sender === currentUser?.user._id ? currentUser?.user.profilePic : chattingWith.profilePic}
              alt='profile'
              className='w-full h-full object-cover rounded-full'
            />
          </div>
          <div
            className={`p-2 rounded-lg ${
              msg.sender === currentUser?.user._id
                ? 'bg-[#ff9800] text-white ml-auto'
                : 'bg-gray-200 dark:bg-[#0e1621] text-gray-600 dark:text-gray-400 mr-auto'
            }`}
          >
            <p className='text-sm poppins-bold'>{msg.sender === currentUser?.user._id ? 'You' : chattingWith.username}</p>
            {/* render if the content is image */}
            {
              msg.content.startsWith('https://odin-blog-bucket.s3.eu-north-1') ? (
                <img src={msg.content} alt='content' className='w-44 h-44 object-cover rounded-lg mt-2' />
              ) : (
                <p className='text-sm'>{msg.content}</p> 
              )
            }

          </div>
        </div>
      ))
    ) : (
      <div className='min-h-screen flex items-center justify-center'>
        <h1 className='text-2xl font-bold text-gray-500 dark:text-gray-400'>
          Start a conversation
        </h1>
      </div>
    )}
  </div>
    )
}
