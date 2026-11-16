
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bookmark,
  Search,
  BookOpen,
  FileText,
  Video,
  Clock,
  ArrowUpRight,
  Trash2,
  BookmarkX,
} from "lucide-react";

const initialBookmarks = [
  {
    id: 1,
    title: "Introduction to Computer Science",
    description: "Learn the fundamentals of computing and computer systems.",
    category: "Courses",
    subject: "COS 101",
    duration: "8 weeks",
    date: "Nov 10, 2026",
    route: "/courses/1",
  },
  {
    id: 2,
    title: "Fundamentals of Mathematics",
    description: "Explore mathematical concepts and problem-solving techniques.",
    category: "Courses",
    subject: "MTH 101",
    duration: "10 weeks",
    date: "Nov 08, 2026",
    route: "/courses/2",
  },
  {
    id: 3,
    title: "Understanding JavaScript Variables",
    description: "A beginner-friendly tutorial covering JavaScript variables.",
    category: "Tutorials",
    subject: "Programming",
    duration: "25 min",
    date: "Nov 07, 2026",
    route: "/tutorials",
  },
  {
    id: 4,
    title: "Introduction to Statistics Notes",
    description: "Important lecture notes covering basic statistical concepts.",
    category: "Materials",
    subject: "STA 101",
    duration: "PDF",
    date: "Nov 05, 2026",
    route: "/materials",
  },
  {
    id: 5,
    title: "HTML and CSS Fundamentals",
    description: "Understand the foundations of web development.",
    category: "Tutorials",
    subject: "Web Development",
    duration: "40 min",
    date: "Nov 03, 2026",
    route: "/tutorials",
  },
  {
    id: 6,
    title: "Basic Programming Study Guide",
    description: "A useful revision guide for introductory programming.",
    category: "Materials",
    subject: "COS 103",
    duration: "PDF",
    date: "Nov 01, 2026",
    route: "/materials",
  },
];

const filters = ["All", "Courses", "Tutorials", "Materials"];

export default function Bookmarks() {
  const navigate = useNavigate();

  const [bookmarks, setBookmarks] = useState(initialBookmarks);
  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");

  const filteredBookmarks = useMemo(() => {
    return bookmarks.filter((item) => {
      const matchesFilter =
        activeFilter === "All" ||
        item.category === activeFilter;

      const matchesSearch =
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.subject.toLowerCase().includes(search.toLowerCase()) ||
        item.description.toLowerCase().includes(search.toLowerCase());

      return matchesFilter && matchesSearch;
    });
  }, [bookmarks, activeFilter, search]);

  const removeBookmark = (id) => {
    setBookmarks((previous) =>
      previous.filter((item) => item.id !== id)
    );
  };

  const getIcon = (category) => {
    if (category === "Courses") return BookOpen;
    if (category === "Tutorials") return Video;
    return FileText;
  };

  const getColor = (category) => {
    if (category === "Courses") {
      return "bg-[#E4F2EF] text-[#176D68]";
    }

    if (category === "Tutorials") {
      return "bg-[#EAF0FA] text-[#5276A8]";
    }

    return "bg-[#FFF2E5] text-[#B87532]";
  };

  return (
    <div className="space-y-7 pb-8">

      {/* Header */}
      <div>
        <p className="text-sm text-[#81918B] mb-1">
          Learning / Saved Resources
        </p>

        <h1 className="text-2xl sm:text-3xl font-bold text-[#20302D]">
          My Bookmarks
        </h1>

        <p className="text-sm text-[#81918B] mt-2">
          Keep your important learning resources within reach.
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        <SummaryCard
          title="Total Bookmarks"
          value={bookmarks.length}
          icon={Bookmark}
        />

        <SummaryCard
          title="Saved Courses"
          value={bookmarks.filter((item) => item.category === "Courses").length}
          icon={BookOpen}
        />

        <SummaryCard
          title="Saved Materials"
          value={bookmarks.filter((item) => item.category === "Materials").length}
          icon={FileText}
        />

      </div>

      {/* Search */}
      <div className="bg-white rounded-[24px] p-4">
        <div className="relative">
          <Search
            size={19}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#81918B]"
          />

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search saved resources..."
            className="w-full bg-[#F5F8F6] rounded-2xl py-4 pl-12 pr-4 text-sm outline-none focus:ring-2 focus:ring-[#176D68]/20"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`shrink-0 px-5 py-2.5 rounded-full text-sm font-semibold transition ${
              activeFilter === filter
                ? "bg-[#176D68] text-white"
                : "bg-white text-[#81918B] hover:bg-[#E4F2EF]"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-lg text-[#20302D]">
            Saved Resources
          </h2>

          <p className="text-xs text-[#81918B] mt-1">
            {filteredBookmarks.length} resources found
          </p>
        </div>
      </div>

      {/* Bookmark Cards */}
      {filteredBookmarks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

          {filteredBookmarks.map((item) => {
            const Icon = getIcon(item.category);

            return (
              <article
                key={item.id}
                className="bg-white rounded-[26px] p-5 hover:shadow-sm transition flex flex-col"
              >

                <div className="flex items-start justify-between mb-5">
                  <div className={`p-3.5 rounded-2xl ${getColor(item.category)}`}>
                    <Icon size={22} />
                  </div>

                  <button
                    onClick={() => removeBookmark(item.id)}
                    title="Remove bookmark"
                    aria-label={`Remove ${item.title}`}
                    className="p-2.5 rounded-xl text-[#81918B] hover:text-red-500 hover:bg-red-50 transition"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-3">
                    <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${getColor(item.category)}`}>
                      {item.category}
                    </span>

                    <span className="text-xs text-[#81918B]">
                      {item.subject}
                    </span>
                  </div>

                  <h3 className="font-bold text-[#20302D] text-base leading-6">
                    {item.title}
                  </h3>

                  <p className="text-sm text-[#81918B] leading-6 mt-2">
                    {item.description}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-3 mt-6 pt-4 border-t border-[#F1F5F3]">
                  <div className="flex items-center gap-2 text-xs text-[#81918B]">
                    <Clock size={14} />
                    {item.duration}
                  </div>

                  <button
                    onClick={() => navigate(item.route)}
                    className="flex items-center gap-2 text-sm font-semibold text-[#176D68] hover:gap-3 transition-all"
                  >
                    Open
                    <ArrowUpRight size={16} />
                  </button>
                </div>

              </article>
            );
          })}

        </div>
      ) : (
        <div className="bg-white rounded-[28px] py-16 px-5 text-center">

          <div className="w-16 h-16 mx-auto rounded-2xl bg-[#E4F2EF] text-[#176D68] flex items-center justify-center mb-5">
            <BookmarkX size={28} />
          </div>

          <h3 className="font-bold text-lg text-[#20302D]">
            No bookmarks found
          </h3>

          <p className="text-sm text-[#81918B] mt-2 max-w-sm mx-auto">
            {search
              ? "Try searching with another keyword."
              : "You haven't saved any resources in this category yet."}
          </p>

          {search && (
            <button
              onClick={() => setSearch("")}
              className="mt-5 text-sm font-semibold text-[#176D68]"
            >
              Clear search
            </button>
          )}

        </div>
      )}

    </div>
  );
}

/* Summary Card */
function SummaryCard({ title, value, icon: Icon }) {
  return (
    <div className="bg-white rounded-[24px] p-5 flex items-center gap-4">
      <div className="p-3.5 rounded-2xl bg-[#E4F2EF] text-[#176D68]">
        <Icon size={21} />
      </div>

      <div>
        <p className="text-xs text-[#81918B]">
          {title}
        </p>

        <h3 className="text-2xl font-bold text-[#20302D] mt-1">
          {value}
        </h3>
      </div>
    </div>
  );
}
