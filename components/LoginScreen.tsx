import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import SorareIcon from './icons/SorareIcon';

const LoginScreen: React.FC = () => {
  const [slug, setSlug] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!slug.trim()) {
      setError('Please provide a gallery name.');
      return;
    }
    setError('');
    login(slug);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-light-bg p-4 sm:p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
            <SorareIcon className="w-20 h-20 mx-auto mb-5 text-sorare-blue" />
            <h1 className="text-4xl font-bold text-light-text-primary">Gallery Manager</h1>
            <p className="text-light-text-secondary mt-2">Sign in to view your Sorare gallery</p>
        </div>
        <div className="bg-light-surface shadow-xl rounded-xl p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="slug" className="block text-sm font-medium text-light-text-secondary mb-1">
                Gallery Name
              </label>
              <input
                id="slug"
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="e.g., betterthanthem-plusvalencia"
                className="mt-1 block w-full bg-light-bg border border-light-border rounded-lg shadow-sm py-3 px-4 text-light-text-primary focus:outline-none focus:ring-2 focus:ring-sorare-blue focus:border-sorare-blue transition-shadow"
              />
            </div>
            {error && <p className="text-sorare-red text-sm text-center">{error}</p>}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-sorare-blue hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-light-surface focus:ring-sorare-blue transition-all duration-200 transform hover:scale-105"
              >
                View Gallery
              </button>
            </div>
          </form>
           <div className="mt-8 text-xs text-gray-500 text-center">
                <p>Your gallery name is stored in your browser's local storage.</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;