import React from 'react'

interface User {
    _id: string;
    username: string;
    profilePic: string;
  };
  
interface SearchResultProps {
    results:  User[];
}
export const SearchResult: React.FC<SearchResultProps> = ({results}) => {


  return (
    <div className="flex flex-col gap-8 pl-16 mt-6">
    { results && (
      results.map((user) => (
         <div key={user._id} className="flex items-center cursor-pointer ">
          <div className="w-12 h-12">
            <img className="rounded-full w-full h-full object-cover" src={user.profilePic} alt="user avatar" />
          </div>
          <div className="ml-4">
            <h2 className="text-xl font-bold">{user.username}</h2>
          </div>
    
        </div>
      ))
    )}
  </div>  )
}
