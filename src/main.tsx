import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import {  RouterProvider, createBrowserRouter, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage.tsx';
import { PrivateRoute } from './lib/PrivateRoute.tsx';
import { RegisterPage } from './pages/RegisterPage.tsx';
import { HomePage } from './pages/HomePage.tsx';
import  { ProfilePage }  from './pages/ProfilePage.tsx';
import { NotFound } from './pages/NotFound.tsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <NotFound />,

    children: [
      {
        path: '/',
        element: 
        <PrivateRoute>
          <Navigate to={'/homepage'}/>
        </PrivateRoute>

      },
       
      {
        path: 'login',
        element: <LoginPage />
      },
      {
        path: 'sign-up',
        element: <RegisterPage />
      },
      {
        path: 'homepage',
        element: <PrivateRoute>
          <HomePage />
          </PrivateRoute>
      },
      {
        path: 'user/:username',
        element: <ProfilePage />
      }
    ]
  }
]);


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
