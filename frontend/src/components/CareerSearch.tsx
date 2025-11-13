import React, { useState } from 'react';
import { CareerPath } from '../types';
import { careerAPI } from '../services/api';
import Spinner from './Spinner';
import { FaSearch, FaCheckCircle, FaRocket, FaLightbulb } from 'react-icons/fa';

const CareerSearch: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [careerPath, setCareerPath] = useState<CareerPath | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      setError('Please enter a career to search for');
      return;
    }

    setLoading(true);
    setError(null);
    setHasSearched(true);
    
    try {
      const response = await careerAPI.searchCareer(searchQuery);
      if (response.data.career_paths && response.data.career_paths.length > 0) {
        setCareerPath(response.data.career_paths[0]);
      } else {
        setCareerPath(null);
        setError('No results found for this career. Try a different search term.');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error searching career. Please try again.');
      setCareerPath(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto" data-testid="career-search">
      <div className="mb-8">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-3">
          Search Career Paths
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Explore specific careers and get personalized guidance tailored to your profile.
        </p>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="card p-6 mb-8">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="e.g., Software Engineer, Data Scientist, Product Manager..."
              className="input-field pl-12"
              data-testid="search-input"
            />
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex items-center gap-2"
            data-testid="search-button"
          >
            <FaSearch />
            Search
          </button>
        </div>
      </form>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Spinner message="Searching and analyzing..." size="lg" />
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="card p-8 text-center" data-testid="search-error">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Search Error</h3>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
        </div>
      )}

      {/* No Results State */}
      {!loading && !error && hasSearched && !careerPath && (
        <div className="card p-8 text-center">
          <div className="text-gray-400 text-6xl mb-4">🔍</div>
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">No Results Found</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Try searching for a different career or refine your search term.
          </p>
        </div>
      )}

      {/* Career Path Result */}
      {careerPath && !loading && (
        <div className="card p-8 animate-fadeIn" data-testid="search-result">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                🎯
              </div>
              <h3 className="text-3xl font-bold text-gray-800 dark:text-white">
                {careerPath.career_path}
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg">
              <FaLightbulb className="inline mr-2 text-yellow-500" />
              {careerPath.suitability_reason}
            </p>
          </div>

          {/* Required Skills */}
          <div className="mb-8">
            <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4 uppercase tracking-wide">
              Required Skills
            </h4>
            <div className="flex flex-wrap gap-3">
              {careerPath.required_skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-5 py-2.5 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 text-purple-700 dark:text-purple-300 rounded-lg font-medium hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Roadmap */}
          <div>
            <h4 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-3">
              <FaRocket className="text-purple-600" />
              Your Personalized Roadmap
            </h4>
            <div className="space-y-4">
              {careerPath.roadmap.map((step, index) => (
                <div
                  key={index}
                  className="flex gap-4 p-5 bg-gradient-to-r from-gray-50 to-purple-50 dark:from-gray-700 dark:to-purple-900/20 rounded-xl hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5"
                  data-testid={`roadmap-step-${index}`}
                >
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                      {step.step}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h5 className="font-bold text-gray-800 dark:text-white mb-2 text-lg flex items-center gap-2">
                      <FaCheckCircle className="text-green-500" />
                      {step.action}
                    </h5>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      {step.details}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Initial State */}
      {!hasSearched && !loading && (
        <div className="card p-12 text-center">
          <div className="text-6xl mb-6">🔍</div>
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            Search for Any Career
          </h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Enter a career title above to get personalized insights, required skills, and a detailed roadmap based on your unique profile.
          </p>
        </div>
      )}
    </div>
  );
};

export default CareerSearch;
