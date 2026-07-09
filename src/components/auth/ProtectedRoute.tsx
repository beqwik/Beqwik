import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

interface Props {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: Props) {
  const { loading, isAuthenticated } = useAuth();

  useEffect(() => {
    console.log("ProtectedRoute", {
      loading,
      isAuthenticated,
      time: new Date().toLocaleTimeString(),
    });
  }, [loading, isAuthenticated]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}