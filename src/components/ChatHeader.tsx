import React, { useContext } from 'react'
import { UserContext } from '../context/UserContext'
import { useNavigate } from 'react-router-dom';
import globalIcon from '../assets/global.svg';
import { avatarProps } from '../utils/avatar';

interface ChatHeaderProps {
    isGlobal?: boolean;
    onBack?: () => void;
    isPartnerOnline?: boolean; // the person you're chatting with is connected right now
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ isGlobal = false, onBack, isPartnerOnline = false }) => {
    const userContext = useContext(UserContext);
    const navigate = useNavigate();

    const { chattingWith } = userContext
    const showBack = Boolean(onBack) && (Boolean(chattingWith) || isGlobal);

  return (
 <header className='shrink-0 bg-gray-200 dark:bg-[#181A1B] border-b-[1px] border-gray-300 dark:border-gray-700 px-3 py-2 md:p-4 pt-[max(0.5rem,env(safe-area-inset-top))] flex items-center gap-2'>
    {/* back to the chat list, phones only */}
    {showBack && (
        <button
            type='button'
            onClick={onBack}
            aria-label='Back to chats'
            className='md:hidden -ml-1 p-2 rounded-full bg-transparent text-gray-800 dark:text-gray-200 hover:bg-black/10 dark:hover:bg-white/10'
        >
            <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round' className='w-6 h-6'>
                <path d='M15 18l-6-6 6-6' />
            </svg>
        </button>
    )}

    {chattingWith ? (
        <div className='flex items-center cursor-pointer min-w-0' onClick={() => navigate(`/user/${chattingWith.username}`)} >
            <div className='relative w-10 h-10 md:w-12 md:h-12 shrink-0'>
            <img
                src={chattingWith.profilePic}
                alt='profile'
                {...avatarProps}
                className='w-full h-full object-cover rounded-full'
            />
            {isPartnerOnline && (
                // same green dot as the Online Users list; the ring separates it from the photo
                <span
                    className='absolute bottom-0 right-0 w-3 h-3 md:w-3.5 md:h-3.5 rounded-full bg-green-500 ring-2 ring-gray-200 dark:ring-[#181A1B]'
                    role='img'
                    aria-label='Online'
                    title='Online'
                />
            )}
            </div>
            <h2 className='ml-3 text-lg md:text-xl font-bold text-gray-800 dark:text-gray-200 truncate'>
            {chattingWith.username}
            </h2>
        </div>
    ) : isGlobal ? (
        <div className='flex items-center min-w-0'>
            <div className='w-10 h-10 md:w-12 md:h-12 shrink-0'>
                <img src={globalIcon} alt='global chat icon' className='w-full h-full object-cover rounded-full' />
            </div>
            <h2 className='ml-3 text-lg md:text-xl font-bold text-gray-800 dark:text-gray-200 truncate'>
                TalkMate Chat
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
