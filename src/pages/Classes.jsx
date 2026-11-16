
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  BookOpen,
  Clock3,
  ArrowUpRight,
  Play,
  CheckCircle2,
  SlidersHorizontal,
  GraduationCap,
  Bookmark,
  LayoutGrid,
} from "lucide-react";

const courses = [
  {
    id: 1,
    title: "Introduction to Computer Science",
    code: "COS 101",
    lecturer: "Dr. A. Johnson",
    category: "Computer Science",
    progress: 75,
    lessons: 20,
    completed: 15,
    duration: "8 weeks",
    color: "#E5F2EF",
    icon: "💻",
    status: "In Progress",
  },
  {
    id: 2,
    title: "Fundamentals of Mathematics",
    code: "MTH 101",
    lecturer: "Prof. Williams",
    category: "Mathematics",
    progress: 45,
    lessons: 16,
    completed: 7,
    duration: "6 weeks",
    color: "#EAF0FA",
    icon: "📐",
    status: "In Progress",
  },
  {
    id: 3,
    title: "Communication in English",
    code: "GST 111",
    lecturer: "Mrs. Adeyemi",
    category: "General Studies",
    progress: 100,
    lessons: 12,
    completed: 12,
    duration: "5 weeks",
    color: "#F5EFE5",
    icon: "📚",
    status: "Completed",
  },
  {
    id: 4,
    title: "Introduction to Statistics",
    code: "STA 101",
    lecturer: "Dr. Ibrahim",
    category: "Statistics",
    progress: 20,
    lessons: 15,
    completed: 3,
    duration: "7 weeks",
    color: "#F0EBF7",
    icon: "📊",
    status: "In Progress",
  },
  {
    id: 5,
    title: "Basic Programming Concepts",
    code: "COS 103",
    lecturer: "Mr. David",
    category: "Computer Science",
    progress: 0,
    lessons: 18,
    completed: 0,
    duration: "8 weeks",
    color: "#EAF2F5",
    icon: "⌨️",
    status: "Not Started",
  },
  {
    id: 6,
    title: "Principles of Economics",
    code: "ECO 101",
    lecturer: "Mrs. Okafor",
    category: "General Studies",
    progress: 100,
    lessons: 14,
    completed: 14,
    duration: "6 weeks",
    color: "#F5F0E8",
    icon: "📈",
    status: "Completed",
  },
];

const categories = [
  "All Courses",
  "Computer Science",
  "Mathematics",
  "Statistics",
  "General Studies",
];

function CourseCard({ course, onClick }) {
  return (
    <button
      onClick={onClick}
      className="group w-full text-left bg-white rounded-[24px] p-4 sm:p-5 hover:shadow-lg hover:shadow-[#176D68]/5 transition-all duration-200"
    >
      <div
        className="h-36 sm:h-40 rounded-[18px] flex items-center justify-center relative"
        style={{ backgroundColor: course.color }}
      >
        <span className="text-5xl">{course.icon}</span>

        <span className="absolute top-3 left-3 px-3 py-1.5 rounded-full bg-white/80 text-xs font-semibold text-[#53645E]">
          {course.code}
        </span>

        {course.status === "Completed" && (
          <span className="absolute top-3 right-3 bg-white rounded-full p-1.5 text-[#176D68]">
            <CheckCircle2 size={17} />
          </span>
        )}

        <span className="absolute bottom-3 right-3 bg-white/90 rounded-full p-2 text-[#176D68] opacity-0 group-hover:opacity-100 transition-opacity">
          <ArrowUpRight size={18} />
        </span>
      </div>

      <div className="mt-4">
        <p className="text-xs font-medium text-[#81918B]">
          {course.category}
        </p>

        <h3 className="mt-1 text-[16px] font-bold text-[#20302D] leading-snug">
          {course.title}
        </h3>

        <p className="mt-2 text-sm text-[#81918B]">
          {course.lecturer}
        </p>

        <div className="flex items-center justify-between mt-5 text-xs">
          <span className="text-[#71827C]">
            {course.completed}/{course.lessons} lessons
          </span>
          <span className="font-bold text-[#176D68]">
            {course.progress}%
          </span>
        </div>

        <div className="h-2 bg-[#EDF2EF] rounded-full mt-2 overflow-hidden">
          <div
            className="h-full rounded-full bg-[#176D68] transition-all"
            style={{ width: `${course.progress}%` }}
          />
        </div>

        <div className="flex items-center justify-between mt-4">
          <span
            className={`text-xs font-semibold px-3 py-1.5 rounded-full ${
              course.status === "Completed"
                ? "bg-[#E4F2EF] text-[#176D68]"
                : course.status === "Not Started"
                ? "bg-[#F1F3F2] text-[#71827C]"
                : "bg-[#EAF0FA] text-[#42658A]"
            }`}
          >
            {course.status}
          </span>

          <span className="flex items-center gap-1 text-xs text-[#81918B]">
            <Clock3 size={13} />
            {course.duration}
          </span>
        </div>
      </div>
    </button>
  );
}

export default function Classes() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Courses");
  const [status, setStatus] = useState("All");

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesSearch =
        course.title.toLowerCase().includes(search.toLowerCase()) ||
        course.code.toLowerCase().includes(search.toLowerCase()) ||
        course.lecturer.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        category === "All Courses" || course.category === category;

      const matchesStatus =
        status === "All" || course.status === status;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [search, category, status]);

  const totalCourses = courses.length;
  const completedCourses = courses.filter(
    (course) => course.status === "Completed"
  ).length;
  const activeCourses = courses.filter(
    (course) => course.status === "In Progress"
  ).length;

  return (
    <div className="space-y-7 pb-6">
      {/* Page heading */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-sm text-[#81918B]">Your academic workspace</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#20302D] mt-1">
            My Courses
          </h1>
          <p className="text-sm text-[#81918B] mt-2">
            Explore your courses and keep track of your learning progress.
          </p>
        </div>

        <button
          onClick={() => navigate("/resources")}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-[#176D68] text-white text-sm font-semibold hover:bg-[#105A55] transition-colors"
        >
          <BookOpen size={17} />
          Browse Resources
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-[22px] p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#81918B]">Total Courses</span>
            <LayoutGrid size={19} className="text-[#176D68]" />
          </div>
          <h2 className="text-3xl font-bold text-[#20302D] mt-3">
            {totalCourses}
          </h2>
          <p className="text-xs text-[#81918B] mt-1">Available courses</p>
        </div>

        <div className="bg-white rounded-[22px] p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#81918B]">In Progress</span>
            <Play size={19} className="text-[#42658A]" />
          </div>
          <h2 className="text-3xl font-bold text-[#20302D] mt-3">
            {activeCourses}
          </h2>
          <p className="text-xs text-[#81918B] mt-1">Courses you're learning</p>
        </div>

        <div className="bg-white rounded-[22px] p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#81918B]">Completed</span>
            <GraduationCap size={20} className="text-[#176D68]" />
          </div>
          <h2 className="text-3xl font-bold text-[#20302D] mt-3">
            {completedCourses}
          </h2>
          <p className="text-xs text-[#81918B] mt-1">Successfully completed</p>
        </div>
      </div>

      {/* Search */}
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
              placeholder="Search courses, course codes or lecturers..."
              className="w-full h-12 pl-12 pr-4 rounded-full bg-[#F5F8F6] text-sm text-[#20302D] outline-none focus:ring-2 focus:ring-[#176D68]/20"
            />
          </div>

          <div className="relative">
            <SlidersHorizontal
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#81918B] pointer-events-none"
            />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="h-12 w-full sm:w-48 pl-11 pr-4 rounded-full bg-[#F5F8F6] text-sm text-[#53645E] outline-none appearance-none"
            >
              <option value="All">All statuses</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Not Started">Not Started</option>
            </select>
          </div>
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-1">
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
              All Courses
            </h2>
            <p className="text-xs text-[#81918B] mt-1">
              Showing {filteredCourses.length} of {totalCourses} courses
            </p>
          </div>

          <button
            onClick={() => {
              setSearch("");
              setCategory("All Courses");
              setStatus("All");
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
                onClick={() => navigate(`/courses/${course.id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-[24px] p-10 text-center">
            <div className="w-14 h-14 rounded-full bg-[#E4F2EF] text-[#176D68] grid place-items-center mx-auto">
              <Search size={23} />
            </div>
            <h3 className="font-bold text-[#20302D] mt-4">
              No courses found
            </h3>
            <p className="text-sm text-[#81918B] mt-2">
              Try another search or change your filters.
            </p>
            <button
              onClick={() => {
                setSearch("");
                setCategory("All Courses");
                setStatus("All");
              }}
              className="mt-5 text-sm font-semibold text-[#176D68]"
            >
              Reset filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
