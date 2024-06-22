
import React, { useContext, useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

interface PrivateRouteProps {
    children: React.ReactNode;
  }

  
export const PrivateRoute: React.FC<PrivateRouteProps> = ({children}) => {

    const authContext = useContext(AuthContext);
    const [ isValid, setIsValid ] = useState<boolean>(false);
    const [ loading, setLoading ] = useState<boolean>(true);


    if (!authContext) {
        return;
    }

    const { validateToken } = authContext;

    useEffect(() => {
        const checkToken = async () => {
          const isValid = await validateToken();
          setIsValid(isValid);
          setLoading(false);
        };
    

    checkToken();
}, [validateToken]);

if (loading) {
  return <div>Loading...</div>;
}

if (!isValid) {
  return <Navigate to="/login" />;
}

return <>{children}</>;


}
