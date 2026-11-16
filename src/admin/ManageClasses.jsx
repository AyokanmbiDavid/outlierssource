
import React, { useState } from "react";
import { BookOpen, Plus, Search, Eye, Pencil, Trash2, X, Users, Layers, GraduationCap } from "lucide-react";

const initialClasses = [
  { id: 1, code: "COS101", title: "Introduction to Computer Science", lecturer: "Dr. Samuel Ade", level: "100 Level", semester: "First Semester", students: 120, status: "Active", modules: [{ title: "Introduction to Computing", lessons: ["History of Computing", "Computer Generations"] }, { title: "Computer Systems", lessons: ["Hardware", "Software"] }] },
  { id: 2, code: "COS103", title: "Basic Programming Concepts", lecturer: "Mr. David James", level: "100 Level", semester: "First Semester", students: 98, status: "Active", modules: [{ title: "Programming Fundamentals", lessons: ["Introduction to Programming", "Variables"] }] },
  { id: 3, code: "COS201", title: "Data Structures", lecturer: "Dr. Grace Okafor", level: "200 Level", semester: "Second Semester", students: 85, status: "Active", modules: [{ title: "Data Structures", lessons: ["Arrays", "Linked Lists"] }] },
  { id: 4, code: "COS301", title: "Database Management Systems", lecturer: "Mr. John Peters", level: "300 Level", semester: "First Semester", students: 65, status: "Archived", modules: [] }
];

const empty = { code: "", title: "", lecturer: "", level: "100 Level", semester: "First Semester", status: "Active", modules: [] };

export default function ManageClasses() {
  const [classes, setClasses] = useState(initialClasses);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [modal, setModal] = useState("");
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(empty);
  const [moduleTitle, setModuleTitle] = useState("");
  const [lessonInputs, setLessonInputs] = useState({});
  const [error, setError] = useState("");

  const visible = classes.filter(c =>
    (c.title + c.code + c.lecturer).toLowerCase().includes(search.toLowerCase()) &&
    (filter === "All" || c.status === filter)
  );

  const openForm = (item = null) => {
    setSelected(item);
    setForm(item ? { ...item, modules: item.modules.map(m => ({ ...m, lessons: [...m.lessons] })) } : { ...empty, modules: [] });
    setError("");
    setModal("form");
  };

  const addModule = () => {
    if (!moduleTitle.trim()) return;
    setForm(p => ({ ...p, modules: [...p.modules, { title: moduleTitle.trim(), lessons: [] }] }));
    setModuleTitle("");
  };

  const addLesson = index => {
    const value = lessonInputs[index]?.trim();
    if (!value) return;
    setForm(p => ({
      ...p,
      modules: p.modules.map((m, i) => i === index ? { ...m, lessons: [...m.lessons, value] } : m)
    }));
    setLessonInputs(p => ({ ...p, [index]: "" }));
  };

  const save = e => {
    e.preventDefault();
    if (classes.some(c => c.code.toLowerCase() === form.code.trim().toLowerCase() && c.id !== selected?.id)) {
      setError("This course code already exists.");
      return;
    }
    if (selected) setClasses(p => p.map(c => c.id === selected.id ? { ...form, id: c.id } : c));
    else setClasses(p => [{ ...form, id: Date.now(), students: 0 }, ...p]);
    setModal("");
  };

  const remove = id => {
    if (window.confirm("Delete this course?")) setClasses(p => p.filter(c => c.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <p className="text-sm text-[#81918B]">Administration / Classes</p>
          <h1 className="text-3xl font-bold text-[#20302D] mt-1">Manage Classes</h1>
          <p className="text-sm text-[#81918B] mt-2">Create courses and organise their learning content.</p>
        </div>
        <button onClick={() => openForm()} className="bg-[#176D68] text-white rounded-xl px-5 py-3 flex items-center justify-center gap-2 text-sm font-semibold"><Plus size={18}/> Create Course</button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[["Total Courses", classes.length, BookOpen], ["Active Courses", classes.filter(c => c.status === "Active").length, GraduationCap], ["Total Students", classes.reduce((a,c) => a+c.students,0), Users], ["Modules", classes.reduce((a,c) => a+c.modules.length,0), Layers]].map(([label,value,Icon]) => (
          <div key={label} className="bg-white rounded-2xl p-5">
            <Icon className="text-[#176D68]" size={22}/>
            <p className="text-sm text-[#81918B] mt-3">{label}</p>
            <h2 className="text-2xl font-bold text-[#20302D] mt-1">{value}</h2>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-4 flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2 bg-[#F5F8F6] rounded-xl px-3 flex-1">
          <Search size={18} className="text-[#81918B]"/>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search courses, codes or lecturers..." className="bg-transparent py-3 outline-none w-full text-sm"/>
        </div>
        <select value={filter} onChange={e => setFilter(e.target.value)} className="bg-[#F5F8F6] rounded-xl px-4 py-3 text-sm outline-none">
          <option>All</option><option>Active</option><option>Archived</option>
        </select>
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {visible.map(course => (
          <div key={course.id} className="bg-white rounded-2xl p-5 space-y-4">
            <div className="flex justify-between items-start">
              <div className="w-11 h-11 rounded-xl bg-[#E4F2EF] text-[#176D68] flex items-center justify-center"><BookOpen/></div>
              <span className={`text-xs px-3 py-1 rounded-full ${course.status === "Active" ? "bg-[#E4F2EF] text-[#176D68]" : "bg-gray-100 text-gray-500"}`}>{course.status}</span>
            </div>
            <div>
              <p className="text-xs font-bold text-[#176D68]">{course.code}</p>
              <h3 className="font-bold text-[#20302D] mt-1">{course.title}</h3>
              <p className="text-xs text-[#81918B] mt-2">{course.lecturer}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 bg-[#F5F8F6] rounded-xl p-3 text-xs">
              <div><p className="text-[#81918B]">Level</p><b className="text-[#20302D]">{course.level}</b></div>
              <div><p className="text-[#81918B]">Students</p><b className="text-[#20302D]">{course.students}</b></div>
              <div><p className="text-[#81918B]">Modules</p><b className="text-[#20302D]">{course.modules.length}</b></div>
              <div><p className="text-[#81918B]">Semester</p><b className="text-[#20302D]">{course.semester}</b></div>
            </div>
            <div className="flex items-center justify-between pt-2">
              <button onClick={() => { setSelected(course); setModal("view"); }} className="text-sm text-[#176D68] font-semibold flex items-center gap-1"><Eye size={16}/> Details</button>
              <div className="flex gap-3">
                <button onClick={() => openForm(course)} className="text-[#71827C]"><Pencil size={17}/></button>
                <button onClick={() => remove(course.id)} className="text-red-500"><Trash2 size={17}/></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {visible.length === 0 && <div className="bg-white rounded-2xl p-12 text-center text-[#81918B]">No courses found.</div>}

      {modal === "form" && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-3">
          <form onSubmit={save} className="bg-white rounded-3xl p-6 w-full max-w-2xl max-h-[92vh] overflow-y-auto space-y-4">
            <div className="flex justify-between"><div><h2 className="text-xl font-bold">{selected ? "Edit Course" : "Create Course"}</h2><p className="text-xs text-[#81918B] mt-1">Course information and learning structure</p></div><button type="button" onClick={() => setModal("")}><X/></button></div>
            <div className="grid sm:grid-cols-2 gap-3">
              {[["code","Course Code"],["title","Course Title"],["lecturer","Lecturer"]].map(([key,label]) => <label key={key} className="text-sm font-semibold text-[#52645E]">{label}<input required value={form[key]} onChange={e => setForm(p => ({...p,[key]:e.target.value}))} className="mt-2 w-full bg-[#F5F8F6] rounded-xl p-3 outline-none font-normal"/></label>)}
              <label className="text-sm font-semibold text-[#52645E]">Level<select value={form.level} onChange={e => setForm(p => ({...p,level:e.target.value}))} className="mt-2 w-full bg-[#F5F8F6] rounded-xl p-3 outline-none font-normal">{["100 Level","200 Level","300 Level","400 Level"].map(x => <option key={x}>{x}</option>)}</select></label>
              <label className="text-sm font-semibold text-[#52645E]">Semester<select value={form.semester} onChange={e => setForm(p => ({...p,semester:e.target.value}))} className="mt-2 w-full bg-[#F5F8F6] rounded-xl p-3 outline-none font-normal"><option>First Semester</option><option>Second Semester</option></select></label>
              <label className="text-sm font-semibold text-[#52645E]">Status<select value={form.status} onChange={e => setForm(p => ({...p,status:e.target.value}))} className="mt-2 w-full bg-[#F5F8F6] rounded-xl p-3 outline-none font-normal"><option>Active</option><option>Archived</option></select></label>
            </div>
            <div className="bg-[#F5F8F6] rounded-2xl p-4 space-y-3">
              <h3 className="font-bold text-[#20302D]">Course Modules</h3>
              {form.modules.map((module,i) => <div key={i} className="bg-white rounded-xl p-3 space-y-2">
                <div className="flex justify-between"><b className="text-sm">{i+1}. {module.title}</b><button type="button" onClick={() => setForm(p => ({...p,modules:p.modules.filter((_,n)=>n!==i)}))}><Trash2 size={15} className="text-red-500"/></button></div>
                {module.lessons.map((lesson,j) => <div key={j} className="text-xs text-[#71827C] pl-3">• {lesson}</div>)}
                <div className="flex gap-2"><input value={lessonInputs[i] || ""} onChange={e => setLessonInputs(p => ({...p,[i]:e.target.value}))} placeholder="Add a lesson" className="min-w-0 flex-1 bg-[#F5F8F6] rounded-lg px-3 py-2 text-xs outline-none"/><button type="button" onClick={() => addLesson(i)} className="text-xs font-semibold text-[#176D68]">Add</button></div>
              </div>)}
              <div className="flex gap-2"><input value={moduleTitle} onChange={e => setModuleTitle(e.target.value)} placeholder="New module title" className="min-w-0 flex-1 bg-white rounded-xl px-3 py-3 text-sm outline-none"/><button type="button" onClick={addModule} className="bg-[#176D68] text-white rounded-xl px-4 text-sm">Add Module</button></div>
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="flex gap-3"><button type="button" onClick={() => setModal("")} className="flex-1 bg-[#F1F5F3] rounded-xl py-3">Cancel</button><button className="flex-1 bg-[#176D68] text-white rounded-xl py-3 font-semibold">Save Course</button></div>
          </form>
        </div>
      )}

      {modal === "view" && selected && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-3">
          <div className="bg-white rounded-3xl p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between"><div><p className="text-xs text-[#176D68] font-bold">{selected.code}</p><h2 className="text-xl font-bold mt-1">{selected.title}</h2></div><button onClick={() => setModal("")}><X/></button></div>
            <div className="grid grid-cols-2 gap-3 my-5 text-sm bg-[#F5F8F6] rounded-xl p-4"><p>Lecturer: <b>{selected.lecturer}</b></p><p>Level: <b>{selected.level}</b></p><p>Semester: <b>{selected.semester}</b></p><p>Students: <b>{selected.students}</b></p></div>
            <h3 className="font-bold mb-3">Course Content</h3>
            {selected.modules.length ? selected.modules.map((m,i) => <div key={i} className="bg-[#F5F8F6] rounded-xl p-4 mb-3"><b>{i+1}. {m.title}</b>{m.lessons.map((l,j)=><p key={j} className="text-sm text-[#71827C] mt-2 pl-3">• {l}</p>)}</div>) : <p className="text-sm text-[#81918B]">No modules added yet.</p>}
            <button onClick={() => setModal("")} className="w-full bg-[#176D68] text-white rounded-xl py-3 mt-3">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
