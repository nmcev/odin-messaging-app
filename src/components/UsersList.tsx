import React, { useContext } from 'react';
import { UserContext } from '../context/UserContext';

interface User {
    username: string;
    _id: string;
    profilePic: string;
    lastMessage: string; 
    lastMessageSendAt: string;
}

interface UsersListProps {
    users: User[];
    setOpenGlobalChat: React.Dispatch<React.SetStateAction<boolean>>;
}

export const UsersList: React.FC<UsersListProps> = ({ users, setOpenGlobalChat }) => {
    const userContext = useContext(UserContext);
    const { setChattingWith } = userContext;

    const handleOpenChat = (user: User) => {
        setChattingWith(user);
        setOpenGlobalChat(false);
    };

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
        <section className="flex flex-col gap-8 pl-10 mt-4 ">
            {users && (
                users.map((data) => (
                    <div key={data._id} className="flex items-center cursor-pointer hover:bg-[#1919194b] rounded-md p-2 mx-3" onClick={() => handleOpenChat(data)}>
                        <div className="w-12 h-12 flex-shrink-0">
                            <img className="rounded-full w-full h-full object-cover" src={data.profilePic} alt="user avatar" />
                        </div>
                        <div className="ml-4 flex justify-between  w-full items-center ">
                            <div className="flex justify-center flex-col  ">
                            <h2 className="text-xl font-bold">{data.username}</h2>
                            <p className="text-gray-500">{
                                data.lastMessage.startsWith('https://odin-blog-bucket.s3.eu-north-1') ? (
                                    'Image'
                                ) : data.lastMessage.length > 30 ? (
                                    `${data.lastMessage.substring(0, 30)}...`
                                ) : data.lastMessage
                                }</p>
                            </div>
                            <div className=''>
                                <p className="text-sm text-gray-600">{formatLastMessage(data.lastMessageSendAt)}</p>
                            </div>
                        </div>

                    </div>
                ))
            )}
        </section>
    );
};
