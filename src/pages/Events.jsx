
import React, { useState } from "react";
import { CalendarDays, MapPin, Clock, Search } from "lucide-react";

const events = [
  { id: 1, title: "Departmental Academic Seminar", date: "November 20, 2026", time: "10:00 AM", location: "Main Auditorium", type: "Academic", description: "An academic seminar featuring discussions on technology, research and innovation." },
  { id: 2, title: "Freshers Orientation", date: "November 24, 2026", time: "9:00 AM", location: "Faculty Hall", type: "Campus", description: "An orientation programme introducing new students to departmental activities." },
  { id: 3, title: "Programming Workshop", date: "November 28, 2026", time: "12:00 PM", location: "Computer Laboratory", type: "Workshop", description: "A practical introduction to programming concepts and problem solving." },
  { id: 4, title: "Departmental Students Meeting", date: "December 2, 2026", time: "11:00 AM", location: "Lecture Theatre", type: "Meeting", description: "A departmental meeting for students and representatives." }
];

export default function Events() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("All");

  const filtered = events.filter(event =>
    (filter === "All" || event.type === filter) &&
    event.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-7">
      <div>
        <p className="text-sm text-[#81918B]">Campus activities</p>
        <h1 className="text-2xl font-bold text-[#20302D] mt-1">Events</h1>
        <p className="text-sm text-[#81918B] mt-2">Discover upcoming departmental and academic events.</p>
      </div>

      <div className="bg-[#E4F2EF] rounded-3xl p-6 sm:p-8">
        <div className="flex items-center gap-3 text-[#176D68]">
          <CalendarDays size={25} />
          <span className="font-semibold">Stay connected</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-[#20302D] mt-4">Make the most of your campus experience.</h2>
        <p className="text-sm text-[#71827C] mt-2 max-w-xl">Keep track of academic programmes, workshops, seminars and student activities.</p>
      </div>

      <div className="bg-white rounded-2xl p-4 flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2 bg-[#F5F8F6] rounded-xl px-3 flex-1">
          <Search size={18} className="text-[#81918B]" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search events..." className="bg-transparent outline-none py-3 w-full text-sm" />
        </div>
        <select value={filter} onChange={e => setFilter(e.target.value)} className="bg-[#F5F8F6] rounded-xl px-4 py-3 text-sm outline-none">
          <option>All</option>
          <option>Academic</option>
          <option>Campus</option>
          <option>Workshop</option>
          <option>Meeting</option>
        </select>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {filtered.map(event => (
          <button key={event.id} onClick={() => setSelected(event)} className="bg-white rounded-2xl p-5 text-left hover:bg-[#F9FBFA] transition">
            <span className="text-xs bg-[#E4F2EF] text-[#176D68] px-3 py-1 rounded-full">{event.type}</span>
            <h3 className="font-bold text-[#20302D] mt-4">{event.title}</h3>
            <div className="space-y-2 mt-4 text-sm text-[#81918B]">
              <p className="flex items-center gap-2"><CalendarDays size={16} /> {event.date}</p>
              <p className="flex items-center gap-2"><Clock size={16} /> {event.time}</p>
              <p className="flex items-center gap-2"><MapPin size={16} /> {event.location}</p>
            </div>
            <p className="text-sm text-[#176D68] font-semibold mt-5">View event details →</p>
          </button>
        ))}
      </div>

      {filtered.length === 0 && <p className="text-center py-10 text-sm text-[#81918B]">No events found.</p>}

      {selected && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full">
            <span className="text-xs text-[#176D68]">{selected.type}</span>
            <h2 className="text-xl font-bold mt-2">{selected.title}</h2>
            <p className="text-sm text-[#71827C] mt-4">{selected.description}</p>
            <div className="space-y-3 mt-5 text-sm text-[#52645E]">
              <p className="flex gap-2"><CalendarDays size={17} /> {selected.date}</p>
              <p className="flex gap-2"><Clock size={17} /> {selected.time}</p>
              <p className="flex gap-2"><MapPin size={17} /> {selected.location}</p>
            </div>
            <button onClick={() => setSelected(null)} className="w-full mt-6 py-3 rounded-xl bg-[#176D68] text-white">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
