import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import editIcon from '../assets/edit.svg';
import { UserPage } from './UserPage';
import { useParams } from 'react-router-dom';

export const ProfilePage: React.FC = () => {
  const { username } = useParams();
  const [token] = useState(localStorage.getItem('token'));
  const authContext = useContext(AuthContext);

  if (!authContext) {
    return null;
  }

  const { currentUser, logout, setCurrentUser, isValid } = authContext;

  if (currentUser && currentUser.user.username !== username) {
    return <UserPage username={username} />;
  }

  if (!currentUser && !isValid) {
    return <UserPage username={username} />;
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/upload`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const { url } = await response.json();

      const imgUrlResponse = await fetch(url, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!imgUrlResponse.ok) {
        throw new Error('Network response was not ok');
      }

      const updatedImageUrl = url.split('?')[0];


      await fetch(`${import.meta.env.VITE_API_URL}/api/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${token}`,
        },
        body: JSON.stringify({ profilePic: updatedImageUrl }),
      });


      if (setCurrentUser) {
        setCurrentUser({ ...currentUser, user: { ...currentUser.user, profilePic: updatedImageUrl } });
      }

    } catch (error) {
      console.error('Error uploading image:', error);
    }
  }

  return (
    <section className="flex flex-col items-center justify-center min-h-screen w-screen bg-gray-100 p-5">
      <div className="bg-white shadow-lg rounded-lg p-6 max-w-sm w-full">
        <div className="flex flex-col items-center ">
          <div className="w-32 h-32 rounded-full relative border-4 border-indigo-500 shadow-lg ">
            <img
              src={currentUser.user.profilePic}
              alt="profile"
              className="w-full h-full object-cover rounded-full"
            />
            <label className="absolute right-0 bottom-0 bg-indigo-500 text-white p-2 rounded-full shadow-md hover:bg-indigo-600 transition cursor-pointer">
              <img src={editIcon} alt="edit icon" />
              <input
                type="file"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          </div>
          <h2 className="mt-4 text-2xl font-bold text-indigo-600">{currentUser.user.username}</h2>
          <p className="mt-2 text-sm text-gray-500">Joined at: {currentUser.joinedAt}</p>
        </div>
        <div className="mt-4 flex flex-col items-center space-y-2">

          <button onClick={logout} className="bg-red-500 text-white px-4 py-2 rounded-full shadow-md hover:bg-red-600 transition">
            Log Out
          </button>
        </div>
      </div>
    </section>
  );
};
