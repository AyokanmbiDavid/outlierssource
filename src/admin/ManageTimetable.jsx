
import React, { useEffect, useMemo, useState } from "react";
import {
  CalendarDays, Plus, Search, Pencil, Trash2, X, Clock,
  MapPin, BookOpen, LoaderCircle, ChevronLeft, ChevronRight,
  CalendarClock, GraduationCap
} from "lucide-react";
import { supabase } from "../services/supabase";
import { useNotifications } from "../context/NotificationContext";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const emptyForm = { course_id: "", day_of_week: "Monday", start_time: "08:00", end_time: "10:00", venue: "" };

export default function ManageTimetable() {
  const { notify } = useNotifications();
  const [courses, setCourses] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");
  const [selectedDay, setSelectedDay] = useState("Monday");
  const [showAllDays, setShowAllDays] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [courseResult, timetableResult] = await Promise.all([
        supabase.from("courses").select("id, course_name, course_code, department").order("course_code"),
        supabase.from("class_timetable").select("*, courses(id, course_name, course_code, department)").order("start_time")
      ]);

      if (courseResult.error) throw courseResult.error;
      if (timetableResult.error) throw timetableResult.error;

      setCourses(courseResult.data || []);
      setSchedules(timetableResult.data || []);
    } catch (error) {
      notify(error.message || "Unable to load timetable.", "error", { title: "Loading failed" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const courseMap = useMemo(
    () => Object.fromEntries(courses.map(course => [course.id, course])),
    [courses]
  );

  const filteredSchedules = useMemo(() => schedules.filter(item => {
    const course = item.courses || courseMap[item.course_id];
    const query = search.toLowerCase();
    return !query || [course?.course_name, course?.course_code, item.venue, item.day_of_week]
      .some(value => String(value || "").toLowerCase().includes(query));
  }), [schedules, search, courseMap]);

  const daySchedules = useMemo(() => filteredSchedules
    .filter(item => item.day_of_week === selectedDay)
    .sort((a, b) => a.start_time.localeCompare(b.start_time)),
  [filteredSchedules, selectedDay]);

  const stats = {
    total: schedules.length,
    days: new Set(schedules.map(item => item.day_of_week)).size,
    venues: new Set(schedules.map(item => item.venue).filter(Boolean)).size
  };

  const openAdd = () => {
    setEditing(null);
    setForm({ ...emptyForm, day_of_week: selectedDay });
    setModalOpen(true);
  };

  const openEdit = item => {
    setEditing(item);
    setForm({
      course_id: item.course_id,
      day_of_week: item.day_of_week,
      start_time: item.start_time.slice(0, 5),
      end_time: item.end_time.slice(0, 5),
      venue: item.venue || ""
    });
    setModalOpen(true);
  };

  const handleChange = e => setForm(previous => ({
    ...previous,
    [e.target.name]: e.target.value
  }));

  const handleSubmit = async e => {
    e.preventDefault();

    if (!form.course_id) {
      notify("Please select a course.", "warning", { title: "Missing course" });
      return;
    }

    if (form.start_time >= form.end_time) {
      notify("The end time must be later than the start time.", "warning", { title: "Invalid time range" });
      return;
    }

    setSaving(true);

    try {
      const overlapping = schedules.some(item =>
        item.id !== editing?.id &&
        item.day_of_week === form.day_of_week &&
        form.start_time < item.end_time.slice(0, 5) &&
        form.end_time > item.start_time.slice(0, 5)
      );

      if (overlapping) {
        throw new Error("This time overlaps another class on the selected day.");
      }

      const payload = {
        course_id: form.course_id,
        day_of_week: form.day_of_week,
        start_time: form.start_time,
        end_time: form.end_time,
        venue: form.venue.trim() || null,
        updated_at: new Date().toISOString()
      };

      const result = editing
        ? await supabase.from("class_timetable").update(payload).eq("id", editing.id)
        : await supabase.from("class_timetable").insert([payload]);

      if (result.error) throw result.error;

      notify(editing ? "Class schedule updated successfully." : "Class schedule created successfully.", "success", {
        title: editing ? "Schedule updated" : "Schedule created"
      });

      setModalOpen(false);
      setEditing(null);
      setForm(emptyForm);
      await fetchData();

    } catch (error) {
      notify(error.message || "Unable to save schedule.", "error", { title: "Save failed" });
    } finally {
      setSaving(false);
    }
  };

  const deleteSchedule = async item => {
    const course = item.courses || courseMap[item.course_id];
    if (!window.confirm(`Delete ${course?.course_code || "this"} timetable entry on ${item.day_of_week}?`)) return;

    try {
      const { error } = await supabase.from("class_timetable").delete().eq("id", item.id);
      if (error) throw error;

      setSchedules(previous => previous.filter(schedule => schedule.id !== item.id));
      notify("Timetable entry deleted successfully.", "success", { title: "Schedule deleted" });
    } catch (error) {
      notify(error.message || "Unable to delete schedule.", "error", { title: "Delete failed" });
    }
  };

  const formatTime = time => {
    if (!time) return "";
    const [hours, minutes] = time.slice(0, 5).split(":").map(Number);
    const suffix = hours >= 12 ? "PM" : "AM";
    return `${hours % 12 || 12}:${String(minutes).padStart(2, "0")} ${suffix}`;
  };

  const visibleSchedules = showAllDays ? filteredSchedules : daySchedules;

  return (
    <div className="min-h-screen bg-[#F5F8F6] p-3 lg:p-8">
      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-[#176D68]">
            <CalendarDays size={17} /> Academic Management
          </div>
          <h1 className="text-2xl font-bold text-[#20302D] sm:text-3xl">Manage Timetable</h1>
          <p className="mt-1 text-sm text-[#81918B]">Create and organize weekly departmental class schedules.</p>
        </div>
        <button onClick={openAdd} className="flex items-center justify-center gap-2 rounded-xl bg-[#176D68] px-5 py-3 text-sm font-semibold text-white hover:bg-[#105A55]">
          <Plus size={19} /> Add Schedule
        </button>
      </div>

      <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard title="Total Classes" value={stats.total} icon={<CalendarDays size={21} />} />
        <StatCard title="Active Days" value={stats.days} icon={<Clock size={21} />} />
        <StatCard title="Venues Used" value={stats.venues} icon={<MapPin size={21} />} />
      </div>

      <div className="rounded-2xl border border-[#E7EEEA] bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#20302D]">Weekly Schedule</h2>
            <p className="mt-1 text-sm text-[#81918B]">{showAllDays ? filteredSchedules.length : daySchedules.length} classes displayed</p>
          </div>
          <label className="relative w-full sm:max-w-xs">
            <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#81918B]" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search course or venue..." className="w-full rounded-xl border border-[#E7EEEA] bg-[#FAFCFB] py-3 pl-10 pr-3 text-sm outline-none focus:border-[#176D68]" />
          </label>
        </div>

        <div className="mb-5 flex gap-2 overflow-x-auto pb-2">
          {DAYS.map(day => (
            <button key={day} onClick={() => { setSelectedDay(day); setShowAllDays(false); }} className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-semibold transition ${selectedDay === day && !showAllDays ? "bg-[#176D68] text-white" : "bg-[#F1F5F3] text-[#52635D] hover:bg-[#E5EFEB]"}`}>
              {day.slice(0, 3)}
            </button>
          ))}
          <button onClick={() => setShowAllDays(true)} className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-semibold ${showAllDays ? "bg-[#176D68] text-white" : "bg-[#F1F5F3] text-[#52635D]"}`}>
            All days
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center py-16 text-[#81918B]">
            <LoaderCircle size={30} className="mb-3 animate-spin text-[#176D68]" />
            <p className="text-sm">Loading timetable...</p>
          </div>
        ) : visibleSchedules.length === 0 ? (
          <div className="py-16 text-center">
            <CalendarClock size={38} className="mx-auto mb-3 text-[#AAB8B2]" />
            <h3 className="font-semibold text-[#20302D]">No classes scheduled</h3>
            <p className="mt-1 text-sm text-[#81918B]">{showAllDays ? "No timetable entries match your search." : `There are no classes scheduled for ${selectedDay}.`}</p>
            <button onClick={openAdd} className="mt-4 rounded-xl bg-[#EAF4F1] px-4 py-2.5 text-sm font-semibold text-[#176D68]">Add a schedule</button>
          </div>
        ) : (
          <div className="space-y-3">
            {visibleSchedules.map(item => {
              const course = item.courses || courseMap[item.course_id];
              return (
                <div key={item.id} className="flex flex-col gap-4 rounded-xl border border-[#E7EEEA] p-4 sm:flex-row sm:items-center sm:justify-between hover:bg-[#FAFCFB]">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EAF4F1] text-[#176D68]">
                      <BookOpen size={21} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-[#20302D]">{course?.course_name || "Unknown course"}</h3>
                      <p className="mt-1 text-sm font-bold text-[#176D68]">{course?.course_code || "—"}</p>
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-xs text-[#81918B]">
                        {showAllDays && <span className="flex items-center gap-1"><CalendarDays size={13} />{item.day_of_week}</span>}
                        <span className="flex items-center gap-1"><Clock size={13} />{formatTime(item.start_time)} – {formatTime(item.end_time)}</span>
                        <span className="flex items-center gap-1"><MapPin size={13} />{item.venue || "Venue not specified"}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 border-t border-[#F0F4F2] pt-3 sm:border-0 sm:pt-0">
                    <button onClick={() => openEdit(item)} title="Edit schedule" className="rounded-lg p-2 text-[#176D68] hover:bg-[#EAF4F1]"><Pencil size={17} /></button>
                    <button onClick={() => deleteSchedule(item)} title="Delete schedule" className="rounded-lg p-2 text-red-500 hover:bg-red-50"><Trash2 size={17} /></button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4">
          <div className="my-auto w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl sm:p-7">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-[#20302D]">{editing ? "Edit Schedule" : "Add Class Schedule"}</h2>
                <p className="mt-1 text-sm text-[#81918B]">Enter the class details below.</p>
              </div>
              <button onClick={() => setModalOpen(false)} className="rounded-full p-2 text-[#81918B] hover:bg-[#F1F5F3]"><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <FormField label="Course">
                <select required name="course_id" value={form.course_id} onChange={handleChange} className="form-input">
                  <option value="">Select course</option>
                  {courses.map(course => <option key={course.id} value={course.id}>{course.course_code} — {course.course_name}</option>)}
                </select>
              </FormField>

              <FormField label="Day of Week">
                <select name="day_of_week" value={form.day_of_week} onChange={handleChange} className="form-input">
                  {DAYS.map(day => <option key={day}>{day}</option>)}
                </select>
              </FormField>

              <div className="grid grid-cols-2 gap-3">
                <FormField label="Start Time">
                  <input required type="time" name="start_time" value={form.start_time} onChange={handleChange} className="form-input" />
                </FormField>
                <FormField label="End Time">
                  <input required type="time" name="end_time" value={form.end_time} onChange={handleChange} className="form-input" />
                </FormField>
              </div>

              <FormField label="Venue (Optional)">
                <input name="venue" value={form.venue} onChange={handleChange} placeholder="e.g. Lecture Hall 2" className="form-input" />
              </FormField>

              <div className="flex flex-col-reverse gap-3 pt-3 sm:flex-row">
                <button type="button" onClick={() => setModalOpen(false)} className="flex-1 rounded-xl border border-[#E7EEEA] py-3 text-sm font-semibold text-[#52635D]">Cancel</button>
                <button type="submit" disabled={saving || !courses.length} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#176D68] py-3 text-sm font-semibold text-white hover:bg-[#105A55] disabled:opacity-60">
                  {saving && <LoaderCircle size={17} className="animate-spin" />}
                  {saving ? "Saving..." : editing ? "Update Schedule" : "Save Schedule"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .form-input { width:100%; border:1px solid #E7EEEA; background:#FAFCFB; border-radius:12px; padding:12px 14px; font-size:14px; outline:none; color:#20302D; }
        .form-input:focus { border-color:#176D68; }
      `}</style>
    </div>
  );
}

function StatCard({ title, value, icon }) {
  return <div className="rounded-2xl border border-[#E7EEEA] bg-white p-5 shadow-sm">
    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[#EAF4F1] text-[#176D68]">{icon}</div>
    <p className="text-sm text-[#81918B]">{title}</p>
    <h3 className="mt-1 text-2xl font-bold text-[#20302D]">{value}</h3>
  </div>;
}

function FormField({ label, children }) {
  return <div><label className="mb-2 block text-sm font-semibold text-[#52635D]">{label}</label>{children}</div>;
}
