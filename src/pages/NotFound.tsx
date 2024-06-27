import {Link } from 'react-router-dom'
export const NotFound = () => {
  return (
    <div className='flex items-center flex-col justify-center h-screen bg-gray-200 w-screen'>
      <div className='text-4xl  text-gray-800'>
        404 | Not Found
      </div>

      <div className='text-2xl text-gray-800 flex flex-col items-center'>

        <p>Sorry, the page you are looking for does not exist.</p>
        <Link to='/' className='text-blue-500 text-center'>Go back to home</Link>
    </div>

    
    </div>
)
}
