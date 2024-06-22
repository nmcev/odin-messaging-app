import { Outlet } from "react-router-dom"
import React from "react"
import { AuthProvider } from "./context/AuthContext"
const  App: React.FC = () => {
  return (
    <AuthProvider>
    <div className='flex flex-col min-h-screen'>
        <Outlet />
    </div>
    </AuthProvider>
  )
}

export default App
