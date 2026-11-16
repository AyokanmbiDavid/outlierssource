
import React, { useState } from "react";
import { Megaphone, Plus, Search, Pencil, Trash2, Pin, X, Eye, CalendarDays } from "lucide-react";

const initial = [
  { id: 1, title: "Registration for First Semester", category: "Academic", priority: "High", audience: "All Students", date: "November 14, 2026", status: "Published", pinned: true, content: "First semester registration is now open. Students are advised to complete their registration before the deadline." },
  { id: 2, title: "Upcoming Departmental Seminar", category: "Events", priority: "Normal", audience: "200 Level", date: "November 16, 2026", status: "Published", pinned: false, content: "The department will be hosting a seminar on modern technology and innovation." },
  { id: 3, title: "Updated Lecture Timetable", category: "Academic", priority: "High", audience: "All Students", date: "November 18, 2026", status: "Draft", pinned: false, content: "Please check the updated lecture timetable." }
];

const blank = { title: "", category: "Academic", priority: "Normal", audience: "All Students", date: "", status: "Draft", pinned: false, content: "" };

export default function ManageAnnouncements() {
  const [items, setItems] = useState(initial);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [modal, setModal] = useState("");
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(blank);

  const filtered = items.filter(a =>
    (a.title+a.content).toLowerCase().includes(search.toLowerCase()) &&
    (filter==="All"||a.status===filter)
  );

  const openForm = item => {
    setSelected(item || null);
    setForm(item ? {...item} : {...blank,date:new Date().toISOString().slice(0,10)});
    setModal("form");
  };

  const save = e => {
    e.preventDefault();
    const formatted = {...form,date:form.date ? new Date(form.date+"T12:00:00").toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"}) : ""};
    if(selected) setItems(p=>p.map(a=>a.id===selected.id?{...formatted,id:a.id}:a));
    else setItems(p=>[{...formatted,id:Date.now()},...p]);
    setModal("");
  };

  const remove = id => {
    if(window.confirm("Delete this announcement?")) setItems(p=>p.filter(a=>a.id!==id));
  };

  const togglePin = id => setItems(p=>p.map(a=>a.id===id?{...a,pinned:!a.pinned}:a));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div><p className="text-sm text-[#81918B]">Administration / Announcements</p><h1 className="text-3xl font-bold text-[#20302D] mt-1">Manage Announcements</h1><p className="text-sm text-[#81918B] mt-2">Keep students informed about departmental updates.</p></div>
        <button onClick={()=>openForm()} className="bg-[#176D68] text-white rounded-xl px-5 py-3 flex justify-center items-center gap-2 text-sm font-semibold"><Plus size={18}/> Create Announcement</button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[["Total",items.length],["Published",items.filter(a=>a.status==="Published").length],["Drafts",items.filter(a=>a.status==="Draft").length],["Pinned",items.filter(a=>a.pinned).length]].map(([label,value])=><div key={label} className="bg-white rounded-2xl p-5"><Megaphone className="text-[#176D68]"/><p className="text-sm text-[#81918B] mt-3">{label}</p><h2 className="text-2xl font-bold mt-1">{value}</h2></div>)}
      </div>

      <div className="bg-white rounded-2xl p-4 flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2 flex-1 bg-[#F5F8F6] rounded-xl px-3"><Search size={18} className="text-[#81918B]"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search announcements..." className="bg-transparent py-3 outline-none w-full text-sm"/></div>
        <select value={filter} onChange={e=>setFilter(e.target.value)} className="bg-[#F5F8F6] rounded-xl px-4 py-3 text-sm outline-none"><option>All</option><option>Published</option><option>Draft</option></select>
      </div>

      <div className="space-y-3">
        {filtered.map(item=><article key={item.id} className="bg-white rounded-2xl p-5">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-[#E4F2EF] text-[#176D68] flex items-center justify-center shrink-0"><Megaphone/></div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap gap-2 items-center">
                {item.pinned&&<span className="text-xs text-[#176D68] flex items-center gap-1"><Pin size={13}/> Pinned</span>}
                <span className={`text-xs px-2.5 py-1 rounded-full ${item.status==="Published"?"bg-[#E4F2EF] text-[#176D68]":"bg-amber-50 text-amber-700"}`}>{item.status}</span>
                <span className="text-xs text-[#81918B]">{item.category}</span>
                {item.priority==="High"&&<span className="text-xs bg-red-50 text-red-600 px-2.5 py-1 rounded-full">High priority</span>}
              </div>
              <h3 className="font-bold text-[#20302D] mt-3">{item.title}</h3>
              <p className="text-sm text-[#71827C] mt-2 line-clamp-2">{item.content}</p>
              <p className="text-xs text-[#81918B] mt-3 flex items-center gap-2"><CalendarDays size={14}/>{item.date} · {item.audience}</p>
            </div>
            <div className="flex gap-4 items-center">
              <button onClick={()=>togglePin(item.id)} title="Toggle pin" className={item.pinned?"text-[#176D68]":"text-[#81918B]"}><Pin size={17}/></button>
              <button onClick={()=>{setSelected(item);setModal("view");}} title="Preview" className="text-[#176D68]"><Eye size={17}/></button>
              <button onClick={()=>openForm(item)} title="Edit" className="text-[#71827C]"><Pencil size={17}/></button>
              <button onClick={()=>remove(item.id)} title="Delete" className="text-red-500"><Trash2 size={17}/></button>
            </div>
          </div>
        </article>)}
        {filtered.length===0&&<div className="bg-white rounded-2xl p-12 text-center text-sm text-[#81918B]">No announcements found.</div>}
      </div>

      {modal==="form"&&<div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-3">
        <form onSubmit={save} className="bg-white rounded-3xl p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto space-y-4">
          <div className="flex justify-between"><div><h2 className="text-xl font-bold">{selected?"Edit Announcement":"New Announcement"}</h2><p className="text-xs text-[#81918B] mt-1">Write and publish a departmental update.</p></div><button type="button" onClick={()=>setModal("")}><X/></button></div>
          <label className="block text-sm font-semibold">Announcement Title<input required value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))} className="mt-2 w-full bg-[#F5F8F6] rounded-xl p-3 outline-none font-normal"/></label>
          <div className="grid sm:grid-cols-2 gap-3">
            <label className="text-sm font-semibold">Category<select value={form.category} onChange={e=>setForm(p=>({...p,category:e.target.value}))} className="mt-2 w-full bg-[#F5F8F6] rounded-xl p-3 outline-none font-normal">{["Academic","Events","General","Examination","Notice"].map(x=><option key={x}>{x}</option>)}</select></label>
            <label className="text-sm font-semibold">Priority<select value={form.priority} onChange={e=>setForm(p=>({...p,priority:e.target.value}))} className="mt-2 w-full bg-[#F5F8F6] rounded-xl p-3 outline-none font-normal"><option>Normal</option><option>High</option></select></label>
            <label className="text-sm font-semibold">Audience<select value={form.audience} onChange={e=>setForm(p=>({...p,audience:e.target.value}))} className="mt-2 w-full bg-[#F5F8F6] rounded-xl p-3 outline-none font-normal">{["All Students","100 Level","200 Level","300 Level","400 Level","Lecturers"].map(x=><option key={x}>{x}</option>)}</select></label>
            <label className="text-sm font-semibold">Publication Date<input required type="date" value={form.date} onChange={e=>setForm(p=>({...p,date:e.target.value}))} className="mt-2 w-full bg-[#F5F8F6] rounded-xl p-3 outline-none font-normal"/></label>
          </div>
          <label className="block text-sm font-semibold">Announcement Content<textarea required rows={6} value={form.content} onChange={e=>setForm(p=>({...p,content:e.target.value}))} className="mt-2 w-full bg-[#F5F8F6] rounded-xl p-3 outline-none font-normal resize-y"/></label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.pinned} onChange={e=>setForm(p=>({...p,pinned:e.target.checked}))}/> Pin this announcement</label>
          <label className="block text-sm font-semibold">Status<select value={form.status} onChange={e=>setForm(p=>({...p,status:e.target.value}))} className="mt-2 w-full bg-[#F5F8F6] rounded-xl p-3 outline-none font-normal"><option>Draft</option><option>Published</option></select></label>
          <div className="flex gap-3"><button type="button" onClick={()=>setModal("")} className="flex-1 bg-[#F1F5F3] rounded-xl py-3">Cancel</button><button className="flex-1 bg-[#176D68] text-white rounded-xl py-3 font-semibold">Save Announcement</button></div>
        </form>
      </div>}

      {modal==="view"&&selected&&<div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-3"><div className="bg-white rounded-3xl p-6 w-full max-w-lg"><div className="flex justify-between"><h2 className="text-xl font-bold">Announcement Preview</h2><button onClick={()=>setModal("")}><X/></button></div><p className="text-xs text-[#176D68] mt-5">{selected.category} · {selected.date}</p><h3 className="text-2xl font-bold text-[#20302D] mt-2">{selected.title}</h3><p className="text-sm text-[#71827C] mt-4 whitespace-pre-wrap">{selected.content}</p><div className="bg-[#F5F8F6] rounded-xl p-3 mt-5 text-xs text-[#71827C]">Audience: {selected.audience} · Priority: {selected.priority}</div><button onClick={()=>setModal("")} className="w-full bg-[#176D68] text-white rounded-xl py-3 mt-5">Close Preview</button></div></div>}
    </div>
  );
}
