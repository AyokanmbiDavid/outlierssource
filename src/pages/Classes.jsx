
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  BookOpen,
  ArrowUpRight,
  SlidersHorizontal,
  GraduationCap,
  LayoutGrid,
  RefreshCw,
  AlertCircle,
  Clock3,
  Building2,
  Award,
  CheckCircle2,
} from "lucide-react";

import { supabase } from "../services/supabase";

const COLORS = [
  "#E5F2EF",
  "#EAF0FA",
  "#F5EFE5",
  "#F0EBF7",
  "#EAF2F5",
  "#F5F0E8",
];

function CourseCard({ course, hasUpdate, onClick }) {
  const color = COLORS[
    Math.abs(
      String(course.id).split("").reduce((sum, char) => sum + char.charCodeAt(0), 0)
    ) % COLORS.length
  ];

  return (
    <button
      onClick={onClick}
      className="group w-full text-left bg-white rounded-[24px] p-4 sm:p-5 hover:shadow-lg hover:shadow-[#176D68]/5 transition-all duration-200"
    >
      <div
        className="h-36 sm:h-40 rounded-[18px] flex items-center justify-center relative"
        style={{ backgroundColor: color }}
      >
        <BookOpen size={48} className="text-[#176D68]" />

        <span className="absolute top-3 left-3 px-3 py-1.5 rounded-full bg-white/90 text-xs font-semibold text-[#53645E]">
          {course.course_code || "COURSE"}
        </span>

        {hasUpdate && (
          <span
            className="absolute top-3 right-3 w-3 h-3 rounded-full bg-red-500 ring-4 ring-white animate-pulse"
            title="New course information"
          />
        )}

        <span className="absolute bottom-3 right-3 bg-white/90 rounded-full p-2 text-[#176D68] opacity-0 group-hover:opacity-100 transition-opacity">
          <ArrowUpRight size={18} />
        </span>
      </div>

      <div className="mt-4">
        <p className="text-xs font-medium text-[#81918B]">
          {course.course_type || "General course"}
        </p>

        <h3 className="mt-1 text-[16px] font-bold text-[#20302D] leading-snug">
          {course.course_name}
        </h3>

        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-2 text-xs text-[#81918B]">
            <Building2 size={14} />
            <span>{course.department || "Department not specified"}</span>
          </div>

          <div className="flex items-center gap-2 text-xs text-[#81918B]">
            <Award size={14} />
            <span>
              {course.credit_units ?? "—"} credit units
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between mt-5 pt-4 border-t border-[#F1F5F3]">
          <span className="text-xs font-semibold text-[#176D68]">
            View course details
          </span>

          <ArrowUpRight size={17} className="text-[#176D68]" />
        </div>
      </div>
    </button>
  );
}

export default function Classes() {
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Courses");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [updatedCourseIds, setUpdatedCourseIds] = useState([]);

  const storageKey = "outliersource_course_seen";

  const getSeenCourses = () => {
    try {
      return JSON.parse(localStorage.getItem(storageKey) || "{}");
    } catch {
      return {};
    }
  };

  const fetchCourses = useCallback(async (manual = false) => {
    try {
      if (manual) setRefreshing(true);
      else setLoading(true);

      setError("");

      const { data, error: fetchError } = await supabase
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
        .order("course_code", { ascending: true });

      if (fetchError) throw fetchError;

      const records = data || [];
      setCourses(records);

      const seen = getSeenCourses();
      const newUpdates = [];

      records.forEach((course) => {
        const latestUpdate = new Date(
          course.updated_at || course.created_at || 0
        ).getTime();

        const lastSeen = seen[course.id];

        // First visit establishes a baseline rather than marking
        // every existing course as new.
        if (lastSeen === undefined) {
          seen[course.id] = latestUpdate;
        } else if (latestUpdate > Number(lastSeen)) {
          newUpdates.push(course.id);
        }
      });

      localStorage.setItem(storageKey, JSON.stringify(seen));
      setUpdatedCourseIds(newUpdates);

    } catch (err) {
      console.error("Courses fetch error:", err);
      setError(err.message || "Unable to load courses.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();

    const channel = supabase
      .channel("student-courses-live")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "courses",
        },
        () => {
          fetchCourses();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchCourses]);

  const categories = useMemo(() => {
    const types = [
      ...new Set(
        courses
          .map((course) => course.course_type)
          .filter(Boolean)
      ),
    ];

    return ["All Courses", ...types];
  }, [courses]);

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const query = search.toLowerCase().trim();

      const matchesSearch =
        !query ||
        course.course_name?.toLowerCase().includes(query) ||
        course.course_code?.toLowerCase().includes(query) ||
        course.department?.toLowerCase().includes(query) ||
        course.course_type?.toLowerCase().includes(query);

      const matchesCategory =
        category === "All Courses" ||
        course.course_type === category;

      return matchesSearch && matchesCategory;
    });
  }, [courses, search, category]);

  const handleCourseClick = (course) => {
    const seen = getSeenCourses();

    seen[course.id] = new Date(
      course.updated_at || course.created_at || Date.now()
    ).getTime();

    localStorage.setItem(storageKey, JSON.stringify(seen));

    setUpdatedCourseIds((previous) =>
      previous.filter((id) => id !== course.id)
    );

    navigate(`/courses/${course.id}`);
  };

  const totalCourses = courses.length;
  const updatedCount = updatedCourseIds.length;
  const totalCredits = courses.reduce(
    (sum, course) => sum + (Number(course.credit_units) || 0),
    0
  );

  return (
    <div className="space-y-7 pb-6">

      {/* Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-sm text-[#81918B]">
            Your academic workspace
          </p>

          <h1 className="text-2xl sm:text-3xl font-bold text-[#20302D] mt-1">
            All Courses
          </h1>

          <p className="text-sm text-[#81918B] mt-2">
            Explore your programme's courses and their academic details.
          </p>
        </div>

        <button
          onClick={() => fetchCourses(true)}
          disabled={refreshing}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-[#176D68] text-white text-sm font-semibold hover:bg-[#105A55] transition-colors disabled:opacity-60"
        >
          <RefreshCw
            size={17}
            className={refreshing ? "animate-spin" : ""}
          />
          Refresh courses
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-[22px] p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#81918B]">
              Total Courses
            </span>
            <LayoutGrid size={19} className="text-[#176D68]" />
          </div>
          <h2 className="text-3xl font-bold text-[#20302D] mt-3">
            {loading ? "—" : totalCourses}
          </h2>
          <p className="text-xs text-[#81918B] mt-1">
            Available courses
          </p>
        </div>

        <div className="bg-white rounded-[22px] p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#81918B]">
              Course Updates
            </span>
            <CheckCircle2 size={19} className="text-[#176D68]" />
          </div>
          <h2 className="text-3xl font-bold text-[#20302D] mt-3">
            {loading ? "—" : updatedCount}
          </h2>
          <p className="text-xs text-[#81918B] mt-1">
            New or updated courses
          </p>
        </div>

        <div className="bg-white rounded-[22px] p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#81918B]">
              Total Credit Units
            </span>
            <GraduationCap size={20} className="text-[#176D68]" />
          </div>
          <h2 className="text-3xl font-bold text-[#20302D] mt-3">
            {loading ? "—" : totalCredits}
          </h2>
          <p className="text-xs text-[#81918B] mt-1">
            Across available courses
          </p>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="bg-white rounded-[24px] p-12 text-center">
          <RefreshCw
            size={28}
            className="animate-spin text-[#176D68] mx-auto mb-3"
          />
          <p className="text-sm text-[#81918B]">
            Loading all courses...
          </p>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="bg-red-50 rounded-2xl p-5 flex gap-3">
          <AlertCircle className="text-red-600 shrink-0" size={21} />
          <div>
            <p className="text-sm font-semibold text-red-700">
              Could not load courses
            </p>
            <p className="text-xs text-red-600 mt-1">{error}</p>
            <button
              onClick={() => fetchCourses(true)}
              className="text-xs font-bold text-red-700 underline mt-3"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Search and filters */}
          <div className="bg-white rounded-[22px] p-4 sm:p-5 space-y-5">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search
                  size={19}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#81918B]"
                />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search course name, code or department..."
                  className="w-full h-12 pl-12 pr-4 rounded-full bg-[#F5F8F6] text-sm text-[#20302D] outline-none focus:ring-2 focus:ring-[#176D68]/20"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <SlidersHorizontal
                size={16}
                className="text-[#81918B] shrink-0"
              />

              {categories.map((item) => (
                <button
                  key={item}
                  onClick={() => setCategory(item)}
                  className={`whitespace-nowrap px-4 py-2.5 rounded-full text-xs font-semibold transition-colors ${
                    category === item
                      ? "bg-[#176D68] text-white"
                      : "bg-[#F1F5F3] text-[#71827C] hover:bg-[#E4F2EF]"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Course results */}
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-[#20302D]">
                  Course Catalogue
                </h2>
                <p className="text-xs text-[#81918B] mt-1">
                  Showing {filteredCourses.length} of {totalCourses} courses
                </p>
              </div>

              <button
                onClick={() => {
                  setSearch("");
                  setCategory("All Courses");
                }}
                className="text-xs font-semibold text-[#176D68]"
              >
                Clear filters
              </button>
            </div>

            {filteredCourses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {filteredCourses.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    hasUpdate={updatedCourseIds.includes(course.id)}
                    onClick={() => handleCourseClick(course)}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-[24px] p-10 text-center">
                <div className="w-14 h-14 rounded-full bg-[#E4F2EF] text-[#176D68] grid place-items-center mx-auto">
                  <Search size={23} />
                </div>

                <h3 className="font-bold text-[#20302D] mt-4">
                  {courses.length === 0
                    ? "No courses available"
                    : "No matching courses"}
                </h3>

                <p className="text-sm text-[#81918B] mt-2">
                  {courses.length === 0
                    ? "Courses added by your administrator will appear here."
                    : "Try another search or change your filters."}
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
