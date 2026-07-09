import { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";

import useAuth from "../../hooks/useAuth";
import useOrganization from "../../hooks/useOrganization";
import useSubscription from "../../hooks/useSubscription";

function SubscriptionGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const location = useLocation();

  const { user, loading: authLoading } = useAuth();

  const {
    organizationUser,
    loading: organizationLoading,
  } = useOrganization();

  const {
    subscription,
    loading: subscriptionLoading,
  } = useSubscription();

  // ===========================
  // DEBUG
  // ===========================

  useEffect(() => {
    console.log("========== SUBSCRIPTION GUARD MOUNT ==========");

    return () => {
      console.log("========== SUBSCRIPTION GUARD UNMOUNT ==========");
    };
  }, []);

  useEffect(() => {
    console.log("SubscriptionGuard State", {
      pathname: location.pathname,

      authLoading,
      organizationLoading,
      subscriptionLoading,

      hasUser: !!user,
      hasOrganization: !!organizationUser,
      hasSubscription: !!subscription,

      time: new Date().toLocaleTimeString(),
    });
  }, [
    location.pathname,
    authLoading,
    organizationLoading,
    subscriptionLoading,
    user,
    organizationUser,
    subscription,
  ]);

  // ===========================
  // LOADING
  // ===========================

  if (
    authLoading ||
    organizationLoading ||
    subscriptionLoading
  ) {
    console.log("SubscriptionGuard -> Loading Screen");

    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  // ===========================
  // NOT LOGGED IN
  // ===========================

  if (!user) {
    console.log("SubscriptionGuard -> Redirect Login");

    return <Navigate to="/login" replace />;
  }

  // ===========================
  // NO ORGANIZATION
  // ===========================

  if (!organizationUser) {
    console.log("SubscriptionGuard -> No Organization");

    if (location.pathname === "/create-organization") {
      return <>{children}</>;
    }

    return (
      <Navigate
        to="/create-organization"
        replace
      />
    );
  }

  // ===========================
  // NO SUBSCRIPTION
  // ===========================

  if (!subscription) {
    console.log("SubscriptionGuard -> No Subscription");

    if (location.pathname === "/select-plan") {
      return <>{children}</>;
    }

    return (
      <Navigate
        to="/select-plan"
        replace
      />
    );
  }

  // ===========================
  // PREVENT GOING BACK
  // ===========================

  if (
    location.pathname === "/select-plan" ||
    location.pathname === "/create-organization"
  ) {
    console.log("SubscriptionGuard -> Redirect Admin");

    return <Navigate to="/admin" replace />;
  }

  console.log("SubscriptionGuard -> Render Children");

  return <>{children}</>;
}

export default SubscriptionGuard;