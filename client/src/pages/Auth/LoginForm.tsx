import React, { useState } from 'react';
import type { FormEvent } from 'react';
import { useAuth } from '../../context/AuthContext';

// Simple Alert/Modal component replacement (Copied from SignUpForm for consistency)
const MessageModal: React.FC<{ message: string | null, type: 'error' | 'success', onClose: () => void }> = ({ message, type, onClose }) => {
    if (!message) return null;
    
    const bgColor = type === 'error' ? 'bg-red-100 border-red-400 text-red-700' : 'bg-green-100 border-green-400 text-green-700';
    const title = type === 'error' ? 'Error' : 'Success';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className={`w-full max-w-sm p-6 rounded-xl shadow-2xl border ${bgColor} transform transition-all duration-300 scale-100`}>
                <h3 className="text-lg font-bold mb-3">{title}</h3>
                <p className="mb-4">{message}</p>
                <div className="flex justify-end">
                    <button
                        onClick={onClose}
                        className={`px-4 py-2 text-sm font-medium rounded-lg shadow-md transition duration-150 ${type === 'error' ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-green-500 hover:bg-green-600 text-white'}`}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};


const LoginForm: React.FC = () => {
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      // The login function is handled by AuthContext
      await login({ email, password });
      // If successful, App.tsx will redirect to the Dashboard.
    } catch (err) {
      // API errors are usually thrown as strings or Error objects
      setError((err as Error).message || "Login failed. Please check your credentials and try again.");
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Email Input */}
        <div>
          <label htmlFor="email-login" className="block text-sm font-medium text-gray-700">Email Address</label>
          <input
            id="email-login"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
          />
        </div>

        {/* Password Input */}
        <div>
          <label htmlFor="password-login" className="block text-sm font-medium text-gray-700">Password</label>
          <input
            id="password-login"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
             <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
          ) : 'Log In'}
        </button>
      </form>

      {/* Error Message Modal */}
      <MessageModal 
        message={error} 
        type="error" 
        onClose={() => setError(null)} 
      />
    </>
  );
};

export default LoginForm;