import React, { useState, useCallback, ChangeEvent } from "react";

const debounce = <T extends unknown[]>(func: (...args: T) => void, wait: number) => {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: T) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
};

interface SearchBarProps {
  setResults: (results: any[]) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ setResults }) => {
  const [query, setQuery] = useState('');

  const handleSearch = useCallback(async (searchQuery: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/search?query=${searchQuery}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Error fetching search results:', error);
      setResults([]);
    }
  }, [setResults]);

  const debouncedSearch = useCallback(
    debounce((searchQuery: string) => handleSearch(searchQuery), 500),
    [handleSearch]
  );

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newQuery: string = e.target.value;
    setQuery(newQuery);
    debouncedSearch(newQuery);
  };

  return (
    <form className="flex items-center justify-center p-2 mx-14 my-2">
      <input
        type="text"
        placeholder="Search"
        className="py-2 px-3 font-sans text-sm rounded-3xl focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1"
        value={query}
        onChange={handleChange}
      />
    </form>
  );
};

export default SearchBar;
