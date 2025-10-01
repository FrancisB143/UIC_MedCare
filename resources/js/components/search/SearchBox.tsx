import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import axios from 'axios';
import { debounce } from 'lodash';

interface SearchResult {
  id: number;
  first_name: string;
  last_name: string;
  [key: string]: any;
}

interface SearchBoxProps {
  type: 'student' | 'employee';
  onSelect: (result: SearchResult) => void;
  placeholder?: string;
}

export default function SearchBox({ type, onSelect, placeholder }: SearchBoxProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const searchEndpoint = type === 'student' ? '/api/students/search' : '/api/employees/search';

  const performSearch = debounce(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.get(searchEndpoint, {
        params: { query: searchQuery }
      });
      setResults(response.data);
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, 300);

  useEffect(() => {
    performSearch(query);
    return () => {
      performSearch.cancel();
    };
  }, [query]);

  const handleSelect = (result: SearchResult) => {
    onSelect(result);
    setQuery('');
    setShowResults(false);
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowResults(true)}
          placeholder={placeholder || `Search ${type}s...`}
          className="w-full px-4 py-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A3386C] focus:border-transparent"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
      </div>

      {showResults && (query.trim() || isLoading) && (
        <div className="absolute w-full mt-1 bg-white border rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">Loading...</div>
          ) : results.length > 0 ? (
            <ul>
              {results.map((result) => (
                <li
                  key={result.id}
                  onClick={() => handleSelect(result)}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  <div className="font-medium">
                    {result.first_name} {result.last_name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {type === 'student' ? result.student_number : result.employee_id}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-center text-gray-500">
              No {type}s found
            </div>
          )}
        </div>
      )}
    </div>
  );
}
