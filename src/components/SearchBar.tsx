import React, { useState, useCallback, ChangeEvent } from "react";

const debounce = (func: (...args: any[]) => void, wait: number) => {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func.apply(null, args);
    }, wait);
  };
};


interface SearchBarProps {
  setResults:(results: []) => void;
}
const SearchBar: React.FC<SearchBarProps>= ({ setResults }) => {

  const [ query, setQuery ] = useState('');


  const handleSearch = async (query: string) => {
    if (!query) {
      setResults([]);
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/search?query=${query}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Error fetching search results:', error);
      setResults([]);
    }
  };

  const debouncedSearch = useCallback(debounce(handleSearch, 300), []);

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
