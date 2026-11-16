
import React from "react";

import {
  BookOpen,
  GraduationCap,
  Award,
  ArrowRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Play,
  FileText,
  CalendarDays,
  CheckCircle2,
  TrendingUp,
  MoreHorizontal
} from "lucide-react";

// Dashboard sample data
const stats = [
  {
    title: "Enrolled Courses",
    value: "24",
    icon: BookOpen,
    color: "#176D68",
    bg: "#E4F2EF"
  },
  {
    title: "Lessons",
    value: "56",
    icon: GraduationCap,
    color: "#6583C5",
    bg: "#EEF1FA"
  },
  {
    title: "Certificates",
    value: "17",
    icon: Award,
    color: "#C58C49",
    bg: "#FAF1E4"
  }
];

const courses = [
  {
    title: "Introduction to Computer Science",
    category: "Computer Science",
    progress: 75,
    lessons: "12 lessons",
    status: "In Progress",
    color: "#176D68"
  },
  {
    title: "Data Structures and Algorithms",
    category: "Programming",
    progress: 45,
    lessons: "18 lessons",
    status: "In Progress",
    color: "#6583C5"
  },
  {
    title: "Database Management Systems",
    category: "Database",
    progress: 100,
    lessons: "10 lessons",
    status: "Completed",
    color: "#C58C49"
  },
  {
    title: "Web Development Fundamentals",
    category: "Development",
    progress: 30,
    lessons: "15 lessons",
    status: "In Progress",
    color: "#8A72B9"
  }
];

const activities = [
  {
    title: "Introduction to Programming",
    type: "Lecture",
    time: "10:00 AM",
    icon: BookOpen
  },
  {
    title: "Database Assignment",
    type: "Assignment",
    time: "12:30 PM",
    icon: FileText
  },
  {
    title: "Departmental Seminar",
    type: "Event",
    time: "2:00 PM",
    icon: CalendarDays
  }
];

// Reusable statistic card
function StatCard({ item }) {
  const Icon = item.icon;

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 min-w-0">
      <div className="flex items-center justify-between gap-2">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: item.bg, color: item.color }}
        >
          <Icon size={21} />
        </div>

        <MoreHorizontal size={19} className="text-[#A0ADA8]" />
      </div>

      <h3 className="text-2xl font-bold text-[#20302D] mt-5">
        {item.value}
      </h3>

      <p className="text-xs text-[#899791] mt-1">
        {item.title}
      </p>

      <button className="flex items-center gap-2 text-xs font-semibold text-[#176D68] mt-5">
        View details <ArrowRight size={14} />
      </button>
    </div>
  );
}

// Reusable course progress row
function CourseRow({ course }) {
  return (
    <div className="flex items-center gap-3 sm:gap-4 py-4 border-b border-[#F0F3F1] last:border-0">

      <div
        className="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center text-white"
        style={{ backgroundColor: course.color }}
      >
        <BookOpen size={18} />
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="text-xs sm:text-sm font-semibold text-[#354540] truncate">
          {course.title}
        </h4>

        <p className="text-[10px] text-[#9AA7A2] mt-1">
          {course.category} · {course.lessons}
        </p>
      </div>

      <div className="hidden sm:block w-24 lg:w-32 shrink-0">
        <div className="h-1.5 bg-[#EEF2F0] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{
              width: `${course.progress}%`,
              backgroundColor: course.color
            }}
          />
        </div>
      </div>

      <span className="text-[10px] text-[#899791] w-9 text-right">
        {course.progress}%
      </span>

      <span
        className={`hidden md:block text-[10px] px-2.5 py-1 rounded-full ${
          course.status === "Completed"
            ? "bg-[#E4F2EF] text-[#176D68]"
            : "bg-[#FAF1E4] text-[#B17A34]"
        }`}
      >
        {course.status}
      </span>

      <button
        className="text-[#A0ADA8] hover:text-[#176D68]"
        aria-label={`Open ${course.title}`}
      >
        <ChevronRight size={17} />
      </button>
    </div>
  );
}

// Weekly learning chart
function LearningChart() {
  return (
    <div className="bg-white rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-[#354540]">
            Learning activity
          </h3>
          <p className="text-xs text-[#9AA7A2] mt-1">
            Your weekly study hours
          </p>
        </div>

        <button className="flex items-center gap-1 text-[10px] text-[#899791] bg-[#F5F8F6] px-3 py-2 rounded-full">
          This week <ChevronDown size={13} />
        </button>
      </div>

      <div className="mt-5">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-bold text-[#20302D]">
              30
              <span className="text-sm font-medium text-[#899791] ml-1">
                hrs
              </span>
            </h2>
            <p className="text-[10px] text-[#9AA7A2] mt-1">
              Total time spent
            </p>
          </div>

          <div className="flex items-center gap-1 text-xs text-[#176D68]">
            <TrendingUp size={14} />
            12%
          </div>
        </div>

        <svg
          viewBox="0 0 500 160"
          className="w-full mt-5"
          role="img"
          aria-label="Weekly learning activity chart"
        >
          <defs>
            <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#176D68" stopOpacity="0.20" />
              <stop offset="100%" stopColor="#176D68" stopOpacity="0" />
            </linearGradient>
          </defs>

          {[35, 75, 115].map((y) => (
            <line
              key={y}
              x1="0"
              y1={y}
              x2="500"
              y2={y}
              stroke="#EDF2EF"
              strokeDasharray="4 5"
            />
          ))}

          <path
            d="M0 112 L70 85 L130 98 L205 55 L275 68 L345 39 L410 53 L500 43 L500 145 L0 145 Z"
            fill="url(#chartFill)"
          />

          <path
            d="M0 112 L70 85 L130 98 L205 55 L275 68 L345 39 L410 53 L500 43"
            fill="none"
            stroke="#176D68"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          <circle cx="345" cy="39" r="6" fill="#176D68" />
          <circle cx="345" cy="39" r="11" fill="#176D68" opacity="0.12" />
        </svg>

        <div className="flex justify-between text-[10px] text-[#9AA7A2]">
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
          <span>Sun</span>
        </div>
      </div>
    </div>
  );
}

// Lesson analytics
function LessonAnalytics() {
  const bars = [35, 55, 42, 80, 48, 65, 90, 52, 72, 42, 85, 60];

  return (
    <div className="bg-white rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-[#354540]">
          Lesson analytics
        </h3>

        <button className="text-[10px] text-[#899791] bg-[#F5F8F6] px-3 py-2 rounded-full">
          This week
        </button>
      </div>

      <div className="mt-6 space-y-6">

        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-[#20302D]">
              126
            </h2>
            <p className="text-[10px] text-[#9AA7A2]">
              Lessons completed
            </p>
          </div>

          <div className="flex items-end gap-1 h-12">
            {bars.map((height, index) => (
              <div
                key={index}
                className="w-2 rounded-t-full bg-[#176D68]"
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
        </div>

        <div className="h-px bg-[#F0F3F1]" />

        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-[#20302D]">
              67.5%
            </h2>
            <p className="text-[10px] text-[#9AA7A2]">
              Average completion
            </p>
          </div>

          <div className="flex items-end gap-1 h-12">
            {bars.slice().reverse().map((height, index) => (
              <div
                key={index}
                className="w-2 rounded-t-full bg-[#C58C49]"
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

// Calendar panel
function CalendarPanel() {
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div className="bg-white rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-[#354540]">
          November 2026
        </h3>

        <div className="flex gap-1">
          <button className="p-1.5 rounded-lg hover:bg-[#F1F5F3]">
            <ChevronLeft size={16} />
          </button>
          <button className="p-1.5 rounded-lg hover:bg-[#F1F5F3]">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 text-center mt-5 gap-y-3">
        {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
          <span
            key={index}
            className="text-[10px] text-[#A0ADA8]"
          >
            {day}
          </span>
        ))}

        {days.map((day) => (
          <span
            key={day}
            className={`w-7 h-7 mx-auto flex items-center justify-center rounded-full text-[10px] ${
              day === 14
                ? "bg-[#176D68] text-white font-bold"
                : "text-[#71827C]"
            }`}
          >
            {day}
          </span>
        ))}
      </div>

      <div className="mt-7">
        <h4 className="text-xs font-bold text-[#354540] mb-4">
          Upcoming activities
        </h4>

        <div className="space-y-4">
          {activities.map((activity, index) => {
            const Icon = activity.icon;

            return (
              <div key={index} className="flex gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#E4F2EF] text-[#176D68] flex items-center justify-center shrink-0">
                  <Icon size={16} />
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[#354540] truncate">
                    {activity.title}
                  </p>

                  <p className="text-[10px] text-[#9AA7A2] mt-1">
                    {activity.type} · {activity.time}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Main dashboard
export default function Home() {
  return (
    <div className="space-y-6">

      {/* Welcome heading */}
      <section className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs text-[#899791]">
            Saturday, November 14, 2026
          </p>

          <h1 className="text-2xl sm:text-3xl font-bold text-[#20302D] mt-2">
            Welcome back, Student
          </h1>

          <p className="text-sm text-[#899791] mt-2">
            Here's what's happening with your learning.
          </p>
        </div>

        <button className="flex items-center gap-2 bg-[#176D68] text-white px-4 py-3 rounded-full text-xs font-semibold hover:bg-[#105A55] transition active:scale-95">
          <Play size={15} fill="currentColor" />
          Continue learning
        </button>
      </section>

      {/* Statistics */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {stats.map((item) => (
          <StatCard key={item.title} item={item} />
        ))}
      </section>

      {/* Main dashboard columns */}
      <section className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-5">

        {/* Main content */}
        <div className="space-y-5 min-w-0">

          {/* Analytics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <LearningChart />
            <LessonAnalytics />
          </div>

          {/* Continue learning */}
          <div className="bg-white rounded-2xl p-4 sm:p-5">

            <div className="flex flex-wrap justify-between items-center gap-3 mb-5">
              <div>
                <h3 className="font-bold text-[#354540]">
                  Continue Learning
                </h3>

                <p className="text-xs text-[#9AA7A2] mt-1">
                  Pick up where you left off
                </p>
              </div>

              <button className="flex items-center gap-2 text-xs text-[#176D68] font-semibold">
                View all <ArrowRight size={15} />
              </button>
            </div>

            {/* Search */}
            <div className="hidden sm:flex items-center bg-[#F5F8F6] rounded-xl px-4 py-3 mb-3">
              <BookOpen size={16} className="text-[#9AA7A2]" />

              <input
                placeholder="Search your courses..."
                className="bg-transparent outline-none text-xs px-3 flex-1"
              />
            </div>

            {/* Course heading */}
            <div className="hidden sm:grid grid-cols-[minmax(0,1fr)_100px_45px_95px_20px] gap-3 px-2 py-3 text-[10px] text-[#A0ADA8]">
              <span>Course name</span>
              <span>Progress</span>
              <span>Done</span>
              <span>Status</span>
              <span></span>
            </div>

            {/* Course rows */}
            {courses.map((course) => (
              <CourseRow key={course.title} course={course} />
            ))}

          </div>

          {/* Recent activity */}
          <div className="bg-white rounded-2xl p-5">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-bold text-[#354540]">
                Recent activity
              </h3>

              <button className="text-xs text-[#176D68] font-semibold">
                See all
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-[#E4F2EF] text-[#176D68] rounded-xl flex items-center justify-center">
                  <CheckCircle2 size={18} />
                </div>

                <div className="flex-1">
                  <p className="text-xs font-semibold text-[#354540]">
                    Completed a lesson
                  </p>
                  <p className="text-[10px] text-[#9AA7A2] mt-1">
                    Introduction to Computer Science
                  </p>
                </div>

                <span className="text-[10px] text-[#A0ADA8]">
                  2 hours ago
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-[#FAF1E4] text-[#C58C49] rounded-xl flex items-center justify-center">
                  <Award size={18} />
                </div>

                <div className="flex-1">
                  <p className="text-xs font-semibold text-[#354540]">
                    Achievement unlocked
                  </p>
                  <p className="text-[10px] text-[#9AA7A2] mt-1">
                    Your first course milestone
                  </p>
                </div>

                <span className="text-[10px] text-[#A0ADA8]">
                  Yesterday
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Right column */}
        <aside className="space-y-5">

          <CalendarPanel />

          {/* Featured assessment */}
          <div className="bg-[#F9F0E8] rounded-2xl p-5">
            <span className="text-[10px] font-bold tracking-wider text-[#A47A49]">
              UPCOMING ASSESSMENT
            </span>

            <h3 className="font-bold text-[#493D30] mt-4">
              Computer Science Test
            </h3>

            <p className="text-xs text-[#9A8066] mt-2">
              Prepare for your upcoming departmental assessment.
            </p>

            <div className="flex items-center gap-2 mt-5 text-xs text-[#987348]">
              <Clock3 size={15} />
              Check your course schedule
            </div>
          </div>

          {/* Learning reminder */}
          <div className="bg-[#E4F2EF] rounded-2xl p-5">
            <div className="w-10 h-10 rounded-xl bg-white text-[#176D68] flex items-center justify-center">
              <TrendingUp size={20} />
            </div>

            <h3 className="font-bold text-[#245C55] mt-4">
              Keep making progress!
            </h3>

            <p className="text-xs text-[#648079] leading-5 mt-2">
              Consistent learning helps you stay on track with your academic goals.
            </p>

            <button className="mt-5 text-xs font-bold text-[#176D68] flex items-center gap-2">
              Explore courses <ArrowRight size={15} />
            </button>
          </div>

        </aside>
      </section>

    </div>
  );
}
