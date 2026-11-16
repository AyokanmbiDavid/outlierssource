
import React, { useState } from "react";
import { Settings as SettingsIcon, Bell, Lock, Eye, Moon, User, ShieldCheck } from "lucide-react";

export default function Settings() {
  const [settings, setSettings] = useState({
    announcements: true,
    assignments: true,
    reminders: true,
    publicProfile: false,
    darkMode: false
  });

  const toggle = key => setSettings(prev => ({ ...prev, [key]: !prev[key] }));

  const Toggle = ({ label, description, value, onClick }) => (
    <div className="flex items-center justify-between gap-4 py-4">
      <div>
        <p className="font-semibold text-sm text-[#20302D]">{label}</p>
        <p className="text-xs text-[#81918B] mt-1">{description}</p>
      </div>
      <button onClick={onClick} className={`w-12 h-7 rounded-full p-1 transition ${value ? "bg-[#176D68]" : "bg-[#DCE5E1]"}`}>
        <span className={`block w-5 h-5 rounded-full bg-white transition ${value ? "translate-x-5" : ""}`} />
      </button>
    </div>
  );

  return (
    <div className="space-y-7 max-w-4xl">
      <div>
        <p className="text-sm text-[#81918B]">Manage your preferences</p>
        <h1 className="text-2xl font-bold text-[#20302D] mt-1">Settings</h1>
        <p className="text-sm text-[#81918B] mt-2">Customise your OutliersSource experience.</p>
      </div>

      <section className="bg-white rounded-2xl p-5 sm:p-6">
        <div className="flex items-center gap-3 mb-2"><Bell className="text-[#176D68]" /><h2 className="font-bold text-[#20302D]">Notifications</h2></div>
        <Toggle label="Announcements" description="Receive updates from your department." value={settings.announcements} onClick={() => toggle("announcements")} />
        <Toggle label="Assignment reminders" description="Get notified about upcoming deadlines." value={settings.assignments} onClick={() => toggle("assignments")} />
        <Toggle label="Learning reminders" description="Receive reminders about your learning activities." value={settings.reminders} onClick={() => toggle("reminders")} />
      </section>

      <section className="bg-white rounded-2xl p-5 sm:p-6">
        <div className="flex items-center gap-3 mb-2"><Eye className="text-[#176D68]" /><h2 className="font-bold text-[#20302D]">Privacy</h2></div>
        <Toggle label="Public profile" description="Allow other students to view your profile." value={settings.publicProfile} onClick={() => toggle("publicProfile")} />
      </section>

      <section className="bg-white rounded-2xl p-5 sm:p-6">
        <div className="flex items-center gap-3 mb-2"><Moon className="text-[#176D68]" /><h2 className="font-bold text-[#20302D]">Appearance</h2></div>
        <Toggle label="Dark mode" description="Dark theme support will be added later." value={settings.darkMode} onClick={() => toggle("darkMode")} />
      </section>

      <section className="bg-white rounded-2xl p-5 sm:p-6">
        <div className="flex items-center gap-3"><Lock className="text-[#176D68]" /><h2 className="font-bold text-[#20302D]">Account and security</h2></div>
        <p className="text-sm text-[#81918B] mt-3">Password changes, active sessions and account security will be connected when authentication is implemented.</p>
        <button className="mt-4 text-sm font-semibold text-[#176D68]">Manage account →</button>
      </section>

      <p className="text-xs text-[#81918B]">These preferences currently use temporary local state and will reset when the page is refreshed.</p>
    </div>
  );
}
