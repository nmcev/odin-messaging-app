import React, { useEffect, useState } from 'react'

interface UserPageProps {
    username: string | undefined
}

interface User {
    _id: string;
    username: string;
    profilePic: string;
}

interface Data {
    user: User;
    joinedAt: string;
}
export const UserPage: React.FC<UserPageProps>= ({ username }) => {
    const [user, setUser] = useState<Data | null>(null)

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
        return <h1 className='text-2xl'>User not found</h1>
    }


  return (
    <section className="flex flex-col items-center justify-center min-h-screen w-screen bg-gray-100 p-5">
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


      </div>
    </div>
  </section>

  )
}
