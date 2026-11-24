import React, { useContext } from 'react'
import logoutIcon from '../assets/logout.svg'
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { avatarProps } from '../utils/avatar';


interface Data {
    user: User;
    joinedAt: string;
  
  
}

  interface User {
    username: string;
    _id: string;
    profilePic: string;
  
}
interface FooterProfileProps {
    currentUser:  Data
}

export const FooterProfile: React.FC<FooterProfileProps> = ({currentUser}) => {

    const authContext = useContext(AuthContext);
    const navigate = useNavigate();

    if (!authContext || !currentUser) {
        return null
    }

    const  { logout } = authContext
  return (

<footer className="mt-auto shrink-0 bg-gray-200 dark:bg-[#181A1B] text-white py-2 px-4 flex items-center justify-between gap-5 border-t-[1px] border-gray-300 dark:border-gray-700 md:pb-[max(0.5rem,env(safe-area-inset-bottom))]">
          <div className="flex items-center cursor-pointer min-w-0" onClick={() => navigate(`/user/${currentUser.user.username}`)}>
              <div className="w-10 h-10 md:w-12 md:h-12 shrink-0">
                  <img className="rounded-full w-full h-full object-cover" src={currentUser.user.profilePic} alt="user avatar" {...avatarProps} />
              </div>

              <div className="ml-3 min-w-0">
                <h2 className="text-lg md:text-xl truncate font-bold text-[#181a1b] dark:text-slate-50">{currentUser.user.username}</h2>
              </div>
          </div>
            
            <button className="shrink-0 cursor-pointer w-8 h-8 p-0 bg-transparent" aria-label="Log out" onClick={logout}>
              <img  src={logoutIcon} alt="logout icon" />
            </button>
    </footer>
)      
  
}
