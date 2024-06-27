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

export const OnlineUsersList: React.FC<UsersListProps> = ({ users, setOpenGlobalChat }) => {
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
                        <div className="w-12 h-12 flex-shrink-0 relative">
                            <img className="rounded-full w-full h-full object-cover  " src={data.profilePic} alt="user avatar" />
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full"></div>
                        </div>
                        <div className="ml-4 flex justify-between  w-full items-center ">
                            <div className="flex justify-center flex-col  ">
                            <h2 className="text-xl font-bold">{data.username}</h2>

                            </div>

                        </div>

                    </div>
                ))
            )}
        </section>
    );
};
