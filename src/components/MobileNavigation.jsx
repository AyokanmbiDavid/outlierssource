
import React from "react";
import { NavLink } from "react-router-dom";

import {
  LayoutDashboard,
  BookOpen,
  FolderOpen,
  CalendarDays,
  UserRound
} from "lucide-react";

const items = [
  { name: "Home", path: "/home", icon: LayoutDashboard },
  { name: "Courses", path: "/courses", icon: BookOpen },
  { name: "Resources", path: "/materials", icon: FolderOpen },
  { name: "Events", path: "/events", icon: CalendarDays },
  { name: "Profile", path: "/profile", icon: UserRound }
];

export default function MobileNavigation() {
  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur-sm px-2 pt-2 pb-[max(8px,env(safe-area-inset-bottom))] shadow-[0_-5px_20px_rgba(20,60,50,0.06)]">

      <div className="flex items-center justify-around">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex flex-col items-center gap-1
                min-w-[55px] py-1.5 rounded-xl
                text-[10px] font-medium transition
                ${
                  isActive
                    ? "text-[#176D68]"
                    : "text-[#899791]"
                }
              `}
            >
              {({ isActive }) => (
                <>
                  <div className={`
                    px-4 py-1 rounded-full
                    ${isActive ? "bg-[#E4F2EF]" : ""}
                  `}>
                    <Icon size={19} />
                  </div>

                  {item.name}
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
