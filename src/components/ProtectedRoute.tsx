import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, userProfile, loading } = useAuth();
  const [showTimeout, setShowTimeout] = useState(false);

  useEffect(() => {
    // If loading takes more than 10 seconds, show error
    const timeout = setTimeout(() => {
      if (loading || (user && !userProfile)) {
        setShowTimeout(true);
      }
    }, 10000);

    return () => clearTimeout(timeout);
  }, [loading, user, userProfile]);

  if (loading || (user && !userProfile)) {
    if (showTimeout) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="flex flex-col items-center gap-3 max-w-md text-center">
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <span className="text-2xl">⚠️</span>
            </div>
            <h2 className="text-lg font-semibold">Connection Issue</h2>
            <p className="text-sm text-muted-foreground">
              Unable to load your profile. Please check your internet connection and Firebase configuration.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
