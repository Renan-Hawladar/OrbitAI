// Working Code Below

import React, { useState, useContext } from 'react';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import HomePage from './components/HomePage';

function AppContent() {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const authContext = useContext(AuthContext);

  const renderContent = () => {
    if (authContext?.user) {
      return <Dashboard />;
    }
    if (isLoggingIn) {
      return <Login />;
    }
    return <HomePage onSignIn={() => setIsLoggingIn(true)} />;
  };

  return (
    <div className="min-h-screen text-gray-800 dark:text-gray-200 transition-colors duration-300">
      {renderContent()}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
