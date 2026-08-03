import { Globe, Mail, Shield, Building2, Clock3, DollarSign, CalendarDays, Upload, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
    getPlatformSettings,
    updatePlatformSettings,
    uploadPlatformLogo,
} from "../../services/superAdmin/settingsService";
import { motion } from "framer-motion";

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`
        relative
        inline-flex
        h-7
        w-12
        items-center
        rounded-full
        transition-all
        duration-300
        ${checked ? "bg-blue-600" : "bg-slate-300"}
      `}
    >
      <span
        className={`
          inline-block
          h-5
          w-5
          transform
          rounded-full
          bg-white
          shadow
          transition-transform
          duration-300
          ${checked ? "translate-x-6" : "translate-x-1"}
        `}
      />
    </button>
  );
}

export default function Settings() {

  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [requireUppercase, setRequireUppercase] = useState(true);
  const [requireNumber, setRequireNumber] = useState(true);
  const [requireSpecial, setRequireSpecial] = useState(true);
  const [force2FA, setForce2FA] = useState(true);
const [singleSession, setSingleSession] = useState(false);
const [maintenanceMode, setMaintenanceMode] = useState(false);
const [autoRenew, setAutoRenew] = useState(true);
const [allowTrial, setAllowTrial] = useState(true);
const [gstEnabled, setGstEnabled] = useState(true);
const [taxIncluded, setTaxIncluded] = useState(false);

  const tabs = [
  { id: "general", label: "General", icon: Globe },
  { id: "branding", label: "Branding", icon: Upload },
  { id: "security", label: "Security", icon: Shield },
  { id: "payments", label: "Payments", icon: DollarSign },
];

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    setLoading(true);

    const data = await getPlatformSettings();

    setSettings(data);

    setLoading(false);
  }

if (loading || !settings) {
    return (
        <div className="flex items-center justify-center h-96">

<div className="flex items-center gap-3">

<div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"/>

<span className="font-medium text-slate-500">
Loading Settings...
</span>

</div>

</div>
    );
}
async function saveSettings() {
    try {
        setSaving(true);

        await updatePlatformSettings(settings);

       toast.success("Settings updated successfully!");
    } catch (err) {
        console.error(err);
        toast.error("Failed to save settings.");
    } finally {
        setSaving(false);
    }
}

async function uploadLogo(
  e: React.ChangeEvent<HTMLInputElement>
) {
  console.log("Upload started");

  if (!e.target.files?.length) return;

  console.log(e.target.files[0]);

  const url = await uploadPlatformLogo(
    e.target.files[0]
  );

  console.log("Uploaded URL:", url);

  setSettings({
    ...settings,
    logo_url: url,
  });
}
async function uploadFavicon(
  e: React.ChangeEvent<HTMLInputElement>
) {
  if (!e.target.files?.length) return;

  const url = await uploadPlatformLogo(
    e.target.files[0]
  );

  setSettings({
    ...settings,
    favicon_url: url,
  });
}
async function removeLogo() {

    await updatePlatformSettings({
        ...settings,
        logo_url: null,
    });

    setSettings({
        ...settings,
        logo_url: null,
    });
}
async function removeFavicon() {
  await updatePlatformSettings({
    ...settings,
    favicon_url: null,
  });

  setSettings({
    ...settings,
    favicon_url: null,
  });
}
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Settings <span className="text-blue-600">Configuration</span>
        </h1>
        <p className="text-slate-500 font-medium mt-1">
          Manage your platform preferences and security controls
        </p>
      </div>

      <div className="flex flex-wrap gap-3 mb-8">

  <div className="flex flex-wrap gap-2">

    {tabs.map((tab) => {

      const Icon = tab.icon;

      return (

        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all

            ${
              activeTab === tab.id
                ? "bg-blue-600 text-white shadow-md"
                : "text-slate-600 hover:bg-slate-100"
            }

          `}
        >

          <Icon className="w-4 h-4" />

          {tab.label}

        </button>

      );

    })}

  </div>

</div>

      {/* Grid */}
      <div className="space-y-6">

        {/* Settings Navigation */}


       {/* General Settings */}
{activeTab === "general" && (

<motion.div
initial={{opacity:0,y:15}}
animate={{opacity:1,y:0}}
transition={{duration:.25}}
>

<div className="max w-5xl bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm">

  <div className="flex items-center gap-3 mb-8">

    <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center">
      <Globe className="w-5 h-5 text-blue-600" />
    </div>

    <div>
      <h2 className="text-xl font-bold text-slate-900">
        General Settings
      </h2>

      <p className="text-sm text-slate-500">
        Configure your platform information.
      </p>
    </div>

  </div>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

    <div>

      <label className="block mb-2 text-sm font-medium text-slate-700">
        Platform Name
      </label>

      <div className="relative mt-2">

        <Building2 className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400"/>

        <input
          value={settings.platform_name}
          onChange={(e)=>
            setSettings({
              ...settings,
              platform_name:e.target.value
            })
          }
          className="
w-full
pl-11
pr-4
py-3
rounded-xl
border
border-slate-200
transition-all
duration-200
focus:outline-none
focus:ring-4
focus:ring-blue-100
focus:border-blue-500
"
        />

      </div>

    </div>

    <div>

      <label className="block mb-2 text-sm font-medium text-slate-700">
        Company Name
      </label>

      <div className="relative mt-2">

        <Building2 className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400"/>

        <input
          value={settings.company_name}
          onChange={(e)=>
            setSettings({
              ...settings,
              company_name:e.target.value
            })
          }
          className="
w-full
pl-11
pr-4
py-3
rounded-xl
border
border-slate-200
transition-all
duration-200
focus:outline-none
focus:ring-4
focus:ring-blue-100
focus:border-blue-500
"
        />

      </div>

    </div>

    <div>

      <label className="block mb-2 text-sm font-medium text-slate-700">
        Website
      </label>

      <div className="relative mt-2">

        <Globe className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400"/>

        <input
          value={settings.website}
          onChange={(e)=>
            setSettings({
              ...settings,
              website:e.target.value
            })
          }
          className="
w-full
pl-11
pr-4
py-3
rounded-xl
border
border-slate-200
transition-all
duration-200
focus:outline-none
focus:ring-4
focus:ring-blue-100
focus:border-blue-500
"
        />

      </div>

    </div>

    <div>

      <label className="block mb-2 text-sm font-medium text-slate-700">
        Support Email
      </label>

      <div className="relative mt-2">

        <Mail className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400"/>

        <input
          value={settings.support_email}
          onChange={(e)=>
            setSettings({
              ...settings,
              support_email:e.target.value
            })
          }
          className="
w-full
pl-11
pr-4
py-3
rounded-xl
border
border-slate-200
transition-all
duration-200
focus:outline-none
focus:ring-4
focus:ring-blue-100
focus:border-blue-500
"
        />

      </div>

    </div>

    <div>

      <label className="block mb-2 text-sm font-medium text-slate-700">
        Timezone
      </label>

      <div className="relative mt-2">

        <Clock3 className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400"/>

        <select
          value={settings.timezone}
          onChange={(e)=>
            setSettings({
              ...settings,
              timezone:e.target.value
            })
          }
          className="
w-full
pl-11
pr-4
py-3
rounded-xl
border
border-slate-200
transition-all
duration-200
focus:outline-none
focus:ring-4
focus:ring-blue-100
focus:border-blue-500
"
        >
          <option>Asia/Kolkata</option>
          <option>UTC</option>
          <option>America/New_York</option>
          <option>Europe/London</option>
        </select>

      </div>

    </div>

    <div>

      <label className="block mb-2 text-sm font-medium text-slate-700">
        Currency
      </label>

      <div className="relative mt-2">

        <DollarSign className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400"/>

        <select
          value={settings.currency}
          onChange={(e)=>
            setSettings({
              ...settings,
              currency:e.target.value
            })
          }
          className="
w-full
pl-11
pr-4
py-3
rounded-xl
border
border-slate-200
transition-all
duration-200
focus:outline-none
focus:ring-4
focus:ring-blue-100
focus:border-blue-500
"
        >
          <option>INR</option>
          <option>USD</option>
          <option>AED</option>
          <option>EUR</option>
        </select>

      </div>

    </div>

    <div>

      <label className="block mb-2 text-sm font-medium text-slate-700">
        Date Format
      </label>

      <div className="relative mt-2">

        <CalendarDays className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400"/>

        <select
          value={settings.date_format}
          onChange={(e)=>
            setSettings({
              ...settings,
              date_format:e.target.value
            })
          }
          className="
w-full
pl-11
pr-4
py-3
rounded-xl
border
border-slate-200
transition-all
duration-200
focus:outline-none
focus:ring-4
focus:ring-blue-100
focus:border-blue-500
"
        >
          <option>DD/MM/YYYY</option>
          <option>MM/DD/YYYY</option>
          <option>YYYY-MM-DD</option>
        </select>

      </div>

    </div>

    <div>

<label className="block mb-2 text-sm font-medium text-slate-700">
Logo
</label>

<input
  type="file"
  id="logo"
  accept="image/*"
  className="hidden"
  onChange={uploadLogo}
/>

<label
    htmlFor="logo"
    className="
        w-full
        h-50
        rounded-xl
        border-2
        border-dashed border-slate-300
        bg-slate-50/50
        hover:bg-blue-50/30
        transition-all
        duration-200
        flex
        flex-col
        items-center
        justify-center
        cursor-pointer
    "
>

    {settings.logo_url ? (

        <>
        <div className="flex flex-col items-center justify-center flex-1"></div>
            <img
                src={settings.logo_url}
                className="h-20 object-contain mb-8"
            />

            <div className="flex gap-3">

    <label
        htmlFor="logo"
        className="w-28 text-center px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium cursor-pointer hover:bg-blue-700"
    >
        Replace
    </label>

    <button
        type="button"
        onClick={removeLogo}
        className="w-28 px-4 py-2 rounded-lg border border-blue-300 text-blue-600 bg-white hover:bg-red-50 text-sm font-medium"
    >
        Remove
    </button>

</div>
        </>

    ) : (

        <>
            <Upload className="w-8 h-8 text-slate-400 mb-2"/>

            <p className="font-semibold">
                Upload Logo
            </p>

            <p className="text-xs text-slate-400">
                PNG • JPG • SVG
            </p>

        </>

    )}

</label>

</div>
  </div>

 <div className="border-t border-slate-100 pt-6 flex justify-end">

<button
  onClick={saveSettings}
  disabled={saving}
   className="px-7 py-3 rounded-xl bg-blue-600 text-white flex items-center gap-2 hover:bg-blue-700 transition-all"
>
    <Save className="w-5 h-5"/>

    {saving ? "Saving..." : "Save Changes"}
</button>

  </div>
</div>
</motion.div>
)}
{activeTab === "branding" && (
  <motion.div
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.25 }}
  >
    <div className="w-full max-w-5xl bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8">

    <div className="flex items-center gap-3 mb-8">

      <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center">
        <Upload className="w-5 h-5 text-blue-600" />
      </div>

      <div>
        <h2 className="text-xl font-bold">
          Branding Settings
        </h2>

        <p className="text-slate-500">
          Customize your platform branding.
        </p>
      </div>

    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
  <label className="block mb-2 text-sm font-medium text-slate-700">
    Company Logo
  </label>

  <input
    type="file"
    id="brandingLogo"
    accept="image/*"
    className="hidden"
    onChange={uploadLogo}
  />

  <label
    htmlFor="brandingLogo"
   className="
h-56
rounded-2xl
border-2
border-dashed
border-slate-300
hover:border-blue-500
transition
flex
flex-col
items-center
justify-between
py-8
"
  >
    {settings.logo_url ? (

  <>
<div className="flex flex-col items-center justify-center flex-1">

    <img
      src={settings.logo_url}
      className="h-20 object-contain mb-8"
    />

    <div className="flex gap-3">

      <label
        htmlFor="brandingLogo"
        className="
          px-5
          py-2.5
          rounded-xl
          bg-blue-600
          text-white
          text-sm
          font-semibold
          cursor-pointer
          hover:bg-blue-700
          transition
        "
      >
        Replace
      </label>

      <button
        type="button"
        onClick={removeLogo}
        className="
          px-5
          py-2.5
          rounded-xl
          border
          border-blue-300
          text-blue-600
          bg-white
          hover:bg-red-50
          transition
          text-sm
          font-semibold
        "
      >
        Remove
      </button>

    </div>
</div>
  </>

) : (

  <>
    <Upload className="w-10 h-10 text-slate-400" />

    <p className="mt-3 font-semibold">
      Upload Logo
    </p>

    <p className="text-xs text-slate-400">
      PNG • JPG • SVG
    </p>
  </>

)}
  </label>
  
</div>

<div>

  <label className="block mb-2 text-sm font-medium text-slate-700">
    Favicon
  </label>

  <input
    type="file"
    id="favicon"
    accept="image/*"
    className="hidden"
    onChange={uploadFavicon}
  />

  <label
    htmlFor="favicon"
    className="
h-56
rounded-2xl
border-2
border-dashed
border-slate-300
hover:border-blue-500
transition
flex
flex-col
items-center
justify-between
py-8
"
  >

    {settings.favicon_url ? (

      <>
        <img
          src={settings.favicon_url}
          className="h-20 object-contain"
        />

        <div className="flex gap-3 mt-5">

          <label
            htmlFor="favicon"
            className="px-5 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold cursor-pointer hover:bg-blue-700"
          >
            Replace
          </label>

          <button
            type="button"
            onClick={removeFavicon}
            className="px-5 py-2 rounded-xl border border-blue-300 text-blue-600 hover:bg-red-50 text-sm font-semibold"
          >
            Remove
          </button>

        </div>

      </>

    ) : (

      <>
        <Upload className="w-10 h-10 text-slate-400" />

        <p className="mt-3 font-semibold">
          Upload Favicon
        </p>

        <p className="text-xs text-slate-400">
          Recommended 512 × 512
        </p>

      </>

    )}

  </label>

</div>
</div>
<div className="border-t border-slate-100 mt-8 pt-6 flex justify-center">

  <button
    onClick={saveSettings}
    disabled={saving}
    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-all"
  >
    <Save className="w-5 h-5" />
    {saving ? "Saving..." : "Save Changes"}
  </button>

</div>
</div>
</motion.div>
)}


{activeTab === "security" && (

<motion.div
initial={{opacity:0,y:15}}
animate={{opacity:1,y:0}}
transition={{duration:.25}}
>

<div className="w-full max-w-5xl bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm">

<div className="flex items-center gap-3 mb-8">

<div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center">
<Shield className="w-5 h-5 text-blue-600"/>
</div>

<div>

<h2 className="text-xl font-bold">
Security Settings
</h2>

<p className="text-slate-500">
Configure platform authentication and security.
</p>

</div>

</div>
<div className="space-y-8">

  <div>

    <h3 className="text-lg font-semibold text-slate-900 mb-5">
      Authentication
    </h3>

    <div className="grid md:grid-cols-2 gap-6">

      {/* Session Timeout */}

      <div>

        <label className="block mb-2 text-sm font-medium text-slate-700">
          Session Timeout
        </label>

        <select
          className="
            w-full
            px-4
            py-3
            rounded-xl
            border
            border-slate-200
            focus:ring-4
            focus:ring-blue-100
            focus:border-blue-500
          "
        >
          <option>15 Minutes</option>
          <option>30 Minutes</option>
          <option>1 Hour</option>
          <option>4 Hours</option>
          <option>8 Hours</option>
        </select>

      </div>

      {/* Login Attempts */}

      <div>

        <label className="block mb-2 text-sm font-medium text-slate-700">
          Maximum Login Attempts
        </label>

        <input
          type="number"
          defaultValue={5}
          className="
            w-full
            px-4
            py-3
            rounded-xl
            border
            border-slate-200
            focus:ring-4
            focus:ring-blue-100
            focus:border-blue-500
          "
        />

      </div>

    </div>

  </div>

</div>
<div>

<h3 className="text-lg font-semibold mb-5">
Password Policy
</h3>

<div className="space-y-4">

<div className="flex items-center justify-between py-3">

<div>

<p className="font-medium">
Require Uppercase Letter
</p>

<p className="text-sm text-slate-500">
Passwords must contain at least one uppercase letter.
</p>

</div>

<Toggle
checked={requireUppercase}
onChange={setRequireUppercase}
/>

</div>

<div className="flex items-center justify-between py-3">

<div>

<p className="font-medium">
Require Number
</p>

<p className="text-sm text-slate-500">
Passwords must contain at least one numeric digit.
</p>

</div>

<Toggle
checked={requireNumber}
onChange={setRequireNumber}
/>

</div>

<div className="flex items-center justify-between py-3">

<div>

<p className="font-medium">
Require Special Character
</p>

<p className="text-sm text-slate-500">
Require symbols like @, #, $, %, &.
</p>

</div>

<Toggle
checked={requireSpecial}
onChange={setRequireSpecial}
/>

</div>

<div className="flex items-center justify-between py-3">

    <div>

        <p className="font-medium">
            Minimum Password Length
        </p>

        <p className="text-sm text-slate-500">
            Users must create passwords with at least this many characters.
        </p>

    </div>

    <input
        type="number"
        defaultValue={8}
        className="
            w-20
            px-3
            py-2
            rounded-xl
            border
            border-slate-200
            text-center
            focus:ring-4
            focus:ring-blue-100
            focus:border-blue-500
        "
    />

</div>

</div>
<h3 className="text-lg font-semibold mt-10 mb-5">
Login Protection
</h3>
<div className="grid md:grid-cols-2 gap-6">

<div>

<label className="block mb-2 text-sm font-medium">
Account Lockout Duration
</label>

<select className="w-full px-4 py-3 rounded-xl border border-slate-200">

<option>5 Minutes</option>

<option>15 Minutes</option>

<option>30 Minutes</option>

<option>1 Hour</option>

</select>

</div>

</div>
<div className="flex items-center justify-between py-4">

<div>

<p className="font-medium">
Force Two-Factor Authentication
</p>

<p className="text-sm text-slate-500">
Require every Super Admin to enable 2FA.
</p>

</div>

<Toggle
checked={force2FA}
onChange={setForce2FA}
/>

</div>
<div className="flex items-center justify-between py-4">

<div>

<p className="font-medium">
Single Active Session
</p>

<p className="text-sm text-slate-500">
Automatically log users out from other devices.
</p>

</div>

<Toggle
checked={singleSession}
onChange={setSingleSession}
/>

</div>
<h3 className="text-lg font-semibold mt-10 mb-5">
Maintenance Mode
</h3>
<div className="flex items-center justify-between py-4">

<div>

<p className="font-medium">
Enable Maintenance Mode
</p>

<p className="text-sm text-slate-500">
Temporarily disable access to the platform.
</p>

</div>

<Toggle
checked={maintenanceMode}
onChange={setMaintenanceMode}
/>

</div>
<div className="mt-4">

<label className="block mb-2 font-medium">

Maintenance Message

</label>

<textarea

rows={4}

placeholder="We'll be back shortly..."

className="w-full rounded-xl border border-slate-200 p-4 focus:ring-4 focus:ring-blue-100"

/>

</div>
</div>
<div className="border-t border-slate-100 pt-6 flex justify-end">

<button
onClick={saveSettings}
disabled={saving}
className="px-7 py-3 rounded-xl bg-blue-600 text-white flex items-center gap-2 hover:bg-blue-700"
>
<Save className="w-5 h-5"/>
{saving ? "Saving..." : "Save Changes"}
</button>

</div>

</div>

</motion.div>

)}

{activeTab === "payments" && (

<motion.div
initial={{opacity:0,y:15}}
animate={{opacity:1,y:0}}
transition={{duration:.25}}
>

<div className="w-full max-w-5xl bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm">
  <div className="flex items-center gap-3 mb-8">

<div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center">
<DollarSign className="w-5 h-5 text-blue-600"/>
</div>

<div>

<h2 className="text-xl font-bold">
Payment Settings
</h2>

<p className="text-slate-500">
Configure billing, subscriptions and payment gateways.
</p>
</div>
</div>
<h3 className="text-lg font-semibold mb-6">
  Payment Gateway
</h3>

<div className="grid grid-cols-1 md:grid-cols-2 gap-6">

  <div>
    <label className="block mb-2 text-sm font-medium">
      Gateway Provider
    </label>

    <select className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-100">
      <option>Razorpay</option>
      <option>Stripe</option>
      <option>PayPal</option>
    </select>
  </div>

  <div>
    <label className="block mb-2 text-sm font-medium">
      Mode
    </label>

    <select className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-100">
      <option>Live</option>
      <option>Sandbox</option>
    </select>
  </div>

  <div>
    <label className="block mb-2 text-sm font-medium">
      API Key
    </label>

    <input
      className="w-full px-4 py-3 rounded-xl border border-slate-200"
      placeholder="rzp_live_xxxxxxxxx"
    />
  </div>

  <div>
    <label className="block mb-2 text-sm font-medium">
      Secret Key
    </label>

    <input
      type="password"
      className="w-full px-4 py-3 rounded-xl border border-slate-200"
      placeholder="••••••••••••••"
    />
  </div>

</div>
<div className="mt-10">

<h3 className="text-lg font-semibold mb-6">
Subscription Settings
</h3>

<div className="grid grid-cols-1 md:grid-cols-2 gap-6">

<div>

<label className="block mb-2 text-sm font-medium">
Grace Period (Days)
</label>

<input
type="number"
defaultValue={10}
className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-100"
/>

</div>

<div>

<label className="block mb-2 text-sm font-medium">
Default Currency
</label>

<select
className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-100"
>

<option>INR</option>
<option>USD</option>
<option>AED</option>

</select>

</div>

</div>

</div>
<div className="mt-8 space-y-5">

<div className="flex items-center justify-between">

<div>

<p className="font-medium">
Auto Renew Subscriptions
</p>

<p className="text-sm text-slate-500">
Automatically renew subscriptions after successful payment.
</p>

</div>

<Toggle
checked={autoRenew}
onChange={setAutoRenew}
/>

</div>

<div className="flex items-center justify-between">

<div>

<p className="font-medium">
Allow Free Trial
</p>

<p className="text-sm text-slate-500">
Allow organizations to start with a trial plan.
</p>

</div>

<Toggle
checked={allowTrial}
onChange={setAllowTrial}
/>

</div>
<div className="mt-10">

  <h3 className="text-lg font-semibold mb-6">
    Invoice Settings
  </h3>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

    <div>

      <label className="block mb-2 text-sm font-medium">
        Invoice Prefix
      </label>

      <input
        defaultValue="BQK"
        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-100"
      />

    </div>

    <div>

      <label className="block mb-2 text-sm font-medium">
        GST Number
      </label>

      <input
        placeholder="27ABCDE1234F1Z5"
        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-100"
      />

    </div>

    <div className="md:col-span-2">

      <label className="block mb-2 text-sm font-medium">
        Company Address
      </label>

      <textarea
        rows={3}
        className="w-full rounded-xl border border-slate-200 p-4 focus:ring-4 focus:ring-blue-100"
      />

    </div>
  </div>
  <h3 className="text-lg font-semibold mt-10 mb-6">
  Tax Settings
</h3>
  <div className="grid md:grid-cols-2 gap-6">

<div>

<label className="block mb-2 text-sm font-medium">
GST Percentage
</label>

<input
type="number"
defaultValue={18}
className="w-full px-4 py-3 rounded-xl border border-slate-200"
/>

</div>
</div>
<div className="flex items-center justify-between py-5">

<div>

<p className="font-medium">
Enable GST
</p>

<p className="text-sm text-slate-500">
Charge GST on invoices.
</p>

</div>

<Toggle
checked={gstEnabled}
onChange={setGstEnabled}
/>

</div>
<div className="flex items-center justify-between py-5">

<div>

<p className="font-medium">
Prices Include Tax
</p>

<p className="text-sm text-slate-500">
Show subscription prices inclusive of GST.
</p>

</div>

<Toggle
checked={taxIncluded}
onChange={setTaxIncluded}
/>

</div>
<div className="border-t border-slate-100 mt-8 pt-6 flex justify-end">

<button
onClick={saveSettings}
disabled={saving}
className="px-7 py-3 rounded-xl bg-blue-600 text-white flex items-center gap-2 hover:bg-blue-700 transition-all"
>

<Save className="w-5 h-5"/>

{saving ? "Saving..." : "Save Changes"}

</button>

</div>

</div>
</div>
</div>
</motion.div>
)}

</div>
</div>

  );
}
