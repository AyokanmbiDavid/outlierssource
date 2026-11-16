
import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Users, BookOpen, FileText, Megaphone,
  ArrowUpRight, TrendingUp, CalendarDays,
  Clock, Plus, UserPlus, Upload, Bell
} from "lucide-react";

const stats = [
  { title: "Total Students", value: "1,284", change: "+12.5%", icon: Users },
  { title: "Active Courses", value: "24", change: "+3 this month", icon: BookOpen },
  { title: "Learning Materials", value: "156", change: "+18 this month", icon: FileText },
  { title: "Announcements", value: "32", change: "5 recent", icon: Megaphone }
];

const activities = [
  { title: "New student registration", description: "A student account was registered.", time: "10 minutes ago", type: "student" },
  { title: "New course material added", description: "COS 101 lecture notes were uploaded.", time: "45 minutes ago", type: "material" },
  { title: "Announcement published", description: "First Semester Examination update.", time: "2 hours ago", type: "announcement" },
  { title: "Class schedule updated", description: "MTH 101 timetable was updated.", time: "Yesterday", type: "schedule" }
];

const upcoming = [
  { title: "Departmental Academic Seminar", date: "November 20, 2026", time: "10:00 AM" },
  { title: "Freshers Orientation", date: "November 24, 2026", time: "9:00 AM" },
  { title: "Programming Workshop", date: "November 28, 2026", time: "12:00 PM" }
];

export default function AdminDashboard() {
  const navigate = useNavigate();

  const quickActions = [
    { title: "Add Student", description: "Register a new student", icon: UserPlus, path: "/admin/students" },
    { title: "Manage Classes", description: "Create or update courses", icon: BookOpen, path: "/admin/classes" },
    { title: "Upload Material", description: "Add learning resources", icon: Upload, path: "/admin/materials" },
    { title: "Create Announcement", description: "Share important updates", icon: Bell, path: "/admin/announcements" }
  ];

  return (
    <div className="space-y-7">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-sm text-[#81918B]">Overview</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#20302D] mt-1">Admin Dashboard</h1>
          <p className="text-sm text-[#81918B] mt-2">Welcome back. Here's what's happening in your department.</p>
        </div>
        <button onClick={() => navigate("/admin/announcements")} className="bg-[#176D68] text-white rounded-xl px-5 py-3 text-sm font-semibold flex items-center justify-center gap-2">
          <Plus size={18} /> New announcement
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map(item => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="bg-white rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-xl bg-[#E4F2EF] text-[#176D68] flex items-center justify-center">
                  <Icon size={21} />
                </div>
                <ArrowUpRight size={18} className="text-[#81918B]" />
              </div>
              <p className="text-sm text-[#81918B] mt-5">{item.title}</p>
              <h2 className="text-2xl font-bold text-[#20302D] mt-1">{item.value}</h2>
              <p className="text-xs text-[#176D68] mt-2">{item.change}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <section className="xl:col-span-2 bg-white rounded-2xl p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-bold text-[#20302D]">Student registrations</h2>
              <p className="text-xs text-[#81918B] mt-1">Sample monthly registration figures</p>
            </div>
            <span className="text-xs bg-[#E4F2EF] text-[#176D68] px-3 py-2 rounded-full">2026</span>
          </div>

          <div className="h-56 mt-7 flex items-end gap-3 sm:gap-5">
            {[35, 48, 42, 65, 54, 76, 61, 88, 72, 95, 81, 100].map((height, index) => (
              <div key={index} className="flex-1 h-full flex flex-col justify-end items-center gap-2">
                <div className="w-full max-w-10 rounded-t-lg bg-[#D5EAE5] relative overflow-hidden" style={{ height: `${height}%` }}>
                  <div className="absolute bottom-0 left-0 right-0 bg-[#176D68] rounded-t-lg" style={{ height: `${height * 0.65}%` }} />
                </div>
                <span className="text-[10px] text-[#81918B]">{["J","F","M","A","M","J","J","A","S","O","N","D"][index]}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 mt-5 text-xs text-[#81918B]">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#176D68]" /> Registration activity
          </div>
        </section>

        <section className="bg-white rounded-2xl p-5 sm:p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="font-bold text-[#20302D]">Quick actions</h2>
              <p className="text-xs text-[#81918B] mt-1">Common administrative tasks</p>
            </div>
            <TrendingUp size={19} className="text-[#176D68]" />
          </div>

          <div className="space-y-2 mt-5">
            {quickActions.map(action => {
              const Icon = action.icon;
              return (
                <button key={action.title} onClick={() => navigate(action.path)} className="w-full flex items-center gap-3 p-3 rounded-xl text-left hover:bg-[#F5F8F6] transition">
                  <div className="w-10 h-10 rounded-xl bg-[#E4F2EF] text-[#176D68] flex items-center justify-center shrink-0">
                    <Icon size={19} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#20302D]">{action.title}</p>
                    <p className="text-xs text-[#81918B] mt-1">{action.description}</p>
                  </div>
                  <ArrowUpRight size={16} className="text-[#81918B]" />
                </button>
              );
            })}
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <section className="bg-white rounded-2xl p-5 sm:p-6">
          <div className="flex justify-between items-center mb-5">
            <div>
              <h2 className="font-bold text-[#20302D]">Recent activity</h2>
              <p className="text-xs text-[#81918B] mt-1">Latest portal activities</p>
            </div>
            <Clock size={19} className="text-[#176D68]" />
          </div>

          <div className="space-y-5">
            {activities.map((activity, index) => (
              <div key={index} className="flex gap-3">
                <div className="w-9 h-9 rounded-full bg-[#E4F2EF] text-[#176D68] flex items-center justify-center shrink-0">
                  {activity.type === "student" ? <Users size={17} /> : activity.type === "material" ? <FileText size={17} /> : activity.type === "announcement" ? <Megaphone size={17} /> : <CalendarDays size={17} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#20302D]">{activity.title}</p>
                  <p className="text-xs text-[#81918B] mt-1">{activity.description}</p>
                  <p className="text-[11px] text-[#A0ADA7] mt-2">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-2xl p-5 sm:p-6">
          <div className="flex justify-between items-center mb-5">
            <div>
              <h2 className="font-bold text-[#20302D]">Upcoming events</h2>
              <p className="text-xs text-[#81918B] mt-1">Department calendar</p>
            </div>
            <CalendarDays size={19} className="text-[#176D68]" />
          </div>

          <div className="space-y-3">
            {upcoming.map(event => (
              <div key={event.title} className="p-4 rounded-xl bg-[#F5F8F6]">
                <h3 className="text-sm font-semibold text-[#20302D]">{event.title}</h3>
                <div className="flex flex-wrap gap-4 mt-2 text-xs text-[#81918B]">
                  <span className="flex items-center gap-1"><CalendarDays size={14} /> {event.date}</span>
                  <span className="flex items-center gap-1"><Clock size={14} /> {event.time}</span>
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => navigate("/admin/schedule")} className="text-sm font-semibold text-[#176D68] mt-5">Manage schedule →</button>
        </section>
      </div>

      <p className="text-xs text-[#81918B]">Dashboard figures and activities are sample data. Live student and department records will be connected through Supabase.</p>
    </div>
  );
}
