
import React, { useMemo, useState } from "react";
import {
  Activity,
  BookOpen,
  FileText,
  Download,
  CheckCircle2,
  Award,
  Clock3,
  Search,
  Filter,
  ArrowUpRight,
  CalendarDays,
  GraduationCap,
} from "lucide-react";

const activities = [
  {
    id: 1,
    title: "Completed Introduction to Programming",
    description: "You completed Lesson 5: Variables and Data Types.",
    category: "Lesson",
    course: "COS 101",
    date: "2026-11-14",
    time: "10:35 AM",
    icon: CheckCircle2,
    color: "teal",
  },
  {
    id: 2,
    title: "Downloaded Lecture Notes",
    description: "You downloaded the latest computer science lecture notes.",
    category: "Download",
    course: "COS 101",
    date: "2026-11-14",
    time: "09:20 AM",
    icon: Download,
    color: "blue",
  },
  {
    id: 3,
    title: "Course progress updated",
    description: "You reached 75% completion in this course.",
    category: "Progress",
    course: "COS 101",
    date: "2026-11-13",
    time: "04:15 PM",
    icon: Activity,
    color: "purple",
  },
  {
    id: 4,
    title: "Assignment submitted",
    description: "Your assignment was submitted successfully.",
    category: "Assignment",
    course: "MTH 101",
    date: "2026-11-13",
    time: "11:45 AM",
    icon: FileText,
    color: "orange",
  },
  {
    id: 5,
    title: "Achievement unlocked",
    description: "You earned the Fast Learner achievement.",
    category: "Achievement",
    course: "General",
    date: "2026-11-12",
    time: "02:30 PM",
    icon: Award,
    color: "yellow",
  },
  {
    id: 6,
    title: "Completed a learning module",
    description: "You finished the Introduction to Statistics module.",
    category: "Lesson",
    course: "STA 101",
    date: "2026-11-11",
    time: "01:10 PM",
    icon: BookOpen,
    color: "teal",
  },
  {
    id: 7,
    title: "Downloaded Study Guide",
    description: "You downloaded the mathematics revision guide.",
    category: "Download",
    course: "MTH 101",
    date: "2026-11-10",
    time: "08:40 AM",
    icon: Download,
    color: "blue",
  },
  {
    id: 8,
    title: "Course enrolled",
    description: "You enrolled in Basic Programming Concepts.",
    category: "Course",
    course: "COS 103",
    date: "2026-11-09",
    time: "09:00 AM",
    icon: GraduationCap,
    color: "purple",
  },
];

const filters = [
  "All",
  "Lesson",
  "Download",
  "Progress",
  "Assignment",
  "Achievement",
  "Course",
];

const styles = {
  teal: "bg-[#E4F2EF] text-[#176D68]",
  blue: "bg-blue-50 text-blue-700",
  purple: "bg-purple-50 text-purple-700",
  orange: "bg-orange-50 text-orange-700",
  yellow: "bg-amber-50 text-amber-700",
};

function formatDate(date) {
  return new Date(`${date}T12:00:00`).toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function RecentActivity() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");

  const filteredActivities = useMemo(() => {
    return activities.filter((activity) => {
      const matchesFilter =
        activeFilter === "All" || activity.category === activeFilter;

      const query = search.toLowerCase();

      const matchesSearch =
        activity.title.toLowerCase().includes(query) ||
        activity.description.toLowerCase().includes(query) ||
        activity.course.toLowerCase().includes(query);

      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, search]);

  const groupedActivities = useMemo(() => {
    return filteredActivities.reduce((groups, activity) => {
      if (!groups[activity.date]) groups[activity.date] = [];
      groups[activity.date].push(activity);
      return groups;
    }, {});
  }, [filteredActivities]);

  const stats = [
    {
      label: "Total activities",
      value: activities.length,
      icon: Activity,
    },
    {
      label: "Lessons completed",
      value: activities.filter((a) => a.category === "Lesson").length,
      icon: CheckCircle2,
    },
    {
      label: "Materials downloaded",
      value: activities.filter((a) => a.category === "Download").length,
      icon: Download,
    },
    {
      label: "Achievements",
      value: activities.filter((a) => a.category === "Achievement").length,
      icon: Award,
    },
  ];

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-sm font-semibold text-[#176D68] mb-2">
          <Activity size={17} />
          Your learning journey
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-[#20302D]">
          Recent Activity
        </h1>

        <p className="text-sm text-[#81918B] mt-1">
          Review your learning progress and everything you've been doing.
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className="bg-white rounded-2xl p-4 sm:p-5"
            >
              <div className="w-10 h-10 rounded-xl bg-[#E4F2EF] text-[#176D68] grid place-items-center mb-4">
                <Icon size={20} />
              </div>

              <p className="text-2xl font-bold text-[#20302D]">
                {item.value}
              </p>

              <p className="text-xs sm:text-sm text-[#81918B] mt-1">
                {item.label}
              </p>
            </div>
          );
        })}
      </div>

      {/* Activity history */}
      <section className="bg-white rounded-3xl p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="font-bold text-lg text-[#20302D]">
              Activity history
            </h2>

            <p className="text-xs text-[#81918B] mt-1">
              Your recorded academic activities
            </p>
          </div>

          <div className="relative w-full sm:max-w-xs">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#81918B]"
            />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search activities..."
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#F5F8F6] text-sm outline-none focus:ring-2 focus:ring-[#176D68]/20"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-5">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-colors ${
                activeFilter === filter
                  ? "bg-[#176D68] text-white"
                  : "bg-[#F1F5F3] text-[#71827C] hover:bg-[#E4F2EF]"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Timeline */}
        {Object.keys(groupedActivities).length > 0 ? (
          <div className="space-y-7">
            {Object.entries(groupedActivities).map(([date, items]) => (
              <div key={date}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-[#E4F2EF] text-[#176D68] grid place-items-center">
                    <CalendarDays size={17} />
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-[#20302D]">
                      {formatDate(date)}
                    </h3>

                    <p className="text-xs text-[#81918B]">
                      {items.length} {items.length === 1 ? "activity" : "activities"}
                    </p>
                  </div>
                </div>

                <div className="ml-4 sm:ml-5 pl-5 border-l-2 border-[#E4F2EF] space-y-4">
                  {items.map((activity) => {
                    const Icon = activity.icon;

                    return (
                      <div
                        key={activity.id}
                        className="relative flex gap-3 sm:gap-4"
                      >
                        <div className="absolute -left-[27px] top-3 w-3 h-3 rounded-full bg-[#176D68] ring-4 ring-white" />

                        <div
                          className={`w-11 h-11 rounded-xl shrink-0 grid place-items-center ${
                            styles[activity.color]
                          }`}
                        >
                          <Icon size={19} />
                        </div>

                        <div className="flex-1 min-w-0 bg-[#F5F8F6] rounded-2xl p-3 sm:p-4">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <h4 className="text-sm font-semibold text-[#20302D]">
                              {activity.title}
                            </h4>

                            <span className="text-[10px] font-semibold text-[#81918B] bg-white px-2 py-1 rounded-full">
                              {activity.category}
                            </span>
                          </div>

                          <p className="text-xs text-[#71827C] mt-2 leading-relaxed">
                            {activity.description}
                          </p>

                          <div className="flex flex-wrap items-center gap-3 mt-3">
                            <span className="text-[11px] text-[#81918B] flex items-center gap-1">
                              <Clock3 size={13} />
                              {activity.time}
                            </span>

                            <span className="text-[11px] text-[#176D68] font-semibold">
                              {activity.course}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-14 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#E4F2EF] text-[#176D68] grid place-items-center mx-auto mb-4">
              <Filter size={24} />
            </div>

            <h3 className="font-semibold text-[#20302D]">
              No activities found
            </h3>

            <p className="text-sm text-[#81918B] mt-1">
              Try another search or activity category.
            </p>

            <button
              onClick={() => {
                setSearch("");
                setActiveFilter("All");
              }}
              className="mt-4 text-sm font-semibold text-[#176D68]"
            >
              Clear filters
            </button>
          </div>
        )}
      </section>

      {/* Footer note */}
      <div className="flex items-start gap-3 bg-[#E4F2EF] rounded-2xl p-4">
        <Activity size={19} className="text-[#176D68] shrink-0 mt-0.5" />

        <div>
          <h3 className="text-sm font-semibold text-[#176D68]">
            Keep learning consistently
          </h3>

          <p className="text-xs text-[#426D68] mt-1 leading-relaxed">
            Every completed lesson and learning activity contributes to your
            academic progress. Keep building your learning history.
          </p>
        </div>
      </div>
    </div>
  );
}
