import React, { useState, useEffect } from 'react';
import { CareerPath } from '../types';
import { careerAPI } from '../services/api';
import Spinner from './Spinner';
import { FaCheckCircle, FaRocket, FaLightbulb } from 'react-icons/fa';

interface CareerAnalysisProps {
  initialResult?: CareerPath[] | null;
}

const CareerAnalysis: React.FC<CareerAnalysisProps> = ({ initialResult }) => {
  const [careerPaths, setCareerPaths] = useState<CareerPath[] | null>(initialResult || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedPath, setExpandedPath] = useState<number | null>(null);

  const analyzeCareer = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await careerAPI.analyzeCareer();
      setCareerPaths(response.data.career_paths);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error analyzing career paths. Please check your Gemini API key and try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!careerPaths) {
      analyzeCareer();
    }
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-20">
        <Spinner message="Analyzing your profile with AI..." size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto" data-testid="analysis-error">
        <div className="card p-8 text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Analysis Error</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <button onClick={analyzeCareer} className="btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!careerPaths || careerPaths.length === 0) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="card p-8 text-center">
          <div className="text-gray-400 text-6xl mb-4">📊</div>
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">No Analysis Yet</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Complete your profile to get personalized career recommendations.
          </p>
          <button onClick={analyzeCareer} className="btn-primary">
            Analyze My Career Paths
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto" data-testid="career-analysis">
      <div className="mb-8">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-3">
          Your Career Paths
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Based on your profile, here are the top {careerPaths.length} career paths recommended for you.
        </p>
      </div>

      <div className="space-y-6">
        {careerPaths.map((path, index) => (
          <div
            key={index}
            className="card p-6 hover:shadow-2xl transition-all duration-300"
            data-testid={`career-path-${index}`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                    {index + 1}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
                    {path.career_path}
                  </h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                  <FaLightbulb className="inline mr-2 text-yellow-500" />
                  {path.suitability_reason}
                </p>
              </div>
            </div>

            {/* Required Skills */}
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide">
                Required Skills
              </h4>
              <div className="flex flex-wrap gap-2">
                {path.required_skills.map((skill, skillIndex) => (
                  <span
                    key={skillIndex}
                    className="px-4 py-2 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 text-purple-700 dark:text-purple-300 rounded-lg text-sm font-medium hover:shadow-md transition-shadow"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Roadmap Toggle */}
            <button
              onClick={() => setExpandedPath(expandedPath === index ? null : index)}
              className="w-full mt-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5"
              data-testid={`toggle-roadmap-${index}`}
            >
              <FaRocket className="inline mr-2" />
              {expandedPath === index ? 'Hide Roadmap' : 'View Detailed Roadmap'}
            </button>

            {/* Roadmap */}
            {expandedPath === index && (
              <div className="mt-6 space-y-4 animate-fadeIn" data-testid={`roadmap-${index}`}>
                <h4 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                  <FaRocket className="text-purple-600" />
                  Step-by-Step Roadmap
                </h4>
                {path.roadmap.map((step, stepIndex) => (
                  <div
                    key={stepIndex}
                    className="flex gap-4 p-4 bg-gradient-to-r from-gray-50 to-purple-50 dark:from-gray-700 dark:to-purple-900/20 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                        {step.step}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h5 className="font-bold text-gray-800 dark:text-white mb-2 flex items-center gap-2">
                        <FaCheckCircle className="text-green-500" />
                        {step.action}
                      </h5>
                      <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                        {step.details}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <button onClick={analyzeCareer} className="btn-secondary">
          Re-Analyze Career Paths
        </button>
      </div>
    </div>
  );
};

export default CareerAnalysis;
