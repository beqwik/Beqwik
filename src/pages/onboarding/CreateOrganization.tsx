import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { supabase } from "../../services/supabase";
import { createOrganization } from "../../services/organization/organizationService";

import useAuth from "../../hooks/useAuth";
import useOrganization from "../../hooks/useOrganization";
import BeQwikLogo from "../../components/BeQwikLogo";

function CreateOrganization() {
  const navigate = useNavigate();

  const { user, loading: authLoading } = useAuth();

  const {
    organizationUser,
    loading: organizationLoading,
    reloadOrganization,
  } = useOrganization();

  const [organizationName, setOrganizationName] =
    useState("");

  const [organizationType, setOrganizationType] =
    useState("Gym");

  const [email, setEmail] = useState("");

  const [phone, setPhone] = useState("");

  const [address, setAddress] = useState("");

  const [loading, setLoading] = useState(false);

  /**
   * Existing organization owners
   * should never see this page.
   */
  useEffect(() => {
    if (authLoading || organizationLoading) return;

    if (!user) {
      navigate("/login", { replace: true });
      return;
    }

    if (organizationUser) {
      navigate("/admin", { replace: true });
    }
  }, [
    authLoading,
    organizationLoading,
    user,
    organizationUser,
    navigate,
  ]);

  const handleCreateOrganization = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!user) {
      alert("Please login first");
      return;
    }

    if (organizationUser) {
      navigate("/admin", {
        replace: true,
      });
      return;
    }

    setLoading(true);

    try {
      const result =
        await createOrganization({
          organizationName,
          organizationType,
          email,
          phone,
          address,
        });

      if (!result.success) {
        alert("Failed to create organization");
        return;
      }

      const organization =
        result.organization;

      const { error } = await supabase
        .from("organization_users")
        .insert({
          organization_id:
            organization.id,
          user_id: user.id,
          full_name:
            user.user_metadata
              ?.full_name ||
            user.user_metadata?.name ||
            "Owner",
          email: user.email,
          role: "owner",
        });

      if (error) {
        alert(error.message);
        return;
      }

      /**
       * Refresh organization hook
       * so the entire app knows
       * organization now exists.
       */
      await reloadOrganization();

      alert(
        `Organization created successfully.\nOrganization Code: ${organization.organization_code}`
      );

      navigate("/select-plan", {
        replace: true,
      });
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || organizationLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-xl w-full">
        <div className="bg-white rounded-3xl p-10 shadow-xl border border-slate-200/80">
          <div className="flex flex-col items-center mb-6">
            <BeQwikLogo size={44} className="mb-6" />
            <span className="inline-block px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider">
              Step 1 of 2
            </span>
          </div>

          <h1 className="text-3xl font-extrabold text-slate-900 text-center tracking-tight">
            Create Your Organization
          </h1>

          <p className="mt-2 text-slate-500 text-sm text-center leading-relaxed">
            Tell us about your business so we can set up your workspace.
          </p>

          <form
            onSubmit={
              handleCreateOrganization
            }
            className="mt-8 space-y-5"
          >
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Organization Name
              </label>

              <input
                type="text"
                value={organizationName}
                onChange={(e) =>
                  setOrganizationName(
                    e.target.value
                  )
                }
                placeholder="Sunny MMA Academy"
                className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm placeholder-slate-400 bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Business Type
              </label>

              <select
                value={organizationType}
                onChange={(e) =>
                  setOrganizationType(
                    e.target.value
                  )
                }
                className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm bg-white"
              >
                <option>Gym</option>
                <option>Hostel</option>
                <option>Academy</option>
                <option>Coworking</option>
                <option>NGO</option>
                <option>Society</option>
                <option>Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Business Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(
                    e.target.value
                  )
                }
                placeholder="info@company.com"
                className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm placeholder-slate-400 bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Phone Number
              </label>

              <input
                type="text"
                value={phone}
                onChange={(e) =>
                  setPhone(
                    e.target.value
                  )
                }
                placeholder="+91 9876543210"
                className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm placeholder-slate-400 bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Address
              </label>

              <textarea
                value={address}
                onChange={(e) =>
                  setAddress(
                    e.target.value
                  )
                }
                rows={3}
                placeholder="Enter business address"
                className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm placeholder-slate-400 bg-white"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition disabled:opacity-50 text-sm shadow-sm"
            >
              {loading
                ? "Creating..."
                : "Continue"}
            </button>
          </form>

          </div>
        </div>
      </section>
    );
}

export default CreateOrganization;