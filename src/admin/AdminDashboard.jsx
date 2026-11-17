
import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users, BookOpen, FileText, Megaphone, ArrowUpRight,
  TrendingUp, CalendarDays, Clock, Plus, UserPlus, Upload,
  Bell, RefreshCw, GraduationCap, Activity, CheckCircle2
} from "lucide-react";
import { supabase } from "../services/supabase";

const timeAgo = (date) => {
  if (!date) return "Recently";
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
  return new Date(date).toLocaleDateString();
};

const formatNumber = (number) => Number(number || 0).toLocaleString();

const statConfig = [
  { key: "students", title: "Total Students", icon: Users, path: "/admin/students", description: "Registered student accounts" },
  { key: "courses", title: "Total Courses", icon: BookOpen, path: "/admin/classes", description: "Available academic courses" },
  { key: "materials", title: "Learning Materials", icon: FileText, path: "/admin/materials", description: "Uploaded learning resources" },
  { key: "announcements", title: "Announcements", icon: Megaphone, path: "/admin/announcements", description: "Portal announcements" },
  { key: "timetable", title: "Timetable Entries", icon: CalendarDays, path: "/admin/timetable", description: "Scheduled class entries" }
];

const quickActions = [
  { title: "Add Student", description: "Register a new student", icon: UserPlus, path: "/admin/students" },
  { title: "Manage Courses", description: "Create or update courses", icon: BookOpen, path: "/admin/classes" },
  { title: "Upload Material", description: "Add learning resources", icon: Upload, path: "/admin/materials" },
  { title: "Create Announcement", description: "Share important updates", icon: Bell, path: "/admin/announcements" },
  { title: "Manage Timetable", description: "Update class schedules", icon: CalendarDays, path: "/admin/timetable" }
];

const activityIcons = {
  student: Users,
  material: FileText,
  announcement: Megaphone,
  timetable: CalendarDays
};

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [adminName, setAdminName] = useState("Administrator");
  const [stats, setStats] = useState({
    students: null,
    courses: null,
    materials: null,
    announcements: null,
    timetable: null
  });
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState("");

  const fetchDashboard = useCallback(async (manual = false) => {
    if (manual) setRefreshing(true);
    else setLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;

      const user = authData?.user;

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .maybeSingle();

        setAdminName(
          profile?.full_name ||
          user.user_metadata?.full_name ||
          user.email?.split("@")[0] ||
          "Administrator"
        );
      }

      const [
        studentsResult,
        coursesResult,
        materialsResult,
        announcementsResult,
        timetableResult,
        recentStudentsResult,
        recentMaterialsResult,
        recentAnnouncementsResult,
        recentTimetableResult
      ] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "student"),
        supabase.from("courses").select("id", { count: "exact", head: true }),
        supabase.from("materials").select("id", { count: "exact", head: true }),
        supabase.from("announcements").select("id", { count: "exact", head: true }),
        supabase.from("class_timetable").select("id", { count: "exact", head: true }),

        supabase.from("profiles").select("full_name, matric_number, created_at").eq("role", "student").order("created_at", { ascending: false }).limit(5),
        supabase.from("materials").select("title, created_at").order("created_at", { ascending: false }).limit(5),
        supabase.from("announcements").select("title, created_at, is_published").order("created_at", { ascending: false }).limit(5),
        supabase.from("class_timetable").select("day_of_week, created_at, updated_at").order("updated_at", { ascending: false }).limit(5)
      ]);

      const results = [
        studentsResult, coursesResult, materialsResult,
        announcementsResult, timetableResult,
        recentStudentsResult, recentMaterialsResult,
        recentAnnouncementsResult, recentTimetableResult
      ];

      const failed = results.filter(result => result.error);
      if (failed.length) {
        console.error("Dashboard query errors:", failed.map(item => item.error));
        setError("Some dashboard information could not be loaded. Check your Supabase table permissions.");
      } else {
        setError("");
      }

      setStats({
        students: studentsResult.error ? null : studentsResult.count,
        courses: coursesResult.error ? null : coursesResult.count,
        materials: materialsResult.error ? null : materialsResult.count,
        announcements: announcementsResult.error ? null : announcementsResult.count,
        timetable: timetableResult.error ? null : timetableResult.count
      });

      const recent = [
        ...(recentStudentsResult.data || []).map(item => ({
          title: "New student registered",
          description: `${item.full_name || "A student"}${item.matric_number ? ` • ${item.matric_number}` : ""}`,
          date: item.created_at,
          type: "student",
          path: "/admin/students"
        })),
        ...(recentMaterialsResult.data || []).map(item => ({
          title: "Learning material added",
          description: item.title,
          date: item.created_at,
          type: "material",
          path: "/admin/materials"
        })),
        ...(recentAnnouncementsResult.data || []).map(item => ({
          title: item.is_published ? "Announcement published" : "Announcement created",
          description: item.title,
          date: item.created_at,
          type: "announcement",
          path: "/admin/announcements"
        })),
        ...(recentTimetableResult.data || []).map(item => ({
          title: "Timetable updated",
          description: `${item.day_of_week || "Class"} schedule`,
          date: item.updated_at || item.created_at,
          type: "timetable",
          path: "/admin/timetable"
        }))
      ];

      setActivities(
        recent
          .filter(item => item.date)
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 8)
      );

      setLastUpdated(new Date());
    } catch (err) {
      console.error("Dashboard error:", err);
      setError(err.message || "Unable to load dashboard data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();

    const channel = supabase
      .channel("admin-dashboard-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, fetchDashboard)
      .on("postgres_changes", { event: "*", schema: "public", table: "courses" }, fetchDashboard)
      .on("postgres_changes", { event: "*", schema: "public", table: "materials" }, fetchDashboard)
      .on("postgres_changes", { event: "*", schema: "public", table: "announcements" }, fetchDashboard)
      .on("postgres_changes", { event: "*", schema: "public", table: "class_timetable" }, fetchDashboard)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchDashboard]);

  const firstName = adminName.trim().split(/\s+/)[0] || "Administrator";

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-sm text-[#81918B]">Administration overview</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#20302D] mt-1">
            Welcome, {firstName}
          </h1>
          <p className="text-sm text-[#81918B] mt-2">
            Here's what's happening across your student portal.
          </p>
          {lastUpdated && (
            <p className="text-xs text-[#A0ADA7] mt-2">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => fetchDashboard(true)}
            disabled={refreshing}
            className="border border-[#E4ECE8] text-[#176D68] rounded-xl px-4 py-3 text-sm font-semibold flex items-center justify-center gap-2 hover:bg-[#F5F8F6] disabled:opacity-50"
          >
            <RefreshCw size={17} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>
          <button
            onClick={() => navigate("/admin/announcements")}
            className="bg-[#176D68] text-white rounded-xl px-5 py-3 text-sm font-semibold flex items-center justify-center gap-2 hover:bg-[#105A55]"
          >
            <Plus size={18} /> New announcement
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-700 rounded-xl p-4 text-sm">
          {error}
        </div>
      )}

      {/* Statistics */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-bold text-[#20302D]">Portal statistics</h2>
            <p className="text-xs text-[#81918B] mt-1">Live database records</p>
          </div>
          <Activity size={19} className="text-[#176D68]" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {statConfig.map(item => {
            const Icon = item.icon;
            const value = stats[item.key];

            return (
              <button
                key={item.key}
                onClick={() => navigate(item.path)}
                className="bg-white rounded-2xl p-5 text-left hover:shadow-md transition"
              >
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-xl bg-[#E4F2EF] text-[#176D68] flex items-center justify-center">
                    <Icon size={21} />
                  </div>
                  <ArrowUpRight size={18} className="text-[#81918B]" />
                </div>
                <p className="text-sm text-[#81918B] mt-5">{item.title}</p>
                <h2 className="text-2xl font-bold text-[#20302D] mt-1">
                  {loading ? "..." : value === null ? "—" : formatNumber(value)}
                </h2>
                <p className="text-xs text-[#A0ADA7] mt-2">{item.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick actions */}
      <section className="bg-white rounded-2xl p-5 sm:p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="font-bold text-[#20302D]">Management centre</h2>
            <p className="text-xs text-[#81918B] mt-1">Access your administrative sections</p>
          </div>
          <TrendingUp size={19} className="text-[#176D68]" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2 mt-5">
          {quickActions.map(action => {
            const Icon = action.icon;
            return (
              <button
                key={action.title}
                onClick={() => navigate(action.path)}
                className="flex items-center gap-3 p-3 rounded-xl text-left hover:bg-[#F5F8F6] transition"
              >
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

      {/* Recent activity */}
      <section className="bg-white rounded-2xl p-5 sm:p-6">
        <div className="flex justify-between items-center mb-5">
          <div>
            <h2 className="font-bold text-[#20302D]">Recent activity</h2>
            <p className="text-xs text-[#81918B] mt-1">Latest records across your portal</p>
          </div>
          <Clock size={19} className="text-[#176D68]" />
        </div>

        {loading ? (
          <div className="py-10 text-center text-sm text-[#81918B]">Loading recent activity...</div>
        ) : activities.length === 0 ? (
          <div className="py-10 text-center">
            <CheckCircle2 size={30} className="mx-auto text-[#A0ADA7]" />
            <p className="text-sm font-semibold text-[#20302D] mt-3">No recent activity yet</p>
            <p className="text-xs text-[#81918B] mt-1">New student, material and announcement records will appear here.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {activities.map((activity, index) => {
              const Icon = activityIcons[activity.type] || Activity;
              return (
                <button
                  key={`${activity.type}-${activity.date}-${index}`}
                  onClick={() => navigate(activity.path)}
                  className="w-full flex gap-3 text-left group"
                >
                  <div className="w-10 h-10 rounded-full bg-[#E4F2EF] text-[#176D68] flex items-center justify-center shrink-0">
                    <Icon size={17} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#20302D] group-hover:text-[#176D68]">
                      {activity.title}
                    </p>
                    <p className="text-xs text-[#81918B] mt-1 truncate">{activity.description}</p>
                    <p className="text-[11px] text-[#A0ADA7] mt-2">{timeAgo(activity.date)}</p>
                  </div>
                  <ArrowUpRight size={15} className="text-[#A0ADA7] shrink-0 mt-1" />
                </button>
              );
            })}
          </div>
        )}
      </section>

      <div className="flex items-center gap-2 text-xs text-[#81918B]">
        <Activity size={15} className="text-[#176D68]" />
        Dashboard data is fetched directly from Supabase.
      </div>
    </div>
  );
}
