import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { SunIcon, MoonIcon, LogoutIcon, ProfileIcon, SearchIcon, AnalysisIcon, UserCircleIcon } from './icons';
import ProfileForm from './ProfileForm';
import CareerAnalysis from './CareerAnalysis';
import CareerSearch from './CareerSearch';
import Footer from './Footer';

type View = 'profile' | 'analysis' | 'search';

const Dashboard: React.FC = () => {
  const [view, setView] = useState<View>('profile');
  const authContext = useContext(AuthContext);
  const themeContext = useContext(ThemeContext);

  const NavItem: React.FC<{
    icon: React.ReactNode;
    label: string;
    active: boolean;
    onClick: () => void;
  }> = ({ icon, label, active, onClick }) => (
    <button
      onClick={onClick}
      className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
        active
          ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg transform scale-105'
          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:transform hover:translate-x-1'
      }`}
      data-testid={`nav-${label.toLowerCase().replace(' ', '-')}`}
    >
      {icon}
      <span className="ml-3">{label}</span>
    </button>
  );

  const renderView = () => {
    switch (view) {
      case 'profile':
        return <ProfileForm onProfileComplete={() => setView('analysis')} />;
      case 'analysis':
        return <CareerAnalysis />;
      case 'search':
        return <CareerSearch />;
      default:
        return <ProfileForm onProfileComplete={() => setView('analysis')} />;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20">
      <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
        {/* Sidebar */}
        <aside className="w-full md:w-72 flex-shrink-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg p-4 md:p-6 flex flex-col justify-between shadow-2xl border-r border-gray-200 dark:border-gray-700">
          <div>
            <div className="flex items-center justify-center mb-6 md:mb-10 p-2 md:p-4">
              <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Career Compass
              </h1>
            </div>
            <nav className="space-y-2 md:space-y-3">
              <NavItem 
                icon={<ProfileIcon className="w-5 h-5"/>} 
                label="My Profile" 
                active={view === 'profile'} 
                onClick={() => setView('profile')} 
              />
              <NavItem 
                icon={<AnalysisIcon className="w-5 h-5"/>} 
                label="Career Analysis" 
                active={view === 'analysis'} 
                onClick={() => setView('analysis')} 
              />
              <NavItem 
                icon={<SearchIcon className="w-5 h-5"/>} 
                label="Search Careers" 
                active={view === 'search'} 
                onClick={() => setView('search')} 
              />
            </nav>
          </div>
          
          <div className="space-y-2 md:space-y-3 border-t border-gray-200 dark:border-gray-700 pt-4 md:pt-6 mt-4 md:mt-0">
            <div className="flex items-center p-2 md:p-3 text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-xl">
              <UserCircleIcon className="w-5 h-5 md:w-6 md:h-6" />
              <span className="ml-2 md:ml-3 text-xs md:text-sm font-medium truncate">{authContext?.user?.email}</span>
            </div>
            <button
              onClick={themeContext?.toggleTheme}
              className="flex items-center w-full px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm font-medium text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
              data-testid="toggle-theme-button"
            >
              {themeContext?.theme === 'light' ? <MoonIcon className="w-4 h-4 md:w-5 md:h-5" /> : <SunIcon className="w-4 h-4 md:w-5 md:h-5" />}
              <span className="ml-2 md:ml-3">Toggle Theme</span>
            </button>
            <button
              onClick={authContext?.logout}
              className="flex items-center w-full px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm font-medium text-red-500 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-all duration-200"
              data-testid="logout-button"
            >
              <LogoutIcon className="w-4 h-4 md:w-5 md:h-5" />
              <span className="ml-2 md:ml-3">Logout</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6 lg:p-10">
            <header className="flex justify-between items-center mb-6 md:mb-8" data-testid="dashboard-header">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Welcome Back!
              </h2>
            </header>
            {renderView()}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;
