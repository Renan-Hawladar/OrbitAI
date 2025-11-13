import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { profileAPI } from '../services/api';
import { fileToBase64, validateFileSize, formatFileSize } from '../utils/fileHelpers';
import Spinner from './Spinner';
import { UserCircleIcon } from './icons';
import { FaUpload, FaFilePdf, FaKey } from 'react-icons/fa';

interface ProfileFormProps {
  onProfileComplete: () => void;
  initialProfile?: UserProfile | null;
}

const ProfileForm: React.FC<ProfileFormProps> = ({ onProfileComplete, initialProfile }) => {
  const [profile, setProfile] = useState({
    name: '',
    degree: '',
    qualifications: '',
    skills: '',
    gemini_api_key: '',
    profile_picture_base64: null as string | null,
    cv_pdf_base64: null as string | null,
  });
  
  const [cvFileName, setCvFileName] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    // Load profile from API
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await profileAPI.getProfile();
      const data = response.data;
      setProfile({
        name: data.name || '',
        degree: data.degree || '',
        qualifications: data.qualifications || '',
        skills: data.skills || '',
        gemini_api_key: data.gemini_api_key || '',
        profile_picture_base64: data.profile_picture_base64,
        cv_pdf_base64: data.cv_pdf_base64,
      });
      if (data.cv_pdf_base64) {
        setCvFileName('CV uploaded');
      }
    } catch (err: any) {
      console.error('Error loading profile:', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      if (!validateFileSize(file, 5)) {
        setError('Profile picture must be less than 5MB');
        return;
      }
      
      try {
        const base64 = await fileToBase64(file);
        setProfile({ ...profile, profile_picture_base64: base64 });
      } catch (err) {
        setError('Error uploading profile picture');
      }
    }
  };

  const handlePDFChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      if (!file.type.includes('pdf')) {
        setError('Please upload a PDF file');
        return;
      }
      
      if (!validateFileSize(file, 5)) {
        setError(`CV file must be less than 5MB. Your file is ${formatFileSize(file.size)}`);
        return;
      }
      
      try {
        const base64 = await fileToBase64(file);
        setProfile({ ...profile, cv_pdf_base64: base64 });
        setCvFileName(file.name);
        setError(null);
      } catch (err) {
        setError('Error uploading CV file');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await profileAPI.updateProfile(profile);
      setSuccess('Profile updated successfully!');
      setTimeout(() => {
        onProfileComplete();
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'An error occurred while updating profile');
    } finally {
      setLoading(false);
    }
  };

  const isFormIncomplete = !profile.name || !profile.degree || !profile.qualifications || 
                           !profile.skills || !profile.gemini_api_key || !profile.cv_pdf_base64;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner message="Updating your profile..." size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto" data-testid="profile-form">
      <div className="mb-8">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-3">
          {initialProfile ? 'Edit Your Professional Profile' : 'Create Your Professional Profile'}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Fill out your details below. Upload your CV and provide your Gemini API key for AI-powered career analysis.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card p-8 space-y-8">
        {/* Profile Picture */}
        <div className="flex items-center space-x-6">
          {profile.profile_picture_base64 ? (
            <img 
              src={profile.profile_picture_base64} 
              alt="Profile" 
              className="w-24 h-24 rounded-full object-cover ring-4 ring-purple-500 ring-offset-2 dark:ring-offset-gray-800" 
            />
          ) : (
            <UserCircleIcon className="w-24 h-24 text-gray-300 dark:text-gray-600" />
          )}
          <div>
            <label 
              htmlFor="dp-upload" 
              className="inline-flex items-center gap-2 cursor-pointer bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5"
            >
              <FaUpload />
              Upload Photo
            </label>
            <input 
              id="dp-upload" 
              type="file" 
              accept="image/*" 
              onChange={handleImageChange} 
              className="hidden" 
            />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Max size: 5MB</p>
          </div>
        </div>

        {/* Name and Degree */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              id="name"
              value={profile.name}
              onChange={handleChange}
              required
              className="input-field"
              placeholder="John Doe"
              data-testid="name-input"
            />
          </div>
          <div>
            <label htmlFor="degree" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Current Degree / Field of Study <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="degree"
              id="degree"
              value={profile.degree}
              onChange={handleChange}
              required
              className="input-field"
              placeholder="B.Sc. Computer Science"
              data-testid="degree-input"
            />
          </div>
        </div>

        {/* Qualifications */}
        <div>
          <label htmlFor="qualifications" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Qualifications & Achievements <span className="text-red-500">*</span>
          </label>
          <textarea
            name="qualifications"
            id="qualifications"
            rows={4}
            value={profile.qualifications}
            onChange={handleChange}
            required
            className="input-field resize-none"
            placeholder="e.g., Certifications, Awards, Published Papers"
            data-testid="qualifications-input"
          />
        </div>

        {/* Skills */}
        <div>
          <label htmlFor="skills" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Skills <span className="text-red-500">*</span>
          </label>
          <textarea
            name="skills"
            id="skills"
            rows={3}
            value={profile.skills}
            onChange={handleChange}
            required
            className="input-field resize-none"
            placeholder="e.g., React, Python, Data Analysis, Project Management"
            data-testid="skills-input"
          />
        </div>

        {/* Gemini API Key */}
        <div>
          <label htmlFor="gemini_api_key" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            <FaKey className="inline mr-2" />
            Gemini API Key (gemini-2.0-flash-exp) <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            name="gemini_api_key"
            id="gemini_api_key"
            value={profile.gemini_api_key}
            onChange={handleChange}
            required
            className="input-field font-mono"
            placeholder="AIza...your-api-key"
            data-testid="api-key-input"
          />
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Get your API key from{' '}
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-600 dark:text-purple-400 hover:underline"
            >
              Google AI Studio
            </a>
          </p>
        </div>

        {/* CV Upload */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            <FaFilePdf className="inline mr-2 text-red-500" />
            Upload CV/Resume (PDF) <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-4">
            <label
              htmlFor="cv-upload"
              className="inline-flex items-center gap-2 cursor-pointer bg-gradient-to-r from-pink-500 to-rose-500 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5"
            >
              <FaUpload />
              {cvFileName ? 'Change CV' : 'Upload CV'}
            </label>
            <input
              id="cv-upload"
              type="file"
              accept="application/pdf"
              onChange={handlePDFChange}
              className="hidden"
            />
            {cvFileName && (
              <span className="text-sm text-green-600 dark:text-green-400 font-medium flex items-center gap-2">
                <FaFilePdf /> {cvFileName}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Max size: 5MB | PDF only</p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded-lg" data-testid="error-message">
            <p className="text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        {success && (
          <div className="p-4 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 rounded-lg" data-testid="success-message">
            <p className="text-green-700 dark:text-green-400">{success}</p>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isFormIncomplete || loading}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="submit-profile-button"
          >
            {initialProfile ? 'Update Profile' : 'Save Profile & Continue'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileForm;
