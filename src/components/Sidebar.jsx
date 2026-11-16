
import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Bookmark,
  BookOpen,
  Bell,
  GraduationCap,
  Lightbulb,
  Award,
  FolderOpen,
  CalendarDays,
  Users,
  Settings,
  Activity,
  LogOut,
  X,
  UserRound,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

const navigation = [
  {
    title: "MAIN MENU",
    items: [
      { name: "Home", path: "/home", icon: LayoutDashboard },
      { name: "Bookmarks", path: "/bookmarks", icon: Bookmark },
      { name: "Courses", path: "/courses", icon: BookOpen },
      { name: "Tutorials", path: "/tutorials", icon: GraduationCap },
      { name: "Best Practices", path: "/best-practices", icon: Lightbulb },
      { name: "Certifications", path: "/certifications", icon: Award },
      { name: "Schedule", path: "/schedule", icon: CalendarDays },
      { name: "Recent Activity", path: "/recent-activity", icon: Activity },
      { name: "Notifications", path: "/notifications", icon: Bell },
    ],
  },
  {
    title: "EXPLORE",
    items: [
      { name: "Resources", path: "/materials", icon: FolderOpen },
      { name: "Events", path: "/events", icon: CalendarDays },
      { name: "Community", path: "/community", icon: Users },
      { name: "My Profile", path: "/profile", icon: UserRound },
    ],
  },
];

export default function Sidebar({
  open,
  onClose,
  newPaths = [],
}) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [signingOut, setSigningOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");

  const handleLogout = async () => {
    if (signingOut) return;

    setSigningOut(true);
    setLogoutError("");

    try {
      await logout();
      onClose?.();
      navigate("/sign", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
      setLogoutError("Could not sign out. Please try again.");
      setSigningOut(false);
    }
  };

  return (
    <>
      {open && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
        />
      )}

      <aside
        className={`
          fixed lg:sticky top-0 left-0 z-50
          h-screen w-[260px] shrink-0
          bg-white flex flex-col
          transition-transform duration-300
          ${open
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Brand */}
        <div className="h-[76px] px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#176D68] flex items-center justify-center text-white">
              <GraduationCap size={22} />
            </div>

            <div>
              <h1 className="font-bold text-[17px] text-[#20302D]">
                OutliersSource
              </h1>
              <p className="text-[10px] text-[#899791]">
                Departmental Portal
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="lg:hidden p-2 text-[#71827C]"
            aria-label="Close navigation"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-3 space-y-7">
          {navigation.map((group) => (
            <div key={group.title}>
              <p className="text-[10px] font-bold tracking-widest text-[#A0ADA8] px-3 mb-3">
                {group.title}
              </p>

              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const hasNew = newPaths.includes(item.path);

                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.path === "/home"}
                      onClick={onClose}
                      className={({ isActive }) => `
                        flex items-center gap-3
                        px-3 py-3 rounded-xl
                        text-[13px] font-medium
                        transition-colors duration-200
                        ${
                          isActive
                            ? "bg-[#E4F2EF] text-[#176D68]"
                            : "text-[#71827C] hover:bg-[#F3F7F5] hover:text-[#176D68]"
                        }
                      `}
                    >
                      <Icon size={18} strokeWidth={1.9} />

                      <span className="flex-1">
                        {item.name}
                      </span>

                      {hasNew && (
                        <span
                          className="w-2 h-2 rounded-full bg-red-500 shrink-0"
                          aria-label="New information"
                          title="New information"
                        />
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom navigation */}
        <div className="p-4 space-y-1">
          <NavLink
            to="/settings"
            onClick={onClose}
            className={({ isActive }) => `
              flex items-center gap-3 px-3 py-3 rounded-xl text-sm
              ${
                isActive
                  ? "bg-[#E4F2EF] text-[#176D68]"
                  : "text-[#71827C] hover:bg-[#F3F7F5]"
              }
            `}
          >
            <Settings size={18} />
            Settings
          </NavLink>

          <button
            onClick={handleLogout}
            disabled={signingOut}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-[#B45B46] hover:bg-[#FFF2ED] transition disabled:opacity-50"
          >
            <LogOut size={18} />
            {signingOut ? "Signing out..." : "Sign out"}
          </button>

          {logoutError && (
            <p className="px-3 text-xs text-red-500">
              {logoutError}
            </p>
          )}

          <div className="pt-4 px-3 text-[10px] text-[#A0ADA8]">
            OutliersSource © {new Date().getFullYear()}
          </div>
        </div>
      </aside>
    </>
  );
}
