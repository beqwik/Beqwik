import { Navigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import useOrganization from "../../hooks/useOrganization";

function OrganizationGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading: authLoading } =
    useAuth();

  const {
    organizationUser,
    loading: organizationLoading,
  } = useOrganization();

  if (authLoading || organizationLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  if (organizationUser) {
    return (
      <Navigate
        to="/admin"
        replace
      />
    );
  }

  return <>{children}</>;
}

export default OrganizationGuard;