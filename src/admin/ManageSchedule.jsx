
import React, { useState } from "react";
import { CalendarDays, Plus, Search, Pencil, Trash2, X, Clock, MapPin, BookOpen } from "lucide-react";

const initial = [
  { id: 1, title: "COS101 Lecture", course: "COS101", type: "Lecture", date: "2026-11-16", start: "09:00", end: "11:00", venue: "Computer Lab 1", lecturer: "Dr. Samuel Ade" },
  { id: 2, title: "Programming Practical", course: "COS103", type: "Practical", date: "2026-11-17", start: "12:00", end: "14:00", venue: "ICT Laboratory", lecturer: "Mr. David James" },
  { id: 3, title: "Departmental Seminar", course: "General", type: "Event", date: "2026-11-19", start: "10:00", end: "13:00", venue: "Main Auditorium", lecturer: "Department Office" },
  { id: 4, title: "MTH101 Lecture", course: "MTH101", type: "Lecture", date: "2026-11-20", start: "08:00", end: "10:00", venue: "Lecture Hall B", lecturer: "Mrs. Grace Bello" }
];

const blank = { title: "", course: "COS101", type: "Lecture", date: "", start: "09:00", end: "10:00", venue: "", lecturer: "" };

export default function ManageSchedule() {
  const [events, setEvents] = useState(initial);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(blank);
  const [error, setError] = useState("");

  const filtered = events.filter(e =>
    (e.title+e.course+e.venue+e.lecturer).toLowerCase().includes(search.toLowerCase()) &&
    (filter==="All"||e.type===filter)
  ).sort((a,b)=>a.date.localeCompare(b.date)||a.start.localeCompare(b.start));

  const openForm = item => {
    setEditing(item||null);
    setForm(item?{...item}:{...blank,date:new Date().toISOString().slice(0,10)});
    setError("");
    setModal(true);
  };

  const save = e => {
    e.preventDefault();
    if(form.end<=form.start){setError("End time must be later than start time.");return;}
    if(editing) setEvents(p=>p.map(x=>x.id===editing.id?{...form,id:x.id}:x));
    else setEvents(p=>[...p,{...form,id:Date.now()}]);
    setModal(false);
  };

  const remove = id => {
    if(window.confirm("Delete this schedule event?")) setEvents(p=>p.filter(e=>e.id!==id));
  };

  const formatDate = date => new Date(date+"T12:00:00").toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric",year:"numeric"});

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div><p className="text-sm text-[#81918B]">Administration / Schedule</p><h1 className="text-3xl font-bold text-[#20302D] mt-1">Manage Schedule</h1><p className="text-sm text-[#81918B] mt-2">Organise lectures, practicals and departmental events.</p></div>
        <button onClick={()=>openForm()} className="bg-[#176D68] text-white rounded-xl px-5 py-3 flex justify-center items-center gap-2 text-sm font-semibold"><Plus size={18}/> Add Event</button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {[["Total Events",events.length],["Lectures",events.filter(e=>e.type==="Lecture").length],["Other Events",events.filter(e=>e.type!=="Lecture").length]].map(([label,value])=><div key={label} className="bg-white rounded-2xl p-5"><CalendarDays className="text-[#176D68]"/><p className="text-sm text-[#81918B] mt-3">{label}</p><h2 className="text-2xl font-bold mt-1">{value}</h2></div>)}
      </div>

      <div className="bg-white rounded-2xl p-4 flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2 flex-1 bg-[#F5F8F6] rounded-xl px-3"><Search size={18} className="text-[#81918B]"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search events, courses or venues..." className="bg-transparent py-3 outline-none w-full text-sm"/></div>
        <select value={filter} onChange={e=>setFilter(e.target.value)} className="bg-[#F5F8F6] rounded-xl px-4 py-3 text-sm outline-none"><option>All</option><option>Lecture</option><option>Practical</option><option>Exam</option><option>Event</option></select>
      </div>

      <div className="bg-white rounded-2xl p-5">
        <h2 className="font-bold text-[#20302D] mb-4">Scheduled Activities</h2>
        <div className="space-y-3">
          {filtered.map(event=><div key={event.id} className="rounded-2xl bg-[#F5F8F6] p-4 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-white text-[#176D68] flex flex-col items-center justify-center shrink-0"><span className="text-xs">{new Date(event.date+"T12:00:00").toLocaleDateString("en-US",{month:"short"})}</span><b className="text-xl">{new Date(event.date+"T12:00:00").getDate()}</b></div>
            <div className="flex-1 min-w-0"><div className="flex flex-wrap gap-2 items-center"><span className="text-xs bg-[#E4F2EF] text-[#176D68] rounded-full px-3 py-1">{event.type}</span><span className="text-xs text-[#81918B]">{event.course}</span></div><h3 className="font-bold text-[#20302D] mt-2">{event.title}</h3><div className="flex flex-wrap gap-x-4 gap-y-2 mt-2 text-xs text-[#71827C]"><span className="flex items-center gap-1"><Clock size={13}/>{event.start} – {event.end}</span><span className="flex items-center gap-1"><MapPin size={13}/>{event.venue}</span><span>{event.lecturer}</span></div><p className="text-xs text-[#81918B] mt-2">{formatDate(event.date)}</p></div>
            <div className="flex gap-4"><button onClick={()=>openForm(event)} className="text-[#176D68]"><Pencil size={17}/></button><button onClick={()=>remove(event.id)} className="text-red-500"><Trash2 size={17}/></button></div>
          </div>)}
          {filtered.length===0&&<p className="text-center py-10 text-sm text-[#81918B]">No schedule events found.</p>}
        </div>
      </div>

      {modal&&<div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-3">
        <form onSubmit={save} className="bg-white rounded-3xl p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto space-y-4">
          <div className="flex justify-between"><div><h2 className="text-xl font-bold">{editing?"Edit Schedule":"Create Schedule Event"}</h2><p className="text-xs text-[#81918B] mt-1">Enter the event details.</p></div><button type="button" onClick={()=>setModal(false)}><X/></button></div>
          <label className="block text-sm font-semibold">Event Title<input required value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))} className="mt-2 w-full bg-[#F5F8F6] rounded-xl p-3 outline-none font-normal"/></label>
          <div className="grid sm:grid-cols-2 gap-3">
            <label className="text-sm font-semibold">Course<select value={form.course} onChange={e=>setForm(p=>({...p,course:e.target.value}))} className="mt-2 w-full bg-[#F5F8F6] rounded-xl p-3 outline-none font-normal">{["COS101","COS103","COS201","MTH101","STA101","GST111","General"].map(x=><option key={x}>{x}</option>)}</select></label>
            <label className="text-sm font-semibold">Event Type<select value={form.type} onChange={e=>setForm(p=>({...p,type:e.target.value}))} className="mt-2 w-full bg-[#F5F8F6] rounded-xl p-3 outline-none font-normal">{["Lecture","Practical","Exam","Event"].map(x=><option key={x}>{x}</option>)}</select></label>
            <label className="text-sm font-semibold">Date<input required type="date" value={form.date} onChange={e=>setForm(p=>({...p,date:e.target.value}))} className="mt-2 w-full bg-[#F5F8F6] rounded-xl p-3 outline-none font-normal"/></label>
            <label className="text-sm font-semibold">Venue<input required value={form.venue} onChange={e=>setForm(p=>({...p,venue:e.target.value}))} className="mt-2 w-full bg-[#F5F8F6] rounded-xl p-3 outline-none font-normal"/></label>
            <label className="text-sm font-semibold">Start Time<input required type="time" value={form.start} onChange={e=>setForm(p=>({...p,start:e.target.value}))} className="mt-2 w-full bg-[#F5F8F6] rounded-xl p-3 outline-none font-normal"/></label>
            <label className="text-sm font-semibold">End Time<input required type="time" value={form.end} onChange={e=>setForm(p=>({...p,end:e.target.value}))} className="mt-2 w-full bg-[#F5F8F6] rounded-xl p-3 outline-none font-normal"/></label>
          </div>
          <label className="block text-sm font-semibold">Lecturer / Coordinator<input required value={form.lecturer} onChange={e=>setForm(p=>({...p,lecturer:e.target.value}))} className="mt-2 w-full bg-[#F5F8F6] rounded-xl p-3 outline-none font-normal"/></label>
          {error&&<p className="text-sm text-red-500">{error}</p>}
          <div className="flex gap-3"><button type="button" onClick={()=>setModal(false)} className="flex-1 bg-[#F1F5F3] rounded-xl py-3">Cancel</button><button className="flex-1 bg-[#176D68] text-white rounded-xl py-3 font-semibold">Save Event</button></div>
        </form>
      </div>}
    </div>
  );
}
