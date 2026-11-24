import React, { createContext, useContext, useEffect, useState, useCallback  } from 'react';
import { UserContext } from './UserContext';
import { useNavigate } from 'react-router-dom';

const API_URL: string = import.meta.env.VITE_API_URL;
interface Data {
  user: User;
  joinedAt: string;


}
interface User {
  username: string;
  _id: string;
  profilePic: string;

}
interface AuthContextType {
    token: string | null;
    errors: { message: string; path: string }[];
    clearErrors: () => void;
    login: (username: string, password: string) => Promise<void>;
    register: (username: string, password: string) => Promise<void>
    logout: () => void
    validateToken: () => Promise<boolean>;
    message: string | string,
    currentUser: Data;
    isValid: boolean | undefined;
    setCurrentUser?: React.Dispatch<React.SetStateAction<Data>>;

}
const initialUser: Data = {
  joinedAt: '',
  user: {
    _id: '',
    username: '',
    profilePic: ''
  }

};

interface AuthProviderProps {
    children: React.ReactNode;
}

const AuthContext = createContext<AuthContextType | null >(null);

const AuthProvider: React.FC<AuthProviderProps>  = ({children}) => {
    const [ token , setToken ] = useState<string | null>(localStorage.getItem('token'));
    const [errors, setErrors] = useState<{ message: string; path: string }[]>([]);
    const [ message, setMessage ] = useState<string>('')
    const [currentUser, setCurrentUser] = useState<Data>(initialUser);
    const navigate = useNavigate();
    const [isValid, setIsValid] = useState<boolean | undefined>(undefined);
    const { setChattingWith, setMessages, setGlobalMessages, setUsers } = useContext(UserContext);

    // drop everything cached for the previous account, so the next person
    // to log in on this device doesn't land in (or briefly see) someone else's chats
    const clearSessionData = () => {
      setChattingWith(null);
      setMessages({});
      setGlobalMessages([]);
      setUsers([]);
      setCurrentUser(initialUser);
    };



const validateToken = useCallback(async () => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000); // never wait forever

  try {
    const response = await fetch(`${API_URL}/api/profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `${token}`,
      },
      credentials: 'include',
      signal: controller.signal,
    });

    if (response.ok) {
      const data = await response.json();
      if (data?.user) {
        setCurrentUser(data);
        setIsValid(true);
        return true;
      }
      setIsValid(false);
      return false;
    }

    if (response.status === 401 || response.status === 403 || response.status === 404) {
      localStorage.removeItem('token');
      setToken(null);
    }
    setIsValid(false);
    return false;
  } catch (error) {
    console.error('Error validating token:', error);
    setIsValid(false);
    return false;
  } finally {
    clearTimeout(timer);
  }
}, [token]);

    useEffect(() => {
    
      const token = localStorage.getItem('token');
      if (token) {
        setToken(token);
        validateToken();
      } else {
        setIsValid(false);
      }

    }, [validateToken])
  
    const register = async(username: string,password: string) => {
      setErrors([]);


      if ( username !== username.toLowerCase()){
         setErrors(prevErrors => [...prevErrors, {message: 'Username must be in lowercase!', path: 'username'}]);
      }

      if (password.length < 5) {
         setErrors(prevErrors => [...prevErrors, { message: 'Password must be at least 5 characters long!', path: 'password' }]);

      }




      if (username !== username.trim().toLowerCase() || password.length < 5) {
        return; // to stop execution
      }



      try {
        const response = await fetch(`${API_URL}/api/register`, {
          method: 'POST',
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({username, password}),
          credentials: 'include'
  
        });

        if (!response.ok) {
          const errorData = await response.json();
  
          setErrors(prevErrors => [
            ...prevErrors,
            { message: errorData.message || 'Something went wrong!', path: 'general' }
          ]);
  
          return;
        }
        
        const data = await response.json();

        if(data.message) {
          setMessage(data.message)
        }
  
        navigate('/login')

      } catch (error) {

        console.error('Error:', error);
        setErrors(prevErrors => [
          ...prevErrors,
          { message: 'Network error!', path: 'general' }
        ]);
  
      }
    }

    const login  = async(username: string,password: string) => {

        setErrors([]);


        if ( username !== username.toLowerCase()){
           setErrors(prevErrors => [...prevErrors, {message: 'Username must be in lowercase!', path: 'username'}]);
        }
  
        if (password.length < 5) {
           setErrors(prevErrors => [...prevErrors, { message: 'Password must be at least 5 characters long!', path: 'password' }]);
  
        }
  
  
  
  
        if (username !== username.trim().toLowerCase() || password.length < 5) {
          return; // to stop execution
        }
      
      try{
          
        const response = await fetch(`${API_URL}/api/login`, {
          method: 'POST',
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({username, password}),
          credentials: 'include'
  
        });
  
        if (!response.ok) {
          const errorData = await response.json();
  
          setErrors(prevErrors => [
            ...prevErrors,
            { message: errorData.message || 'Something went wrong!', path: 'general' }
          ]);
  
          return;
        }
        
        const data = await response.json();
  
  
      clearSessionData();
      localStorage.setItem('token', data.token );
      setToken(data.token)
      navigate('/homepage')
      }catch(error) {
  
        console.error('Error:', error);
        setErrors(prevErrors => [
          ...prevErrors,
          { message: 'Network error!', path: 'general' }
        ]);
  
      }
    }

    const clearErrors = useCallback(() => setErrors([]), []);

    const logout = () => {
      const userConfirmed = window.confirm('Are you sure you want to log out?');
      if (userConfirmed) {
        localStorage.removeItem('token');
        setToken(null);
        setIsValid(false);
        clearSessionData();
        navigate('/login');
      }
    };
    


    const contextValue: AuthContextType = {
        token,
        errors,
        clearErrors,
        login,
        logout,
        validateToken,
        register,
        message,
        currentUser,
        isValid,
        setCurrentUser,
      };
      
    return (
        <AuthContext.Provider value={contextValue}>
          {children}
        </AuthContext.Provider>
      );
    
}

export { AuthProvider, AuthContext };
