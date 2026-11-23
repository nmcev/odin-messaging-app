import React, { useContext, useEffect, useState, ChangeEvent } from "react";
import { AuthContext } from "../context/AuthContext";

const SEARCH_DELAY_MS = 500;

interface User {
  _id: string;
  username: string;
  profilePic: string;
  lastMessage: string;
  lastMessageSendAt: string;
}

interface SearchBarProps {
  setResults: (results: User[]) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ setResults }) => {
  const [query, setQuery] = useState('');
  const token = useContext(AuthContext)?.token;

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      return;
    }

    const controller = new AbortController();
    // wait until typing pauses; the cleanup cancels both the timer and any request in flight,
    // so an older, slower response can never overwrite newer results
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/search?query=${encodeURIComponent(trimmed)}`,
          {
            headers: { Authorization: `${token}` }, // the search route requires login
            signal: controller.signal,
          }
        );
        if (!response.ok) {
          throw new Error(`Search failed with status ${response.status}`);
        }
        const data: User[] = await response.json();
        setResults(data);
      } catch (error) {
        if ((error as Error).name === 'AbortError') return;
        console.error('Error fetching search results:', error);
        setResults([]);
      }
    }, SEARCH_DELAY_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, token, setResults]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  return (
    <form className="flex items-center justify-center px-3 py-3" onSubmit={(e) => e.preventDefault()}>
      <input
        type="search"
        placeholder="Search"
        className="py-2 px-4 font-sans text-base md:text-sm rounded-3xl min-w-0 focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1"
        value={query}
        onChange={handleChange}
      />
    </form>
  );
};

export default SearchBar;
