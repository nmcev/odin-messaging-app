import React, { useContext } from 'react'
import { UserContext } from '../context/UserContext'
import { useNavigate } from 'react-router-dom';


export const ChatHeader:React.FC = () => {
    const userContext = useContext(UserContext);
    const navigate = useNavigate();

    const { chattingWith } = userContext
  return (
   
 <header className='bg-gray-200 dark:bg-[#1b1b1b] p-4 flex items-center justify-between top-0 absolute w-full shadow-lg'>
    {chattingWith ? (
        <div className='flex items-center cursor-pointer' onClick={() => navigate(`/user/${chattingWith.username}`)} >
            <div className='w-12 h-12'>
            <img
                src={chattingWith.profilePic}
                alt='profile'
                className='w-full h-full object-cover rounded-full'
            />
            </div>
            <h2 className='ml-4 text-xl font-bold text-gray-800 dark:text-gray-200'>
            {chattingWith.username}
            </h2>
        </div>
        ) : (
        <div className='flex items-center gap-2'>
            <img src={'./chat.svg'} alt='chat app logo' className='w-8 h-8' />
            <h1 className='poppins-bold text-black dark:text-slate-50 md:text-4xl text-3xl '>
            TalkMate
            </h1>
        </div>
        )}
    </header>
  )
}
