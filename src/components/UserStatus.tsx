import React from 'react'
import { OnlineUsersList } from './OnlineUsersList'
import { OfflineUsers } from './OfflineUsers'


interface User {
    username: string;
    _id: string;
    profilePic: string;
    lastMessage: string; 
    lastMessageSendAt: string;
}

interface UserStatusProps {
    onlineUsers: User[];
    offlineUsers: User[];
    results: User[];
    setOpenGlobalChat: React.Dispatch<React.SetStateAction<boolean>>;
}

export const UserStatus: React.FC<UserStatusProps> = (
    {
        onlineUsers,
        offlineUsers,
        results,
        setOpenGlobalChat
        
    
    }

) => {
  return (

<>
    {/* Display online users */}
    {onlineUsers.length > 0 && !results.length && (
        <>
          <div className='border-b-[1px] border-gray-300 w-96 ml-10 mt-5'>
            <h2 className='text-xl font-bold text-gray-800 dark:text-gray-200 poppins-bold'>Online Users</h2>
          </div>
          <OnlineUsersList users={onlineUsers} setOpenGlobalChat={setOpenGlobalChat} />
        </>
      )}
  
      {/* Display offline users */}
      {offlineUsers.length > 0 && !results.length && (
        <>
          <div className='border-b-[1px] border-gray-300 w-96 ml-10 mt-5'>
            <h2 className='text-xl font-bold text-gray-800 dark:text-gray-200 poppins-bold'>Offline Users</h2>
          </div>
          <OfflineUsers users={offlineUsers} setOpenGlobalChat={setOpenGlobalChat} />
        </>
      )}

</>
)
}
