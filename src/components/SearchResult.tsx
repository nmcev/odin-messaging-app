import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface User {
  _id: string;
  username: string;
  profilePic: string;
  lastMessage: string;
  lastMessageSendAt: string;
}

interface SearchResultProps {
  results: User[];
  onSelect: (user: User) => void;
}

export const SearchResult: React.FC<SearchResultProps> = ({ results, onSelect }) => {
  const authContext = useContext(AuthContext);

  const navigate = useNavigate();

  if (!authContext) {
    return null;
  }

  const handleOpenChat = (user: User) => {

    if (authContext.currentUser?.user?._id === user._id) {
      return navigate(`/user/${user.username}`);
    }
    onSelect(user);
  };

  return (
    <section className="flex flex-col gap-1 px-2 mt-2">
    {results && (
        results.map((data) => (
            <div key={data._id} className="flex items-center cursor-pointer hover:bg-[#1919194b] active:bg-[#1919194b] rounded-md p-2" onClick={() => handleOpenChat(data)}>
                <div className="w-12 h-12 flex-shrink-0">
                    <img className="rounded-full w-full h-full object-cover" src={data.profilePic} alt="user avatar" />
                </div>
                <div className="ml-3 flex justify-between min-w-0 flex-1 items-center">
                    <h2 className="text-lg font-bold truncate">{data.username}</h2>
                </div>

            </div>
        ))
    )}
</section>
  );
};
