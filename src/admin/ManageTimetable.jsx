
import React, { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Clock,
  MapPin,
  BookOpen,
  LoaderCircle,
  AlertCircle,
  CheckCircle2,
  CalendarClock,
} from "lucide-react";

import { supabase } from "../services/supabase";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const emptyForm = {
  course_id: "",
  day_of_week: "Monday",
  start_time: "08:00",
  end_time: "10:00",
  venue: "",
};

const formatTime = (time) => {
  if (!time) return "";

  const [hours, minutes] = time.split(":");
  const date = new Date();
  date.setHours(Number(hours), Number(minutes), 0);

  return date.toLocaleTimeString("en-NG", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

export default function ManageTimetable() {
  const [classes, setClasses] = useState([]);
  const [courses, setCourses] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [dayFilter, setDayFilter] = useState("All");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState(null);

  const [form, setForm] = useState(emptyForm);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // FETCH COURSES AND TIMETABLE
  const fetchData = async () => {
    setLoading(true);
    setError("");

    const [courseResult, classResult] = await Promise.all([
      supabase
        .from("courses")
        .select("id, course_name, course_code, department")
        .order("course_name"),

      supabase
        .from("class_timetable")
        .select(`
          *,
          courses (
            id,
            course_name,
            course_code,
            department
          )
        `)
        .order("day_of_week")
        .order("start_time"),
    ]);

    if (courseResult.error) {
      setError(courseResult.error.message);
    } else {
      setCourses(courseResult.data || []);
    }

    if (classResult.error) {
      setError(classResult.error.message);
    } else {
      setClasses(classResult.data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // SORT DAYS IN WEEKLY ORDER
  const sortedClasses = useMemo(() => {
    return [...classes].sort((a, b) => {
      const dayDifference =
        DAYS.indexOf(a.day_of_week) -
        DAYS.indexOf(b.day_of_week);

      if (dayDifference !== 0) return dayDifference;

      return a.start_time.localeCompare(b.start_time);
    });
  }, [classes]);

  // FILTER CLASSES
  const filteredClasses = useMemo(() => {
    return sortedClasses.filter((item) => {
      const course = item.courses;

      const query = search.toLowerCase();

      const matchesSearch =
        course?.course_name?.toLowerCase().includes(query) ||
        course?.course_code?.toLowerCase().includes(query) ||
        course?.department?.toLowerCase().includes(query) ||
        item.venue?.toLowerCase().includes(query);

      const matchesDay =
        dayFilter === "All" ||
        item.day_of_week === dayFilter;

      return matchesSearch && matchesDay;
    });
  }, [sortedClasses, search, dayFilter]);

  // OPEN ADD MODAL
  const openAddModal = () => {
    setEditingClass(null);
    setForm(emptyForm);
    setError("");
    setModalOpen(true);
  };

  // OPEN EDIT MODAL
  const openEditModal = (item) => {
    setEditingClass(item);

    setForm({
      course_id: item.course_id,
      day_of_week: item.day_of_week,
      start_time: item.start_time.slice(0, 5),
      end_time: item.end_time.slice(0, 5),
      venue: item.venue || "",
    });

    setError("");
    setModalOpen(true);
  };

  // HANDLE FORM INPUT
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // VALIDATE CLASS TIME
  const validateForm = () => {
    if (!form.course_id) {
      return "Please select a course.";
    }

    if (!form.start_time || !form.end_time) {
      return "Please provide both start and end times.";
    }

    if (form.end_time <= form.start_time) {
      return "End time must be later than start time.";
    }

    return "";
  };

  // SAVE CLASS
  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    const classData = {
      course_id: form.course_id,
      day_of_week: form.day_of_week,
      start_time: form.start_time,
      end_time: form.end_time,
      venue: form.venue.trim() || null,
      updated_at: new Date().toISOString(),
    };

    let result;

    if (editingClass) {
      result = await supabase
        .from("class_timetable")
        .update(classData)
        .eq("id", editingClass.id);
    } else {
      result = await supabase
        .from("class_timetable")
        .insert([classData]);
    }

    if (result.error) {
      setError(result.error.message);
      setSaving(false);
      return;
    }

    setModalOpen(false);
    setEditingClass(null);
    setForm(emptyForm);

    setSuccess(
      editingClass
        ? "Class timetable updated successfully."
        : "Class added to the weekly timetable."
    );

    await fetchData();

    setSaving(false);
  };

  // DELETE CLASS
  const deleteClass = async (item) => {
    const confirmed = window.confirm(
      `Remove ${item.courses?.course_code || "this class"} from the weekly timetable?`
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    const { error } = await supabase
      .from("class_timetable")
      .delete()
      .eq("id", item.id);

    if (error) {
      setError(error.message);
      return;
    }

    setClasses((previous) =>
      previous.filter((entry) => entry.id !== item.id)
    );

    setSuccess("Class removed from the timetable.");
  };

  // STATISTICS
  const stats = [
    {
      title: "Scheduled Classes",
      value: classes.length,
      icon: CalendarDays,
    },
    {
      title: "Courses",
      value: new Set(classes.map((item) => item.course_id)).size,
      icon: BookOpen,
    },
    {
      title: "Active Days",
      value: new Set(classes.map((item) => item.day_of_week)).size,
      icon: CalendarClock,
    },
  ];

  return (
    <div className="min-h-screen bg-[#F5F8F6] p-4 sm:p-6 lg:p-8">

      {/* HEADER */}
      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-[#176D68]">
            <CalendarDays size={17} />
            Academic Management
          </div>

          <h1 className="text-2xl font-bold text-[#20302D] sm:text-3xl">
            Class Timetable
          </h1>

          <p className="mt-1 text-sm text-[#81918B]">
            Manage recurring weekly classes and schedules.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 rounded-xl bg-[#176D68] px-5 py-3 text-sm font-semibold text-white hover:bg-[#105A55]"
        >
          <Plus size={19} />
          Schedule Class
        </button>
      </div>

      {/* NOTIFICATIONS */}
      {error && !modalOpen && (
        <div className="mb-5 flex items-center gap-2 rounded-xl bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {success && (
        <div className="mb-5 flex items-center gap-2 rounded-xl bg-green-50 p-4 text-sm text-green-700">
          <CheckCircle2 size={18} />
          {success}
        </div>
      )}

      {/* STATISTICS */}
      <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="rounded-2xl border border-[#E7EEEA] bg-white p-5 shadow-sm"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[#EAF4F1] text-[#176D68]">
                <Icon size={21} />
              </div>

              <p className="text-sm text-[#81918B]">
                {stat.title}
              </p>

              <h3 className="mt-1 text-2xl font-bold text-[#20302D]">
                {stat.value}
              </h3>
            </div>
          );
        })}
      </div>

      {/* TIMETABLE DIRECTORY */}
      <div className="rounded-2xl border border-[#E7EEEA] bg-white p-4 shadow-sm sm:p-6">

        <div className="mb-5">
          <h2 className="text-lg font-bold text-[#20302D]">
            Weekly Schedule
          </h2>

          <p className="mt-1 text-sm text-[#81918B]">
            {filteredClasses.length} scheduled classes
          </p>
        </div>

        {/* SEARCH AND FILTER */}
        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">

          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#81918B]"
            />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search course, code or venue..."
              className="w-full rounded-xl border border-[#E7EEEA] bg-[#FAFCFB] py-3 pl-10 pr-4 text-sm outline-none focus:border-[#176D68]"
            />
          </div>

          <select
            value={dayFilter}
            onChange={(e) => setDayFilter(e.target.value)}
            className="rounded-xl border border-[#E7EEEA] bg-[#FAFCFB] px-3 py-3 text-sm outline-none focus:border-[#176D68]"
          >
            <option value="All">All Days</option>

            {DAYS.map((day) => (
              <option key={day} value={day}>
                {day}
              </option>
            ))}
          </select>
        </div>

        {/* LOADING */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-[#81918B]">
            <LoaderCircle size={30} className="mb-3 animate-spin text-[#176D68]" />
            <p className="text-sm">Loading timetable...</p>
          </div>
        ) : filteredClasses.length === 0 ? (
          <div className="py-16 text-center">
            <CalendarDays
              size={38}
              className="mx-auto mb-3 text-[#AAB8B2]"
            />

            <h3 className="font-semibold text-[#20302D]">
              No scheduled classes
            </h3>

            <p className="mt-1 text-sm text-[#81918B]">
              Schedule a class or change your filters.
            </p>
          </div>
        ) : (
          <>
            {/* DESKTOP TABLE */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[#E7EEEA] text-xs uppercase tracking-wide text-[#81918B]">
                    <th className="px-4 py-4">Course</th>
                    <th className="px-4 py-4">Day</th>
                    <th className="px-4 py-4">Time</th>
                    <th className="px-4 py-4">Venue</th>
                    <th className="px-4 py-4 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredClasses.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-[#F0F4F2] last:border-0 hover:bg-[#FAFCFB]"
                    >
                      <td className="px-4 py-4">
                        <p className="font-semibold text-[#20302D]">
                          {item.courses?.course_name}
                        </p>

                        <p className="mt-1 text-xs font-bold text-[#176D68]">
                          {item.courses?.course_code}
                        </p>
                      </td>

                      <td className="px-4 py-4 text-sm text-[#52635D]">
                        {item.day_of_week}
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2 text-sm text-[#52635D]">
                          <Clock size={15} className="text-[#176D68]" />
                          {formatTime(item.start_time)} – {formatTime(item.end_time)}
                        </div>
                      </td>

                      <td className="px-4 py-4 text-sm text-[#52635D]">
                        {item.venue || "Not specified"}
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEditModal(item)}
                            className="rounded-lg p-2 text-[#176D68] hover:bg-[#EAF4F1]"
                            title="Edit class"
                          >
                            <Pencil size={17} />
                          </button>

                          <button
                            onClick={() => deleteClass(item)}
                            className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                            title="Delete class"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* MOBILE CARDS */}
            <div className="space-y-3 md:hidden">
              {filteredClasses.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-[#E7EEEA] p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-[#20302D]">
                        {item.courses?.course_name}
                      </h3>

                      <p className="mt-1 text-xs font-bold text-[#176D68]">
                        {item.courses?.course_code}
                      </p>
                    </div>

                    <span className="rounded-lg bg-[#EAF4F1] px-3 py-1.5 text-xs font-semibold text-[#176D68]">
                      {item.day_of_week}
                    </span>
                  </div>

                  <div className="mt-4 space-y-2 text-sm text-[#52635D]">
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-[#176D68]" />
                      {formatTime(item.start_time)} – {formatTime(item.end_time)}
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-[#176D68]" />
                      {item.venue || "Venue not specified"}
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end gap-2 border-t border-[#F0F4F2] pt-3">
                    <button
                      onClick={() => openEditModal(item)}
                      className="flex items-center gap-2 rounded-lg bg-[#EAF4F1] px-3 py-2 text-xs font-semibold text-[#176D68]"
                    >
                      <Pencil size={14} />
                      Edit
                    </button>

                    <button
                      onClick={() => deleteClass(item)}
                      className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600"
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ADD / EDIT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4">
          <div className="my-auto w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl sm:p-7">

            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-[#20302D]">
                  {editingClass ? "Edit Scheduled Class" : "Schedule New Class"}
                </h2>

                <p className="mt-1 text-sm text-[#81918B]">
                  This schedule repeats every week.
                </p>
              </div>

              <button
                onClick={() => setModalOpen(false)}
                className="rounded-full p-2 text-[#81918B] hover:bg-[#F1F5F3]"
              >
                <X size={20} />
              </button>
            </div>

            {error && (
              <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {courses.length === 0 ? (
              <div className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
                No courses found. Create courses before scheduling classes.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">

                <FormField label="Select Course">
                  <select
                    required
                    name="course_id"
                    value={form.course_id}
                    onChange={handleChange}
                    className="form-input"
                  >
                    <option value="">Choose a course</option>

                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.course_code} — {course.course_name}
                      </option>
                    ))}
                  </select>
                </FormField>

                <FormField label="Day of the Week">
                  <select
                    required
                    name="day_of_week"
                    value={form.day_of_week}
                    onChange={handleChange}
                    className="form-input"
                  >
                    {DAYS.map((day) => (
                      <option key={day} value={day}>
                        {day}
                      </option>
                    ))}
                  </select>
                </FormField>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField label="Start Time">
                    <input
                      required
                      type="time"
                      name="start_time"
                      value={form.start_time}
                      onChange={handleChange}
                      className="form-input"
                    />
                  </FormField>

                  <FormField label="End Time">
                    <input
                      required
                      type="time"
                      name="end_time"
                      value={form.end_time}
                      onChange={handleChange}
                      className="form-input"
                    />
                  </FormField>
                </div>

                <FormField label="Venue (Optional)">
                  <input
                    name="venue"
                    value={form.venue}
                    onChange={handleChange}
                    placeholder="e.g. Lecture Hall A"
                    className="form-input"
                  />
                </FormField>

                <p className="text-xs text-[#81918B]">
                  Leave the venue empty if it has not been assigned.
                </p>

                <div className="flex flex-col-reverse gap-3 pt-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="flex-1 rounded-xl border border-[#E7EEEA] py-3 text-sm font-semibold text-[#52635D] hover:bg-[#F5F8F6]"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#176D68] py-3 text-sm font-semibold text-white hover:bg-[#105A55] disabled:opacity-60"
                  >
                    {saving && (
                      <LoaderCircle size={17} className="animate-spin" />
                    )}

                    {saving
                      ? "Saving..."
                      : editingClass
                      ? "Update Timetable"
                      : "Schedule Class"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <style>{`
        .form-input {
          width: 100%;
          border: 1px solid #E7EEEA;
          background: #FAFCFB;
          border-radius: 12px;
          padding: 12px 14px;
          font-size: 14px;
          outline: none;
          color: #20302D;
        }

        .form-input:focus {
          border-color: #176D68;
        }
      `}</style>
    </div>
  );
}

function FormField({ label, children }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-[#52635D]">
        {label}
      </label>
      {children}
    </div>
  );
}
