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
  
    // Check the form before contacting the server; one message per field, shown under it.
    const validateCredentials = (username: string, password: string, mode: 'login' | 'register') => {
      const found: { message: string; path: string }[] = [];

      if (!username.trim()) {
        found.push({ message: mode === 'login' ? 'Enter your username.' : 'Choose a username.', path: 'username' });
      } else if (username !== username.trim().toLowerCase()) {
        found.push({ message: 'Username must be lowercase, with no spaces.', path: 'username' });
      }

      if (!password) {
        found.push({ message: 'Enter your password.', path: 'password' });
      } else if (password.length < 5) {
        found.push({ message: 'Password must be at least 5 characters.', path: 'password' });
      }

      return found;
    };

    // The server answers errors in different shapes: express-validator's { errors: [{ msg, path }] },
    // { message }, or plain text (e.g. the rate limiter's "Too many attempts").
    const readServerErrors = async (response: Response) => {
      const text = await response.text().catch(() => '');
      let data: { errors?: { msg?: string; path?: string }[]; message?: string } | null = null;
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        data = null;
      }

      if (data?.errors?.length) {
        return data.errors.map((e) => ({
          message: e.msg || 'Invalid value.',
          path: e.path === 'username' || e.path === 'password' ? e.path : 'general',
        }));
      }
      const message = data?.message || text.trim() || 'Something went wrong. Please try again.';
      return [{ message, path: 'general' }];
    };

    const NETWORK_ERROR = { message: "Can't reach the server. Check your connection and try again.", path: 'general' };

    const register = async(username: string,password: string) => {
      const problems = validateCredentials(username, password, 'register');
      setErrors(problems);
      if (problems.length) return;

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
          setErrors(await readServerErrors(response));
          return;
        }

        const data = await response.json();

        if(data.message) {
          setMessage(data.message)
        }

        navigate('/login')

      } catch (error) {
        console.error('Error:', error);
        setErrors([NETWORK_ERROR]);
      }
    }

    const login  = async(username: string,password: string) => {
      const problems = validateCredentials(username, password, 'login');
      setErrors(problems);
      if (problems.length) return;

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
          setErrors(await readServerErrors(response));
          return;
        }

        const data = await response.json();

        clearSessionData();
        localStorage.setItem('token', data.token );
        setToken(data.token)
        navigate('/homepage')
      }catch(error) {
        console.error('Error:', error);
        setErrors([NETWORK_ERROR]);
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
