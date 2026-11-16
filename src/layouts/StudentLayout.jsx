
import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar.jsx";
import Navbar from "../components/Navbar.jsx";
import MobileNavigation from "../components/MobileNavigation.jsx";

export default function StudentLayout() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="h-screen bg-[#F5F8F6] flex overflow-hidden">
      <Sidebar
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
      />

      <div className="flex-1 min-w-0 flex flex-col h-screen">
        <Navbar onMenuClick={() => setMenuOpen(true)} />

        <main className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8">
          <div className="max-w-[1600px] mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>

      <MobileNavigation />
    </div>
  );
}
