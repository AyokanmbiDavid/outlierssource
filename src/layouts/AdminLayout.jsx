
import React, { useEffect, useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Users, BookOpen, FileText, Megaphone,
  CalendarDays, Menu, X, LogOut, Bell, ChevronRight,
  GraduationCap, Settings, RefreshCw
} from "lucide-react";
import { supabase } from "../services/supabase";

const navigation = [
  { name: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Students", path: "/admin/students", icon: Users },
  { name: "Materials", path: "/admin/materials", icon: FileText },
  { name: "Announcements", path: "/admin/announcements", icon: Megaphone },
  { name: "Courses", path: "/admin/classes", icon: BookOpen },
  { name: "Timetable", path: "/admin/timetable", icon: CalendarDays }
];

export default function AdminLayout() {
  const [open, setOpen] = useState(false);
  const [adminName, setAdminName] = useState("Administrator");
  const [adminEmail, setAdminEmail] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;

    const loadAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !active) return;

      setAdminEmail(user.email || "");

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .maybeSingle();

      if (active) {
        setAdminName(
          profile?.full_name ||
          user.user_metadata?.full_name ||
          user.email?.split("@")[0] ||
          "Administrator"
        );
      }

      if (error) console.error("Admin profile error:", error);
    };

    loadAdmin();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!session?.user) {
          setAdminName("Administrator");
          setAdminEmail("");
        } else {
          setAdminEmail(session.user.email || "");
        }
      }
    );

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const initials = adminName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(word => word[0])
    .join("")
    .toUpperCase() || "A";

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
      isActive
        ? "bg-[#E4F2EF] text-[#176D68]"
        : "text-[#71827C] hover:bg-[#F5F8F6] hover:text-[#20302D]"
    }`;

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);

    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate("/Admin/AdminLogin", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
      alert(error.message || "Unable to sign out. Please try again.");
    } finally {
      setLoggingOut(false);
    }
  };

  const SidebarContent = () => (
    <div className="h-full flex flex-col bg-white">
      <div className="h-[76px] px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#176D68] text-white flex items-center justify-center">
            <GraduationCap size={23} />
          </div>
          <div>
            <h2 className="font-bold text-[#20302D]">OutliersSource</h2>
            <p className="text-[10px] text-[#81918B]">ADMIN PORTAL</p>
          </div>
        </div>
        <button onClick={() => setOpen(false)} className="lg:hidden text-[#71827C]">
          <X size={21} />
        </button>
      </div>

      <div className="px-4 mt-5">
        <p className="text-[10px] font-bold tracking-widest text-[#A0ADA7] px-3 mb-3">
          ADMINISTRATION
        </p>
        <nav className="space-y-1">
          {navigation.map(item => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setOpen(false)}
                className={linkClass}
              >
                <Icon size={19} />
                <span>{item.name}</span>
                <ChevronRight size={15} className="ml-auto opacity-50" />
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-4 space-y-2">
        <NavLink to="/admin/settings" onClick={() => setOpen(false)} className={linkClass}>
          <Settings size={19} />
          Settings
        </NavLink>

        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
        >
          {loggingOut ? <RefreshCw size={19} className="animate-spin" /> : <LogOut size={19} />}
          {loggingOut ? "Signing out..." : "Exit admin"}
        </button>

        <div className="bg-[#F5F8F6] rounded-xl p-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#D7EAE5] text-[#176D68] flex items-center justify-center font-bold shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#20302D] truncate">{adminName}</p>
            <p className="text-xs text-[#81918B] truncate">{adminEmail || "Portal administrator"}</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen flex bg-[#F5F8F6] overflow-hidden">
      <aside className="hidden lg:block w-[260px] shrink-0 h-screen">
        <SidebarContent />
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/30"
            aria-label="Close navigation"
          />
          <aside className="relative w-[280px] max-w-[85vw] h-full shadow-xl">
            <SidebarContent />
          </aside>
        </div>
      )}

      <div className="flex-1 min-w-0 flex flex-col h-screen">
        <header className="h-[76px] shrink-0 bg-white flex items-center justify-between px-4 sm:px-7">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setOpen(true)}
              className="lg:hidden text-[#52645E]"
              aria-label="Open navigation"
            >
              <Menu size={23} />
            </button>
            <div>
              <p className="text-sm font-semibold text-[#20302D]">Administration</p>
              <p className="text-xs text-[#81918B]">Manage your department portal</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#E4F2EF] text-[#176D68] flex items-center justify-center font-bold text-sm">
              {initials}
            </div>
            <div className="hidden sm:block max-w-[160px]">
              <p className="text-sm font-semibold text-[#20302D] truncate">{adminName}</p>
              <p className="text-xs text-[#81918B]">Administrator</p>
            </div>
          </div>
        </header>

        <main className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-[1600px] mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
