import { Navigate } from "react-router-dom";
import useOrganization from "../../hooks/useOrganization";
import useSubscription from "../../hooks/useSubscription";

interface Props {
  children: React.ReactNode;
}

export default function OnboardingGuard({
  children,
}: Props) {

  const {
    organization,
    loading: organizationLoading,
  } = useOrganization();

  const {
    subscription,
    loading: subscriptionLoading,
  } = useSubscription();

  if (
    organizationLoading ||
    subscriptionLoading
  ) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  /*
      Logged in
      but organization not created
  */

  if (!organization) {
    return (
      <Navigate
        to="/create-organization"
        replace
      />
    );
  }

  /*
      Organization created
      but no BeQwik subscription yet
  */

  if (!subscription) {
    return (
      <Navigate
        to="/select-plan"
        replace
      />
    );
  }

  /*
      Everything completed
  */

  return <>{children}</>;
}