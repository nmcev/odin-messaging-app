import { Outlet } from "react-router-dom"
import React from "react"
import { AuthProvider } from "./context/AuthContext"
import { UserContextProvider } from "./context/UserContext"

const  App: React.FC = () => {
  return (
    <UserContextProvider>
    <AuthProvider>
    <div className='flex flex-col min-h-dvh w-full'>
        <Outlet />
    </div>
    </AuthProvider>
    </UserContextProvider>
  )
}

export default App
