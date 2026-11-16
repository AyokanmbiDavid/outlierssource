
import React from "react";
import {
  Menu,
  Search,
  Bell,
  ChevronDown,
  GraduationCap
} from "lucide-react";

export default function Navbar({ onMenuClick }) {
  return (
    <header className="sticky top-0 z-30
  h-[76px] shrink-0
  bg-white/95 backdrop-blur-sm
  flex items-center justify-between
  px-4 sm:px-7 lg:px-9 h-[76px] bg-white flex items-center justify-between px-4 sm:px-7 lg:px-9 shrink-0">

      {/* Left section */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl hover:bg-[#F1F5F3] text-[#52635F]"
          aria-label="Open navigation"
        >
          <Menu size={22} />
        </button>

        <div>
          <h2 className="font-bold text-lg text-[#20302D]">
            Dashboard
          </h2>
          <p className="hidden sm:block text-xs text-[#899791]">
            Welcome to your academic workspace
          </p>
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-2 sm:gap-4">

        {/* Search */}
        <div className="hidden sm:flex items-center gap-2 bg-[#F1F5F3] rounded-full px-4 py-2.5 w-48 lg:w-64">
          <Search size={17} className="text-[#899791]" />

          <input
            type="search"
            placeholder="Search anything..."
            className="w-full bg-transparent outline-none text-xs text-[#354540] placeholder:text-[#A0ADA8]"
          />
        </div>

        {/* Notifications */}
        <button
          className="relative w-10 h-10 rounded-full flex items-center justify-center text-[#71827C] hover:bg-[#F1F5F3]"
          aria-label="Notifications"
        >
          <Bell size={20} />

          <span className="absolute top-2 right-2 w-2 h-2 bg-[#176D68] rounded-full ring-2 ring-white" />
        </button>

        {/* Profile */}
        <button className="flex items-center gap-2 sm:gap-3 hover:bg-[#F5F8F6] rounded-full p-1.5 transition">
          <div className="w-9 h-9 rounded-full bg-[#E4F2EF] text-[#176D68] flex items-center justify-center">
            <GraduationCap size={19} />
          </div>

          <div className="hidden sm:block text-left">
            <p className="text-xs font-bold text-[#354540]">
              Student
            </p>
            <p className="text-[10px] text-[#899791]">
              Student account
            </p>
          </div>

          <ChevronDown
            size={15}
            className="hidden sm:block text-[#899791]"
          />
        </button>

      </div>
    </header>
  );
}
