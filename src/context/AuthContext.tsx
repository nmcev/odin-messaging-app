import React, { createContext, useEffect, useState,  } from 'react';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
    token: string | null;
    errors: { message: string; path: string }[];
    login: (username: string, password: string) => Promise<void>;
    register: (username: string, password: string) => Promise<void>
    logout: () => void
    validateToken: () => Promise<boolean>;
    message: string | string

}

interface AuthProviderProps {
    children: React.ReactNode;
}

const AuthContext = createContext<AuthContextType | null >(null);

const AuthProvider: React.FC<AuthProviderProps>  = ({children}) => {
    const [ token , setToken ] = useState<string | null>(localStorage.getItem('token'));
    const [errors, setErrors] = useState<{ message: string; path: string }[]>([]);
    const [ message, setMessage ] = useState<string>('')
    const navigate = useNavigate();


    useEffect(() => {
      if (token) {
        setToken(localStorage.getItem('token'))

        validateToken().then(isValid => {
          if (!isValid) {
            logout();
          }
        });
      }
    }, [token])

    const validateToken = async () => {

      try {
        const response = await fetch('http://localhost:3000/api/profile', {
          method: 'GET',
          headers: {
            
            'Content-Type': 'application/json',
            'Authorization': `${token}`,
        },
        credentials: 'include',
        })

        if (response.ok) {
          const data = await response.json();

          return !!data.user
        } else {
          console.error('Error: response not ok');
          return false;
        }

      } catch(error) {
            console.error('Error validating token:', error);
            return false
      }

    }

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
        const response = await fetch('http://localhost:3000/api/register', {
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
          
        const response = await fetch('http://localhost:3000/api/login', {
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

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        navigate('/login');
    };
    


    const contextValue: AuthContextType = {
        token,
        errors,
        login,
        logout,
        validateToken,
        register,
        message
      };
      
    return (
        <AuthContext.Provider value={contextValue}>
          {children}
        </AuthContext.Provider>
      );
    
}

export { AuthProvider, AuthContext };
