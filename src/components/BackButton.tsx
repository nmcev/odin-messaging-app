import React from 'react';
import { useNavigate } from 'react-router-dom';

interface BackButtonProps {
  // where to go when there is no earlier page in this app (e.g. a shared link opened directly)
  fallback?: string;
}

export const BackButton: React.FC<BackButtonProps> = ({ fallback = '/homepage' }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    // React Router stores the history index in `idx`; 0 means this is the first page we loaded
    const idx = window.history.state?.idx;
    if (typeof idx === 'number' && idx > 0) {
      navigate(-1);
    } else {
      navigate(fallback, { replace: true });
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Go back"
      className="fixed z-10 left-[max(1rem,env(safe-area-inset-left))] top-[max(1rem,env(safe-area-inset-top))] flex items-center gap-1 pl-2 pr-4 py-2 rounded-full shadow-md bg-white text-gray-800 hover:bg-gray-100 dark:bg-[#181A1B] dark:text-gray-200 dark:hover:bg-[#232627] transition"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-5 h-5"
      >
        <path d="M15 18l-6-6 6-6" />
      </svg>
      <span className="text-sm font-semibold">Back</span>
    </button>
  );
};
