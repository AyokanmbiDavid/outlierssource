
import React, { useState } from "react";
import { Award, Search, Download, Eye, X, CalendarDays, ShieldCheck } from "lucide-react";

const certificates = [
  { id: "OS-001", title: "Introduction to Computer Science", issuer: "OutliersSource", date: "November 10, 2026", category: "Academic", status: "Completed" },
  { id: "OS-002", title: "JavaScript Fundamentals", issuer: "OutliersSource", date: "October 24, 2026", category: "Programming", status: "Completed" },
  { id: "OS-003", title: "Academic Excellence", issuer: "OutliersSource", date: "September 15, 2026", category: "Achievement", status: "Completed" },
  { id: "OS-004", title: "Database Fundamentals", issuer: "OutliersSource", date: "Pending", category: "Programming", status: "In Progress" }
];

export default function Certifications() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [selected, setSelected] = useState(null);

  const filtered = certificates.filter(item =>
    (filter === "All" || item.status === filter) &&
    item.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-7">
      <div>
        <p className="text-sm text-[#81918B]">Learning achievements</p>
        <h1 className="text-2xl font-bold text-[#20302D] mt-1">My Certifications</h1>
        <p className="text-sm text-[#81918B] mt-2">View your learning achievements and completed certificates.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          ["Total Certificates", certificates.length],
          ["Completed", certificates.filter(c => c.status === "Completed").length],
          ["In Progress", certificates.filter(c => c.status === "In Progress").length]
        ].map(([label, value]) => (
          <div key={label} className="bg-white rounded-2xl p-5">
            <p className="text-sm text-[#81918B]">{label}</p>
            <h2 className="text-3xl font-bold text-[#176D68] mt-2">{value}</h2>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-4 flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2 flex-1 bg-[#F5F8F6] rounded-xl px-3">
          <Search size={18} className="text-[#81918B]" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search certificates..." className="bg-transparent outline-none py-3 w-full text-sm" />
        </div>
        <select value={filter} onChange={e => setFilter(e.target.value)} className="bg-[#F5F8F6] rounded-xl px-4 py-3 text-sm outline-none">
          <option>All</option>
          <option>Completed</option>
          <option>In Progress</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(item => (
          <div key={item.id} className="bg-white rounded-2xl p-5 flex gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#E4F2EF] text-[#176D68] flex items-center justify-center shrink-0">
              <Award size={27} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between gap-2">
                <span className="text-xs text-[#81918B]">{item.category}</span>
                <span className={`text-xs rounded-full px-3 py-1 ${item.status === "Completed" ? "bg-[#E4F2EF] text-[#176D68]" : "bg-amber-50 text-amber-700"}`}>{item.status}</span>
              </div>
              <h3 className="font-semibold text-[#20302D] mt-2">{item.title}</h3>
              <p className="text-xs text-[#81918B] mt-2">{item.issuer} · {item.date}</p>
              <button onClick={() => setSelected(item)} className="mt-4 text-sm font-semibold text-[#176D68] flex items-center gap-2">
                <Eye size={16} /> View details
              </button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && <p className="text-center text-sm text-[#81918B] py-10">No certificates found.</p>}

      {selected && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center">
              <h2 className="font-bold text-lg">Certificate Details</h2>
              <button onClick={() => setSelected(null)}><X /></button>
            </div>
            <div className="text-center py-7">
              <div className="w-20 h-20 rounded-full bg-[#E4F2EF] text-[#176D68] mx-auto flex items-center justify-center"><Award size={40} /></div>
              <h3 className="font-bold text-xl mt-4">{selected.title}</h3>
              <p className="text-sm text-[#81918B] mt-2">Issued by {selected.issuer}</p>
            </div>
            <div className="space-y-3 text-sm">
              <p>Credential ID: <b>{selected.id}</b></p>
              <p>Issue date: <b>{selected.date}</b></p>
              <p>Status: <b>{selected.status}</b></p>
            </div>
            <p className="text-xs text-[#81918B] mt-5">Demo certificate record. Official certificate files and verification will be connected later.</p>
            <button onClick={() => setSelected(null)} className="w-full mt-5 bg-[#176D68] text-white rounded-xl py-3">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
