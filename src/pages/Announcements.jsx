
import React, { useMemo, useState } from "react";
import {
  Search,
  Megaphone,
  Pin,
  CalendarDays,
  Clock3,
  ChevronRight,
  AlertCircle,
  BookOpen,
  Bell,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const announcements = [
  {
    id: 1,
    title: "First Semester Examination Timetable",
    description:
      "The first semester examination timetable has been released. Students are advised to check their examination dates, venues and allocated times.",
    category: "Examinations",
    priority: "Important",
    author: "Department Administration",
    date: "Nov 14, 2026",
    time: "10:30 AM",
    pinned: true,
    content: [
      "The departmental first semester examination timetable is now available.",
      "Students should verify their registered courses and examination details.",
      "Please arrive at your examination venue early and bring your valid student identification."
    ],
  },
  {
    id: 2,
    title: "Submission Deadline for Assignments",
    description:
      "All outstanding assignments should be submitted before the announced deadline. Late submissions may not be accepted.",
    category: "Assignments",
    priority: "Urgent",
    author: "Academic Coordinator",
    date: "Nov 12, 2026",
    time: "2:00 PM",
    pinned: true,
    content: [
      "Students are reminded to complete and submit their outstanding assignments.",
      "Check with your individual course lecturers for submission instructions."
    ],
  },
  {
    id: 3,
    title: "Departmental Academic Seminar",
    description:
      "Students are invited to participate in the upcoming departmental academic seminar.",
    category: "Events",
    priority: "Normal",
    author: "Department Administration",
    date: "Nov 10, 2026",
    time: "9:00 AM",
    pinned: false,
    content: [
      "The department will be hosting an academic seminar for students.",
      "More information about the venue and programme will be communicated."
    ],
  },
  {
    id: 4,
    title: "Updated Course Materials Available",
    description:
      "New lecture notes and additional learning resources have been uploaded to the student portal.",
    category: "Academic",
    priority: "Normal",
    author: "Course Lecturers",
    date: "Nov 8, 2026",
    time: "11:15 AM",
    pinned: false,
    content: [
      "New learning materials have been added to the portal.",
      "Visit the Learning Materials section to access the available resources."
    ],
  },
  {
    id: 5,
    title: "Departmental Students' Meeting",
    description:
      "A general meeting will be held to discuss academic activities and student matters.",
    category: "General",
    priority: "Normal",
    author: "Departmental Association",
    date: "Nov 5, 2026",
    time: "1:00 PM",
    pinned: false,
    content: [
      "All departmental students are encouraged to attend.",
      "The meeting agenda will cover academic updates and departmental activities."
    ],
  },
];

const categories = [
  "All",
  "Academic",
  "Examinations",
  "Assignments",
  "Events",
  "General",
];

const priorityStyles = {
  Urgent: "bg-[#FCEBE9] text-[#B5473C]",
  Important: "bg-[#FFF3DD] text-[#98651B]",
  Normal: "bg-[#E4F2EF] text-[#176D68]",
};

function AnnouncementCard({ item, onOpen }) {
  const navigate = useNavigate();
  
  return (
    <article className="bg-white rounded-[22px] p-5 sm:p-6 hover:shadow-lg hover:shadow-[#176D68]/5 transition-all">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-3 py-1.5 rounded-full bg-[#F1F5F3] text-[11px] font-semibold text-[#71827C]">
            {item.category}
          </span>

          <span className={`px-3 py-1.5 rounded-full text-[11px] font-semibold ${priorityStyles[item.priority]}`}>
            {item.priority}
          </span>
        </div>

        {item.pinned && (
          <Pin size={17} className="text-[#176D68] shrink-0" />
        )}
      </div>

      <h3 className="text-[17px] font-bold text-[#20302D] mt-5 leading-snug">
        {item.title}
      </h3>

      <p className="text-sm text-[#81918B] mt-3 leading-relaxed">
        {item.description}
      </p>

      <div className="flex flex-wrap items-center justify-between gap-3 mt-6 pt-4">
        <div>
          <p className="text-xs font-semibold text-[#53645E]">
            {item.author}
          </p>
          <p className="flex items-center gap-1.5 text-[11px] text-[#9AA7A1] mt-1">
            <CalendarDays size={12} />
            {item.date}
            <span>·</span>
            <Clock3 size={12} />
            {item.time}
          </p>
        </div>

        <button
          onClick={() => {navigate(`/announcements/${announcement.id}`);}}
          className="flex items-center gap-1.5 text-xs font-bold text-[#176D68] hover:gap-2.5 transition-all"
        >
          Read announcement
          <ChevronRight size={16} />
        </button>
      </div>
    </article>
  );
}

export default function Announcements() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [selected, setSelected] = useState(null);

  const filtered = useMemo(() => {
    return announcements.filter((item) => {
      const query = search.toLowerCase();

      const matchesSearch =
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.author.toLowerCase().includes(query);

      const matchesCategory =
        category === "All" || item.category === category;

      return matchesSearch && matchesCategory;
    }).sort((a, b) => Number(b.pinned) - Number(a.pinned));
  }, [search, category]);

  return (
    <div className="space-y-7 pb-6">

      {/* Header */}
      <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-sm text-[#81918B]">
            Stay informed and updated
          </p>

          <h1 className="text-2xl sm:text-3xl font-bold text-[#20302D] mt-1">
            Announcements
          </h1>

          <p className="text-sm text-[#81918B] mt-2">
            Important updates from your department and lecturers.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#E4F2EF] text-[#176D68] px-4 py-3 rounded-2xl w-fit">
          <Megaphone size={19} />
          <span className="text-sm font-semibold">
            {announcements.length} Updates
          </span>
        </div>
      </section>

      {/* Notice banner */}
      <section className="bg-[#E4F2EF] rounded-[24px] p-5 sm:p-6 flex items-start gap-4">
        <div className="w-11 h-11 rounded-2xl bg-white text-[#176D68] grid place-items-center shrink-0">
          <Bell size={21} />
        </div>

        <div>
          <h2 className="font-bold text-[#20302D]">
            Stay up to date
          </h2>
          <p className="text-sm text-[#53645E] mt-1 leading-relaxed">
            Check this page regularly so you don't miss important
            academic information, deadlines and departmental updates.
          </p>
        </div>
      </section>

      {/* Search */}
      <section className="bg-white rounded-[22px] p-4 sm:p-5 space-y-5">
        <div className="relative">
          <Search
            size={19}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#81918B]"
          />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search announcements..."
            className="w-full h-12 pl-12 pr-4 rounded-full bg-[#F5F8F6] text-sm outline-none focus:ring-2 focus:ring-[#176D68]/20"
          />
        </div>

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
      </section>

      {/* Results */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-[#20302D]">
              Latest Updates
            </h2>
            <p className="text-xs text-[#81918B] mt-1">
              {filtered.length} announcements found
            </p>
          </div>

          <button
            onClick={() => {
              setSearch("");
              setCategory("All");
            }}
            className="text-xs font-semibold text-[#176D68]"
          >
            Reset filters
          </button>
        </div>

        {filtered.length > 0 ? (
          <div className="space-y-4">
            {filtered.map((item) => (
              <AnnouncementCard
                key={item.id}
                item={item}
                onOpen={setSelected}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-[24px] p-10 text-center">
            <Megaphone size={28} className="mx-auto text-[#81918B]" />
            <h3 className="font-bold text-[#20302D] mt-4">
              No announcements found
            </h3>
            <p className="text-sm text-[#81918B] mt-2">
              Try changing your search or category.
            </p>
          </div>
        )}
      </section>

      {/* Announcement details */}
      {selected && (
        <div
          className="fixed inset-0 z-[100] bg-[#152522]/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-5"
          onClick={() => setSelected(null)}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="announcement-title"
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full max-w-xl max-h-[85vh] overflow-y-auto rounded-t-[26px] sm:rounded-[26px] p-6"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#176D68]">
                {selected.category}
              </span>

              <button
                onClick={() => setSelected(null)}
                className="w-9 h-9 rounded-full bg-[#F1F5F3] grid place-items-center text-[#53645E]"
                aria-label="Close announcement"
              >
                <X size={18} />
              </button>
            </div>

            <h2
              id="announcement-title"
              className="text-xl sm:text-2xl font-bold text-[#20302D] mt-5"
            >
              {selected.title}
            </h2>

            <div className="flex flex-wrap items-center gap-3 mt-4 text-xs text-[#81918B]">
              <span>{selected.author}</span>
              <span>·</span>
              <span>{selected.date}</span>
            </div>

            <div className="mt-6 space-y-4">
              {selected.content.map((paragraph, index) => (
                <p
                  key={index}
                  className="text-sm text-[#53645E] leading-7"
                >
                  {paragraph}
                </p>
              ))}
            </div>

            <button
              onClick={() => setSelected(null)}
              className="w-full mt-8 py-3 rounded-full bg-[#176D68] text-white font-semibold text-sm"
            >
              Close announcement
            </button>
          </section>
        </div>
      )}
    </div>
  );
}
