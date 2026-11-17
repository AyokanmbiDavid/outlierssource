
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState
} from "react";

import {
  BookOpen,
  GraduationCap,
  FolderOpen,
  CalendarDays,
  Clock3,
  ArrowRight,
  RefreshCw,
  UserRound,
  MapPin,
  FileText,
  AlertCircle,
  ChevronRight,
  BookMarked
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";
import { useNotifications } from "../context/NotificationContext";

const COLORS = [
  "#176D68",
  "#6583C5",
  "#C58C49",
  "#8A72B9",
  "#498A9C"
];

const getInitials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "ST";

const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-NG", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });

const getDayName = (value) => {
  if (!value) return "";

  const normalized = value.trim().toLowerCase();

  const days = {
    sun: 0,
    sunday: 0,
    mon: 1,
    monday: 1,
    tue: 2,
    tues: 2,
    tuesday: 2,
    wed: 3,
    wednesday: 3,
    thu: 4,
    thur: 4,
    thurs: 4,
    thursday: 4,
    fri: 5,
    friday: 5,
    sat: 6,
    saturday: 6
  };

  return days[normalized] ?? null;
};

const formatTime = (time) => {
  if (!time) return "";

  const [hours, minutes] = time.split(":");
  const date = new Date();

  date.setHours(Number(hours), Number(minutes), 0, 0);

  return date.toLocaleTimeString("en-NG", {
    hour: "numeric",
    minute: "2-digit"
  });
};

function StatCard({ title, value, icon: Icon, color, bg, subtitle }) {
  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 min-w-0">
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center"
        style={{ backgroundColor: bg, color }}
      >
        <Icon size={21} />
      </div>

      <h3 className="text-2xl font-bold text-[#20302D] mt-5">
        {value}
      </h3>

      <p className="text-xs text-[#899791] mt-1">
        {title}
      </p>

      {subtitle && (
        <p className="text-[10px] text-[#A0ADA8] mt-2">
          {subtitle}
        </p>
      )}
    </div>
  );
}

function ProfileCard({ profile }) {
  const name = profile?.full_name || "Student";

  return (
    <div className="bg-white rounded-2xl p-5">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full overflow-hidden shrink-0 bg-[#E4F2EF] flex items-center justify-center text-[#176D68]">
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={`${name}'s profile`}
              className="w-full h-full object-cover"
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <span className="text-xl font-bold">
              {getInitials(name)}
            </span>
          )}
        </div>

        <div className="min-w-0">
          <p className="text-[10px] font-bold tracking-wider text-[#899791] uppercase">
            Student profile
          </p>

          <h3 className="font-bold text-[#20302D] mt-1 truncate">
            {name}
          </h3>

          <p className="text-xs text-[#899791] mt-1 truncate">
            {profile?.matric_number || "Matric number unavailable"}
          </p>
        </div>
      </div>

      <div className="h-px bg-[#F0F3F1] my-5" />

      <div className="space-y-3">
        {[
          ["Department", profile?.department],
          ["Faculty", profile?.faculty],
          ["Level", profile?.level],
          ["Academic session", profile?.session],
          ["Email", profile?.email]
        ].map(([label, value]) => (
          <div
            key={label}
            className="flex items-start justify-between gap-3"
          >
            <span className="text-xs text-[#899791]">
              {label}
            </span>

            <span className="text-xs font-semibold text-[#354540] text-right break-all">
              {value || "Not provided"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CourseRow({ course, materialCount, index, onClick }) {
  const color = COLORS[index % COLORS.length];

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-3 sm:gap-4 py-4 border-b border-[#F0F3F1] last:border-0 text-left hover:bg-[#F8FAF9] rounded-xl px-2 transition"
    >
      <div
        className="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center text-white"
        style={{ backgroundColor: color }}
      >
        <BookOpen size={18} />
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="text-xs sm:text-sm font-semibold text-[#354540] truncate">
          {course.course_name}
        </h4>

        <p className="text-[10px] text-[#9AA7A2] mt-1">
          {course.course_code} · {course.department || "Department unavailable"}
        </p>
      </div>

      <div className="text-right shrink-0">
        <p className="text-xs font-semibold text-[#176D68]">
          {materialCount}
        </p>
        <p className="text-[10px] text-[#9AA7A2]">
          Materials
        </p>
      </div>

      <ChevronRight size={17} className="text-[#A0ADA8] shrink-0" />
    </button>
  );
}

function ClassItem({ item }) {
  return (
    <div className="flex gap-3 py-3 border-b border-[#F0F3F1] last:border-0">
      <div className="w-10 h-10 rounded-xl bg-[#E4F2EF] text-[#176D68] flex items-center justify-center shrink-0">
        <CalendarDays size={17} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-[#354540] truncate">
          {item.course?.course_name || "Course"}
        </p>

        <p className="text-[10px] text-[#899791] mt-1">
          {item.day_of_week} · {formatTime(item.start_time)}
          {item.end_time ? ` - ${formatTime(item.end_time)}` : ""}
        </p>

        {item.venue && (
          <p className="text-[10px] text-[#899791] mt-1 flex items-center gap-1">
            <MapPin size={11} />
            {item.venue}
          </p>
        )}
      </div>
    </div>
  );
}

function MaterialItem({ material }) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-[#F0F3F1] last:border-0">
      <div className="w-10 h-10 rounded-xl bg-[#EEF1FA] text-[#6583C5] flex items-center justify-center shrink-0">
        <FileText size={18} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-[#354540] truncate">
          {material.title}
        </p>

        <p className="text-[10px] text-[#899791] mt-1">
          {material.course?.course_code || "General material"}
          {material.category ? ` · ${material.category}` : ""}
        </p>
      </div>

      <span className="text-[10px] text-[#A0ADA8] shrink-0">
        {material.created_at
          ? new Date(material.created_at).toLocaleDateString("en-NG", {
              day: "numeric",
              month: "short"
            })
          : ""}
      </span>
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const { notify } = useNotifications();

  const [profile, setProfile] = useState(null);
  const [courses, setCourses] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [timetable, setTimetable] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchDashboard = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);

    setError("");

    try {
      const {
        data: { user },
        error: authError
      } = await supabase.auth.getUser();

      if (authError) throw authError;

      if (!user) {
        throw new Error("Your session has expired. Please log in again.");
      }

      const [
        profileResult,
        coursesResult,
        materialsResult,
        timetableResult
      ] = await Promise.all([
        supabase
          .from("profiles")
          .select(`
            id,
            full_name,
            matric_number,
            email,
            department,
            level,
            faculty,
            session,
            avatar_url
          `)
          .eq("id", user.id)
          .maybeSingle(),

        supabase
          .from("courses")
          .select(`
            id,
            course_name,
            course_code,
            department,
            course_type,
            credit_units,
            created_at,
            updated_at
          `)
          .order("course_code"),

        supabase
          .from("materials")
          .select(`
            id,
            title,
            description,
            course_id,
            category,
            created_at,
            updated_at,
            is_published
          `)
          .eq("is_published", true)
          .order("created_at", { ascending: false }),

        supabase
          .from("class_timetable")
          .select(`
            id,
            course_id,
            day_of_week,
            start_time,
            end_time,
            venue
          `)
      ]);

      if (profileResult.error) throw profileResult.error;
      if (coursesResult.error) throw coursesResult.error;
      if (materialsResult.error) throw materialsResult.error;
      if (timetableResult.error) throw timetableResult.error;

      const courseRows = coursesResult.data || [];
      const materialRows = materialsResult.data || [];

      const courseMap = new Map(
        courseRows.map((course) => [course.id, course])
      );

      const enrichedMaterials = materialRows.map((material) => ({
        ...material,
        course: courseMap.get(material.course_id) || null
      }));

      const enrichedTimetable = (timetableResult.data || []).map((item) => ({
        ...item,
        course: courseMap.get(item.course_id) || null
      }));

      setProfile(profileResult.data);
      setCourses(courseRows);
      setMaterials(enrichedMaterials);
      setTimetable(enrichedTimetable);
    } catch (err) {
      console.error("Dashboard error:", err);
      setError(err.message || "Unable to load dashboard information.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();

    const channel = supabase
      .channel("student-dashboard-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profiles" },
        () => fetchDashboard(true)
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "courses" },
        () => fetchDashboard(true)
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "materials" },
        () => fetchDashboard(true)
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "class_timetable" },
        () => fetchDashboard(true)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchDashboard]);

  const upcomingClasses = useMemo(() => {
    const today = new Date();
    const todayDay = today.getDay();

    return timetable
      .map((item) => {
        const targetDay = getDayName(item.day_of_week);

        if (targetDay === null) return null;

        const daysUntil = (targetDay - todayDay + 7) % 7;

        return {
          ...item,
          daysUntil
        };
      })
      .filter(Boolean)
      .sort((a, b) => {
        if (a.daysUntil !== b.daysUntil) {
          return a.daysUntil - b.daysUntil;
        }

        return (a.start_time || "").localeCompare(b.start_time || "");
      })
      .slice(0, 5);
  }, [timetable]);

  const materialCounts = useMemo(() => {
    const counts = {};

    materials.forEach((material) => {
      if (material.course_id) {
        counts[material.course_id] =
          (counts[material.course_id] || 0) + 1;
      }
    });

    return counts;
  }, [materials]);

  const today = new Date();

  const stats = [
    {
      title: "Total Courses",
      value: courses.length,
      icon: BookOpen,
      color: "#176D68",
      bg: "#E4F2EF",
      subtitle: "Available courses"
    },
    {
      title: "Learning Materials",
      value: materials.length,
      icon: FolderOpen,
      color: "#6583C5",
      bg: "#EEF1FA",
      subtitle: "Published resources"
    },
    {
      title: "Timetable Entries",
      value: timetable.length,
      icon: CalendarDays,
      color: "#C58C49",
      bg: "#FAF1E4",
      subtitle: "Scheduled classes"
    }
  ];

  return (
    <div className="space-y-6 pb-6">

      {/* Welcome */}
      <section className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs text-[#899791]">
            {formatDate(today)}
          </p>

          <h1 className="text-2xl sm:text-3xl font-bold text-[#20302D] mt-2">
            Welcome back, {profile?.full_name?.split(" ")[0] || "Student"}
          </h1>

          <p className="text-sm text-[#899791] mt-2">
            Here's your academic overview.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => fetchDashboard(true)}
            disabled={refreshing}
            className="w-11 h-11 rounded-full bg-white text-[#176D68] grid place-items-center hover:bg-[#E4F2EF]"
            aria-label="Refresh dashboard"
          >
            <RefreshCw
              size={17}
              className={refreshing ? "animate-spin" : ""}
            />
          </button>

          <button
            type="button"
            onClick={() => navigate("/profile")}
            className="flex items-center gap-2 bg-[#176D68] text-white px-4 py-3 rounded-full text-xs font-semibold hover:bg-[#105A55]"
          >
            <UserRound size={15} />
            My profile
          </button>
        </div>
      </section>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-100 text-red-700 rounded-2xl p-4 flex gap-3">
          <AlertCircle size={19} className="shrink-0" />

          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">
              Dashboard loading issue
            </p>
            <p className="text-xs mt-1 break-words">{error}</p>

            <button
              onClick={() => fetchDashboard(true)}
              className="text-xs font-bold underline mt-2"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Statistics */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {stats.map((item) => (
          <StatCard
            key={item.title}
            {...item}
            value={loading ? "—" : item.value}
          />
        ))}
      </section>

      {/* Dashboard layout */}
      <section className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-5">

        <div className="space-y-5 min-w-0">

          {/* Courses */}
          <div className="bg-white rounded-2xl p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="font-bold text-[#354540]">
                  Available Courses
                </h3>

                <p className="text-xs text-[#9AA7A2] mt-1">
                  Your academic course catalogue
                </p>
              </div>

              <button
                onClick={() => navigate("/courses")}
                className="flex items-center gap-1 text-xs text-[#176D68] font-semibold shrink-0"
              >
                View all <ArrowRight size={14} />
              </button>
            </div>

            {loading ? (
              <div className="space-y-4 animate-pulse">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="h-12 bg-[#F5F8F6] rounded-xl" />
                ))}
              </div>
            ) : courses.length ? (
              courses.slice(0, 6).map((course, index) => (
                <CourseRow
                  key={course.id}
                  course={course}
                  index={index}
                  materialCount={materialCounts[course.id] || 0}
                  onClick={() => navigate(`/courses/${course.id}`)}
                />
              ))
            ) : (
              <p className="text-sm text-[#899791] py-8 text-center">
                No courses are available yet.
              </p>
            )}
          </div>

          {/* Recent materials */}
          <div className="bg-white rounded-2xl p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="font-bold text-[#354540]">
                  Recently Added Materials
                </h3>

                <p className="text-xs text-[#9AA7A2] mt-1">
                  Latest published learning resources
                </p>
              </div>

              <button
                onClick={() => navigate("/materials")}
                className="flex items-center gap-1 text-xs text-[#176D68] font-semibold shrink-0"
              >
                View all <ArrowRight size={14} />
              </button>
            </div>

            {loading ? (
              <div className="h-32 bg-[#F5F8F6] rounded-xl animate-pulse" />
            ) : materials.length ? (
              materials.slice(0, 5).map((material) => (
                <MaterialItem
                  key={material.id}
                  material={material}
                />
              ))
            ) : (
              <div className="text-center py-8">
                <BookMarked size={25} className="mx-auto text-[#A0ADA8]" />
                <p className="text-sm text-[#899791] mt-3">
                  No published materials yet.
                </p>
              </div>
            )}
          </div>

          {/* Timetable */}
          <div className="bg-white rounded-2xl p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="font-bold text-[#354540]">
                  Class Schedule
                </h3>

                <p className="text-xs text-[#9AA7A2] mt-1">
                  Your upcoming timetable entries
                </p>
              </div>

              <button
                onClick={() => navigate("/schedule")}
                className="flex items-center gap-1 text-xs text-[#176D68] font-semibold shrink-0"
              >
                Full schedule <ArrowRight size={14} />
              </button>
            </div>

            {loading ? (
              <div className="h-28 bg-[#F5F8F6] rounded-xl animate-pulse" />
            ) : upcomingClasses.length ? (
              upcomingClasses.map((item) => (
                <ClassItem key={item.id} item={item} />
              ))
            ) : (
              <div className="text-center py-8">
                <CalendarDays size={25} className="mx-auto text-[#A0ADA8]" />
                <p className="text-sm text-[#899791] mt-3">
                  No timetable entries available.
                </p>
              </div>
            )}
          </div>

        </div>

        {/* Profile sidebar */}
        <aside className="space-y-5">
          <ProfileCard profile={profile} />

          <div className="bg-[#E4F2EF] rounded-2xl p-5">
            <div className="w-10 h-10 rounded-xl bg-white text-[#176D68] flex items-center justify-center">
              <GraduationCap size={21} />
            </div>

            <h3 className="font-bold text-[#245C55] mt-4">
              Keep learning!
            </h3>

            <p className="text-xs text-[#648079] leading-5 mt-2">
              Explore your courses and make use of the latest materials uploaded to your academic library.
            </p>

            <button
              onClick={() => navigate("/courses")}
              className="mt-5 text-xs font-bold text-[#176D68] flex items-center gap-2"
            >
              Explore courses <ArrowRight size={15} />
            </button>
          </div>

          <div className="bg-white rounded-2xl p-5">
            <h3 className="font-bold text-[#354540]">
              Academic overview
            </h3>

            <div className="space-y-4 mt-5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#899791]">
                  Credit units
                </span>

                <span className="text-sm font-bold text-[#20302D]">
                  {loading
                    ? "—"
                    : courses.reduce(
                        (total, course) =>
                          total + Number(course.credit_units || 0),
                        0
                      )}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-[#899791]">
                  Course count
                </span>

                <span className="text-sm font-bold text-[#20302D]">
                  {loading ? "—" : courses.length}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-[#899791]">
                  Published resources
                </span>

                <span className="text-sm font-bold text-[#20302D]">
                  {loading ? "—" : materials.length}
                </span>
              </div>
            </div>
          </div>

        </aside>
      </section>
    </div>
  );
}
