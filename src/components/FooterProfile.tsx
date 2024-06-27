import React, { useContext } from 'react'
import logoutIcon from '../assets/logout.svg'
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';


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

    <footer className=" sticky bottom-0 right-0 left-0 bg-gray-200   dark:bg-[#181A1B] text-white py-2 px-4 flex items-center justify-between gap-5">

          <div className="flex items-center cursor-pointer " onClick={() => navigate(`/user/${currentUser.user.username}`)}>
              <div className="w-12 h-12">
                  <img className="rounded-full w-full h-full object-cover" src={currentUser.user.profilePic} alt="user avatar" />
              </div>

              <div className="ml-4">
                <h2 className="text-xl font-bold text-[#181a1b] dark:text-slate-50">{currentUser.user.username}</h2>
              </div>
          </div>
            
            <button className=" cursor-pointer w-8 h-8 bg-transparent" onClick={logout}>
              <img  src={logoutIcon} alt="logout icon" />
            </button>
    </footer>
)      
  
}
