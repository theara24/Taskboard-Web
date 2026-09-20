import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { authApi } from '../api';
import { Loader2 } from 'lucide-react';

export const AuthCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const processCallback = async () => {
      const token = searchParams.get('token');
      const error = searchParams.get('error');

      if (error) {
        setErrorMessage(`Google authentication failed: ${error}`);
        setTimeout(() => navigate('/login'), 3000);
        return;
      }

      if (!token) {
        setErrorMessage('No authentication token received from OAuth provider.');
        setTimeout(() => navigate('/login'), 3000);
        return;
      }

      try {
        localStorage.setItem('taskboard_token', token);
        const user = await authApi.getMe();
        setSession(token, user);
        navigate('/dashboard', { replace: true });
      } catch (err: any) {
        setErrorMessage(err.message || 'Failed to authenticate user session.');
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    processCallback();
  }, [searchParams, navigate, setSession]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md max-w-md w-full text-center">
        {errorMessage ? (
          <div className="space-y-4">
            <div className="text-red-600 text-lg font-semibold">Authentication Error</div>
            <p className="text-sm text-gray-600 dark:text-gray-300">{errorMessage}</p>
            <p className="text-xs text-gray-400">Redirecting to login page...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto" />
            <h2 className="text-lg font-medium text-gray-800 dark:text-gray-100">
              Completing secure authentication...
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Connecting your account to TaskBoard.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
export default AuthCallbackPage;
