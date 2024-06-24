
import React, { useContext} from 'react'
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LoadingSpinner } from '../components/LoadingSpinner';

interface PrivateRouteProps {
    children: React.ReactNode;
  }

  
export const PrivateRoute: React.FC<PrivateRouteProps> = ({children}) => {

    const authContext = useContext(AuthContext);


    const { isValid } = authContext ?? {};



    if (isValid === undefined) {
      return <LoadingSpinner />;
    }

    if (!isValid) {
      return <Navigate to="/login" />;
    }

    return <>{children}</>;
}
