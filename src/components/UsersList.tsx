import React from 'react';
import { lastMessagePreview } from '../utils/message';

interface User {
    username: string;
    _id: string;
    profilePic: string;
    lastMessage: string; 
    lastMessageSendAt: string;
    unreadCount?: number;
}

interface UsersListProps {
    users: User[];
    activeChatId: string | null; // the chat open right now, if any
    onToggleChat: (user: User) => void; // opens it, or closes it when it's already open
}

export const UsersList: React.FC<UsersListProps> = ({ users, activeChatId, onToggleChat }) => {

    const formatLastMessage = (timestamp: string): string => {
        const date = new Date(timestamp);
        const now = new Date();

        const diff = now.getTime() - date.getTime();
        const hoursDiff = diff / (1000 * 60 * 60);

        if (hoursDiff < 24) {
            const hours = date.getHours().toString().padStart(2, '0');
            const minutes = date.getMinutes().toString().padStart(2, '0');
            return `${hours}:${minutes}`;
        } else {
            const day = date.getDate().toString().padStart(2, '0');
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            return `${day}/${month}`;
        }
    };

    return (
        <section className="flex flex-col gap-1 px-2 mt-2">
            {users && (
                users.map((data) => {
                    const unread = (data.unreadCount ?? 0) > 0;
                    return (
                    <div key={data._id} className={`flex items-center cursor-pointer hover:bg-[#1919194b] active:bg-[#1919194b] rounded-md p-2 ${data._id === activeChatId ? 'bg-black/10 dark:bg-white/10' : ''}`}
                        aria-current={data._id === activeChatId ? 'true' : undefined}
                        title={data._id === activeChatId ? 'Click to close this chat' : undefined}
                        onClick={() => onToggleChat(data)}>
                        <div className="w-12 h-12 flex-shrink-0">
                            <img className="rounded-full w-full h-full object-cover" src={data.profilePic} alt="user avatar" />
                        </div>
                        <div className="ml-3 flex justify-between gap-2 min-w-0 flex-1 items-center">
                            <div className="flex justify-center flex-col min-w-0">
                            <h2 className="text-lg font-bold truncate">{data.username}</h2>
                            <p className={`text-sm truncate ${unread ? 'text-gray-900 dark:text-gray-100 font-semibold' : 'text-gray-500'}`}>
                                {lastMessagePreview(data.lastMessage)}
                            </p>
                            </div>
                            <div className='shrink-0 flex flex-col items-end gap-1.5'>
                                <p className={`text-xs ${unread ? 'text-blue-500 font-semibold' : 'text-gray-600'}`}>
                                    {formatLastMessage(data.lastMessageSendAt)}
                                </p>
                                {unread && (
                                    <span
                                        className="block w-3 h-3 rounded-full bg-blue-500"
                                        role="status"
                                        aria-label={`${data.unreadCount} unread ${data.unreadCount === 1 ? 'message' : 'messages'}`}
                                        title={`${data.unreadCount} unread`}
                                    />
                                )}
                            </div>
                        </div>

                    </div>
                    );
                })
            )}
        </section>
    );
};
