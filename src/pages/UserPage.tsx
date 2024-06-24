import React, { useContext, useEffect, useState } from 'react'
import { LoadingSpinner } from '../components/LoadingSpinner';
import { UserContext } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';

interface UserPageProps {
    username: string | undefined
}

interface User {
    _id: string;
    username: string;
    profilePic: string;
    lastMessage: string;
    lastMessageSendAt: string;
}

interface Data {
    user: User;
    joinedAt: string;
}
export const UserPage: React.FC<UserPageProps>= ({ username }) => {
    const [user, setUser] = useState<Data | null>(null)
    const userContext = useContext(UserContext);

    if (!userContext) {
      return <LoadingSpinner />
    }

    const navigate = useNavigate();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/profile/${username}`)
                if (response.ok) {
                    const data = await response.json();
                    setUser(data);
                }
            } catch (error) {
                console.error(error)
            }
        }
        fetchUser();
    }, [username])

    if (!user) {
        return <LoadingSpinner />
    } 
      

    const sendMessage = (user: User) => {
      navigate('/homepage')
      userContext.setChattingWith(user)
    }

  return (
    <section className="flex flex-col items-center justify-center min-h-screen w-screen bg-gray-100  dark:bg-[#2b2b2b] p-5">
    <div className="bg-white shadow-lg rounded-lg p-6 max-w-sm w-full">
      <div className="flex flex-col items-center ">
        <div className="w-32 h-32 rounded-full relative border-4 border-orange-500 shadow-lg ">
          <img
            src={user.user.profilePic}
            alt="profile"
            className="w-full h-full object-cover rounded-full"
          />

        </div>
        <h2 className="mt-4 text-2xl font-bold text-orange-600">{user.user.username}</h2>
        <p className="mt-2 text-sm text-gray-500">Joined at: {user.joinedAt}</p>
      </div>
      <div className="mt-4 flex flex-col items-center space-y-2">
        <button className="bg-orange-500 text-white px-4 py-2 rounded-md" onClick={() => sendMessage(user.user)}>Send Message</button>
      </div>
    </div>
  </section>

  )
}
