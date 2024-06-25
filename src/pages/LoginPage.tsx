import React, { useContext, useState, useEffect } from 'react';
import loginSide from '../assets/loginSide.png';
import { Navigate, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';


  const LoginPage: React.FC = (): React.ReactNode => {
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const authContext = useContext(AuthContext)
    const [isVisible, setIsVisible] = useState<boolean>(true);
    const navigate = useNavigate();

    const { login, errors, message } = authContext!;



    useEffect(() => {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 4000);

      return () => clearTimeout(timer);
    }, [message]);


    
    const handleSubmission=  async(e: React.FormEvent): Promise<void>  => {
      e.preventDefault();
      await login(username, password);

    }
      
    if (authContext && authContext.isValid) {
      return <><Navigate to={'/homepage'} replace={true} /></>
    }
      
  
    return (
      <>
        <section className="grid grid-cols-1 md:grid-cols-6 w-screen md:min-h-screen min-h-[80vh]">

          {/* Login form section */}
          <div className="col-span-1 md:col-span-2 flex flex-col justify-center p-4 mx-auto w-full max-w-md md:min-h-screen">
            <div className='flex flex-col items-center md:items-start'>

              <div className='flex items-center gap-2'>
                <img src={'./chat.svg'} alt="chat app logo" className="w-8 h-8"/>
                <h1 className='poppins-bold text-black dark:text-slate-50 md:text-4xl text-3xl '>TalkMate</h1>
              </div>

              <div className='p-4 text-center md:text-left'>
                <h1 className='poppins-bold text-xl text-left text-[#191919] dark:text-gray-50'>Welcome</h1>
                <p className='poppins-regular text-sm'> New to TalkMate?{' '} <a onClick={() => navigate('/sign-up')} className="text-[#ff9800] cursor-pointer">Create an account</a></p>
              </div>

              <form onSubmit={handleSubmission} className="space-y-6 mt-6 w-full">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-50 ">Username</label>
                  <input
                    id="username"
                    type="text"
                    value ={username}
                    onChange={(e) => setUsername(e.target.value.trim())}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-300 focus:border-orange-300 sm:text-sm"
                  />
                  {
                    errors.map((error, index) => (
                      error.path === 'username' && (
                      <p key={index} className='text-sm p-2 text-red-500'>{error.message}</p>
                      )
                    ))
                  }
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-50">Password</label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value.trim())}
                    required
                    autoComplete="current-password"  
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-300 focus:border-orange-300 sm:text-sm"
                  />
                  {
                    errors.map((error, index) => (
                      error.path === 'password' && (
                      <p key={index} className='text-sm p-2 text-red-500'>{error.message}</p>
                      )
                    ))
                  }
                </div>
                <div>
                  <button
                    type="submit"
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm inter-font font-medium text-white bg-[#ff9800] hover:bg-[#ff9900de] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-300"
                  >
                    Sign in
                  </button>
                </div>
              </form>

              {
                    errors.map((error, index) => (
                      error.path === 'general' && (
                      <p key={index} className='text-sm p-2 text-red-500'>{error.message}</p>
                      )
                    ))
                  }

            </div>
            {
               isVisible &&  message && (
                    <div className="p-4 mb-4 text-sm text-green-800 rounded-lg bg-green-50 dark:bg-gray-800 dark:text-green-400" role="alert">
                     <span className="font-medium">{message}</span>
                   </div>
                )
            }

          </div>

          {/* Image section */}
          <article className="bg-slate-50 dark:bg-white col-span-4 justify-center items-center hidden md:flex">
            <img src={loginSide} alt="Two guys" className="max-h-full max-w-[32rem]"/>
          </article>
        </section>
      </>
    );
  }

  export default LoginPage;
