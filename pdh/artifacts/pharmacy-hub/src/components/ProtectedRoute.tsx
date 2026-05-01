import * as React from "react";
import { useLocation, Redirect } from "wouter";
import { useAuth, type Role } from "@/context/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: Role | Role[];
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, loading, openLoginModal } = useAuth();
  const [location] = useLocation();

  React.useEffect(() => {
    if (!loading && !user) {
      openLoginModal(location);
    }
  }, [loading, user, location, openLoginModal]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (requiredRole) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    if (!roles.includes(user.role)) {
      return <Redirect to="/" />;
    }
  }

  return <>{children}</>;
}
