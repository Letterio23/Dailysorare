
import React from 'react';
import LoginScreen from './components/LoginScreen';
import Dashboard from './components/Dashboard';
import { useAuth } from './hooks/useAuth';
import Spinner from './components/Spinner';

const App: React.FC = () => {
  const { userSlug, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-light-bg flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-bg font-sans">
      {userSlug ? <Dashboard /> : <LoginScreen />}
    </div>
  );
};

export default App;