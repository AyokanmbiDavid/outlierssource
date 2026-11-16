
import React, { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Users, BookOpen, FileText,
  Megaphone, CalendarDays, Menu, X, LogOut,
  Bell, ChevronRight, GraduationCap, Settings,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Students", path: "/admin/students", icon: Users },
  { name: "Materials", path: "/admin/materials", icon: FileText },
  { name: "Announcements", path: "/admin/announcements", icon: Megaphone },
  { name: "Courses", path: "/admin/courses", icon: BookOpen },
  { name: "Timetable", path: "/admin/timetable", icon: CalendarDays }
];

export default function AdminLayout() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
      isActive
        ? "bg-[#E4F2EF] text-[#176D68]"
        : "text-[#71827C] hover:bg-[#F5F8F6] hover:text-[#20302D]"
    }`;

  const SidebarContent = () => (
    <div className="h-full flex flex-col bg-white">
      <div className="h-[76px] px-6 flex items-center justify-between">
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
        <p className="text-[10px] font-bold tracking-widest text-[#A0ADA7] px-3 mb-3">ADMINISTRATION</p>
        <nav className="space-y-1">
          {navigation.map(item => {
            const Icon = item.icon;
            return (
              <NavLink key={item.path} to={item.path} onClick={() => setOpen(false)} className={linkClass}>
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
          onClick={() => navigate("/Admin/AdminLogin")}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-red-600 hover:bg-red-50"
        >
          <LogOut size={19} />
          Exit admin
        </button>
        <div className="bg-[#F5F8F6] rounded-xl p-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#D7EAE5] text-[#176D68] flex items-center justify-center font-bold">A</div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#20302D] truncate">Administrator</p>
            <p className="text-xs text-[#81918B]">Portal manager</p>
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
          <button onClick={() => setOpen(false)} className="absolute inset-0 bg-black/30" />
          <aside className="relative w-[280px] max-w-[85vw] h-full shadow-xl">
            <SidebarContent />
          </aside>
        </div>
      )}

      <div className="flex-1 min-w-0 flex flex-col h-screen">
        <header className="h-[76px] shrink-0 bg-white flex items-center justify-between px-4 sm:px-7">
          <div className="flex items-center gap-3">
            <button onClick={() => setOpen(true)} className="lg:hidden text-[#52645E]">
              <Menu size={23} />
            </button>
            <div>
              <p className="text-sm font-semibold text-[#20302D]">Administration</p>
              <p className="text-xs text-[#81918B]">Manage your department portal</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="w-10 h-10 rounded-full flex items-center justify-center text-[#71827C] hover:bg-[#F5F8F6]">
              <Bell size={20} />
            </button>
            <div className="w-9 h-9 rounded-full bg-[#E4F2EF] text-[#176D68] flex items-center justify-center font-bold text-sm">A</div>
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
