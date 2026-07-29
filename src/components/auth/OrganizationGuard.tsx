import { Navigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import useOrganization from "../../hooks/useOrganization";
import useSubscription from "../../hooks/useSubscription";

function OrganizationGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading: authLoading } = useAuth();
  const { organizationUser, loading: organizationLoading } = useOrganization();
  const { subscription, loading: subscriptionLoading } = useSubscription();

  if (authLoading || organizationLoading || subscriptionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to admin dashboard only if user has an organization AND an active subscription
  if (organizationUser && subscription) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <>{children}</>;
}

export default OrganizationGuard;