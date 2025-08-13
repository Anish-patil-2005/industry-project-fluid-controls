// sai-123-stack/pulse-work/pulse-work-3a60247e05301e6a63964fe9c09ab838577cff10/src/components/auth/AuthGuard.tsx
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children, requiredRoles }) => {
  const { user, loading, token } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card p-8 rounded-2xl">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-center mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If not loading and there is no token, redirect to auth page
  if (!token) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // If there is a token but no user profile yet, it might still be fetching.
  // The AuthContext handles this, but as a safeguard, you can show loading.
  if (!user) {
    return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="glass-card p-8 rounded-2xl">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-center mt-4 text-muted-foreground">Verifying...</p>
          </div>
        </div>
      );
  }

  // If roles are required, check if the user has one of them
  if (requiredRoles && !requiredRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};