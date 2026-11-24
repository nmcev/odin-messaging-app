import React from 'react';
import { avatarProps } from '../utils/avatar';

interface User {
    username: string;
    _id: string;
    profilePic: string;
    lastMessage: string; 
    lastMessageSendAt: string;
}

interface UsersListProps {
    users: User[];
    activeChatId: string | null; // the chat open right now, if any
    onToggleChat: (user: User) => void; // opens it, or closes it when it's already open
}

export const OfflineUsers: React.FC<UsersListProps> = ({ users, activeChatId, onToggleChat }) => {


    return (
        <section className="flex flex-col gap-1 px-2 mt-2">
            {users && (
                users.map((data) => (
                    <div key={data._id} className={`flex items-center cursor-pointer hover:bg-[#1919194b] active:bg-[#1919194b] rounded-md p-2 ${data._id === activeChatId ? 'bg-black/10 dark:bg-white/10' : ''}`}
                        aria-current={data._id === activeChatId ? 'true' : undefined}
                        title={data._id === activeChatId ? 'Click to close this chat' : undefined}
                        onClick={() => onToggleChat(data)}>
                        <div className="w-12 h-12 flex-shrink-0 relative">
                            <img className="rounded-full w-full h-full object-cover  " src={data.profilePic} alt="user avatar" {...avatarProps} />
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-gray-500 rounded-full"></div>
                        </div>
                        <div className="ml-3 flex justify-between gap-2 min-w-0 flex-1 items-center">
                            <div className="flex justify-center flex-col  ">
                            <h2 className="text-lg font-bold truncate">{data.username}</h2>

                            </div>

                        </div>

                    </div>
                ))
            )}
        </section>
    );
};
