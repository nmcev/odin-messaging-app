import React, { useContext } from 'react';
import { UserContext } from '../context/UserContext';
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
}

export const SearchResult: React.FC<SearchResultProps> = ({ results }) => {
  const userContext = useContext(UserContext);
  const authContext = useContext(AuthContext);

  const navigate = useNavigate();

  if (!userContext || !authContext) {
    return null;
  }

  const { setChattingWith } = userContext;

  const handleOpenChat = (user: User) => {

    if (authContext.currentUser?.user?._id === user._id) {
      return navigate(`/user/${user.username}`);
    }
    setChattingWith(user);
  };

  return (
    <section className="flex flex-col gap-8 pl-16 mt-6 ">
    {results && (
        results.map((data) => (
            <div key={data._id} className="flex items-center cursor-pointer hover:bg-[#1919194b] rounded-md p-2 mx-3" onClick={() => handleOpenChat(data)}>
                <div className="w-12 h-12 flex-shrink-0">
                    <img className="rounded-full w-full h-full object-cover" src={data.profilePic} alt="user avatar" />
                </div>
                <div className="ml-4 flex justify-between  w-full items-center ">
                    <h2 className="text-xl font-bold">{data.username}</h2>
                </div>

            </div>
        ))
    )}
</section>
  );
};
