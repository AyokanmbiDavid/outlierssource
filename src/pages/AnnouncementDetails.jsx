
import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CalendarDays, User, Pin } from "lucide-react";

const announcements = {
  1: { title: "First Semester Examination Timetable", category: "Examinations", priority: "Important", author: "Department Administration", date: "November 10, 2026", pinned: true, body: "Students are advised to prepare for the upcoming first semester examinations. The official examination timetable will be published by the department. Please check this page regularly for updates." },
  2: { title: "Submission Deadline for Assignments", category: "Assignments", priority: "Urgent", author: "Academic Office", date: "November 8, 2026", pinned: true, body: "Students are reminded to submit their outstanding assignments before the announced deadline. Please confirm submission requirements with your course lecturers." },
  3: { title: "Departmental Academic Seminar", category: "Events", priority: "Normal", author: "Department Administration", date: "November 6, 2026", pinned: false, body: "The department plans to host an academic seminar. Students are encouraged to participate and engage with the topics being discussed." },
  4: { title: "Updated Course Materials Available", category: "Academic", priority: "Normal", author: "Academic Support", date: "November 4, 2026", pinned: false, body: "Updated learning materials have been added to the student portal. Visit the Materials section to explore the available resources." },
  5: { title: "Departmental Students' Meeting", category: "General", priority: "Normal", author: "Student Representatives", date: "November 2, 2026", pinned: false, body: "Students are invited to attend the departmental meeting. Further information about the venue and agenda will be shared by the student representatives." }
};

export default function AnnouncementDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const announcement = announcements[id];

  if (!announcement) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center">
        <h2 className="font-bold text-xl">Announcement not found</h2>
        <button onClick={() => navigate("/announcements")} className="mt-4 text-[#176D68] font-semibold">Back to announcements</button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      <button onClick={() => navigate("/announcements")} className="flex items-center gap-2 text-sm font-semibold text-[#176D68]"><ArrowLeft size={18} /> Back to announcements</button>

      <article className="bg-white rounded-3xl p-6 sm:p-9">
        <div className="flex flex-wrap items-center gap-2">
          <span className="bg-[#E4F2EF] text-[#176D68] px-3 py-1 rounded-full text-xs font-semibold">{announcement.category}</span>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${announcement.priority === "Urgent" ? "bg-orange-50 text-orange-700" : "bg-[#F1F5F3] text-[#71827C]"}`}>{announcement.priority}</span>
          {announcement.pinned && <span className="text-xs text-[#176D68] flex items-center gap-1"><Pin size={13} /> Pinned</span>}
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-[#20302D] mt-6 leading-tight">{announcement.title}</h1>

        <div className="flex flex-wrap gap-5 text-sm text-[#81918B] mt-5 pb-6">
          <span className="flex items-center gap-2"><User size={16} /> {announcement.author}</span>
          <span className="flex items-center gap-2"><CalendarDays size={16} /> {announcement.date}</span>
        </div>

        <div className="border-t border-[#EDF1EF] pt-6">
          <p className="text-[#52645E] text-sm sm:text-base leading-8 whitespace-pre-line">{announcement.body}</p>
        </div>

        <div className="bg-[#F5F8F6] rounded-2xl p-4 mt-8">
          <p className="text-xs text-[#81918B]">Published announcement · Demo content</p>
          <p className="text-sm text-[#52645E] mt-1">Official announcements will be managed by the department administrator.</p>
        </div>
      </article>
    </div>
  );
}
