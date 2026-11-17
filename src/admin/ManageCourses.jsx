
import React, { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  GraduationCap,
  Layers,
  BookMarked,
  LoaderCircle,
  AlertCircle,
  CheckCircle2,
  Filter,
} from "lucide-react";
import { useNotifications } from "../context/NotificationContext";

import { supabase } from "../services/supabase";

const emptyForm = { course_name: "", course_code: "", department: "", course_type: "Compulsory", credit_units: 2 };

export default function ManageCourses() {
  const { notify } = useNotifications();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const [error, setError] = useState("");

  // FETCH COURSES
  const fetchCourses = async () => {
  setLoading(true);
  setError("");

  try {
    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    setCourses(data || []);
  } catch (error) {
    setError(error.message);
    notify(error.message, "error", { title: "Failed to load courses" });
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchCourses();
  }, []);

  // DEPARTMENTS
  const departments = useMemo(() => {
    return [
      ...new Set(courses.map((course) => course.department)),
    ].sort();
  }, [courses]);

  // FILTER COURSES
  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const query = search.toLowerCase();

      const matchesSearch =
        course.course_name.toLowerCase().includes(query) ||
        course.course_code.toLowerCase().includes(query) ||
        course.department.toLowerCase().includes(query);

      const matchesDepartment =
        departmentFilter === "All" ||
        course.department === departmentFilter;

      const matchesType =
        typeFilter === "All" ||
        course.course_type === typeFilter;

      return (
        matchesSearch &&
        matchesDepartment &&
        matchesType
      );
    });
  }, [courses, search, departmentFilter, typeFilter]);

  // STATISTICS
  const compulsoryCount = courses.filter(
    (course) => course.course_type === "Compulsory"
  ).length;

  const electiveCount = courses.filter(
    (course) => course.course_type === "Elective"
  ).length;

  // OPEN ADD MODAL
  const openAddModal = () => {
    setEditingCourse(null);
    setForm(emptyForm);
    setError("");
    setModalOpen(true);
  };

  // OPEN EDIT MODAL
  const openEditModal = (course) => {
    setEditingCourse(course);

    setForm({
      course_name: course.course_name,
      course_code: course.course_code,
      department: course.department,
      course_type: course.course_type,
      credit_units: course.credit_units,
    });

    setError("");
    setModalOpen(true);
  };

  // FORM INPUT
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // SAVE COURSE
  const handleSubmit = async (e) => {
    e.preventDefault();

    setSaving(true);
    setError("");
    

    const courseData = {
      course_name: form.course_name.trim(),
      course_code: form.course_code.trim().toUpperCase(),
      department: form.department.trim(),
      course_type: form.course_type,
      credit_units: form.credit_units,
      updated_at: new Date().toISOString(),
    };

    let result;

    if (editingCourse) {
      result = await supabase
        .from("courses")
        .update(courseData)
        .eq("id", editingCourse.id);
    } else {
      result = await supabase
        .from("courses")
        .insert([courseData]);
    }

    if (result.error) {
      if (result.error.code === "23505") {
        setError(
          "This course code already exists in this department."
        );
      } else {
        setError(result.error.message);
      }

      setSaving(false);
      return;
    }

  
    setModalOpen(false);
    setForm(emptyForm);
    setEditingCourse(null);

    await fetchCourses();

    setSaving(false);
  };

  // DELETE COURSE
  const deleteCourse = async (course) => {
  const confirmed = window.confirm(
    `Delete ${course.course_name} (${course.course_code})?`
  );

  if (!confirmed) return;

  try {
    const { error } = await supabase
      .from("courses")
      .delete()
      .eq("id", course.id);

    if (error) throw error;

    setCourses(previous => previous.filter(item => item.id !== course.id));

    notify(`${course.course_name} was deleted successfully.`, "success", {
      title: "Course deleted"
    });

  } catch (error) {
    notify(error.message || "Unable to delete course.", "error", {
      title: "Delete failed"
    });
  }
};

  return (
    <div className="min-h-screen bg-[#F5F8F6] p-4 sm:p-6 lg:p-8">

      {/* HEADER */}
      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-[#176D68]">
            <BookOpen size={17} />
            Academic Management
          </div>

          <h1 className="text-2xl font-bold text-[#20302D] sm:text-3xl">
            Manage Courses
          </h1>

          <p className="mt-1 text-sm text-[#81918B]">
            Create and manage departmental courses.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 rounded-xl bg-[#176D68] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#105A55]"
        >
          <Plus size={19} />
          Add Course
        </button>
      </div>

      {/* NOTIFICATIONS */}
      {error && !modalOpen && (
        <div className="mb-5 flex items-center gap-2 rounded-xl bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* STATISTICS */}
      <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-3">

        <StatCard
          title="Total Courses"
          value={courses.length}
          icon={<BookOpen size={21} />}
        />

        <StatCard
          title="Compulsory Courses"
          value={compulsoryCount}
          icon={<BookMarked size={21} />}
        />

        <StatCard
          title="Elective Courses"
          value={electiveCount}
          icon={<Layers size={21} />}
        />

      </div>

      {/* COURSE LIST */}
      <div className="rounded-2xl border border-[#E7EEEA] bg-white p-4 shadow-sm sm:p-6">

        <div className="mb-5">
          <h2 className="text-lg font-bold text-[#20302D]">
            Course Directory
          </h2>

          <p className="mt-1 text-sm text-[#81918B]">
            {filteredCourses.length} courses found
          </p>
        </div>

        {/* SEARCH AND FILTERS */}
        <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-3">

          <div className="relative md:col-span-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#81918B]"
            />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search courses..."
              className="w-full rounded-xl border border-[#E7EEEA] bg-[#FAFCFB] py-3 pl-10 pr-4 text-sm outline-none focus:border-[#176D68]"
            />
          </div>

          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="rounded-xl border border-[#E7EEEA] bg-[#FAFCFB] px-3 py-3 text-sm outline-none focus:border-[#176D68]"
          >
            <option value="All">All Departments</option>

            {departments.map((department) => (
              <option key={department} value={department}>
                {department}
              </option>
            ))}
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-xl border border-[#E7EEEA] bg-[#FAFCFB] px-3 py-3 text-sm outline-none focus:border-[#176D68]"
          >
            <option value="All">All Course Types</option>
            <option value="Compulsory">Compulsory</option>
            <option value="Elective">Elective</option>
          </select>

        </div>

        {/* LOADING */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-[#81918B]">
            <LoaderCircle size={30} className="mb-3 animate-spin text-[#176D68]" />
            <p className="text-sm">Loading courses...</p>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="py-16 text-center">
            <BookOpen
              size={38}
              className="mx-auto mb-3 text-[#AAB8B2]"
            />

            <h3 className="font-semibold text-[#20302D]">
              No courses found
            </h3>

            <p className="mt-1 text-sm text-[#81918B]">
              Add a course or adjust your search.
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
                    <th className="px-4 py-4">Code</th>
                    <th className="px-4 py-4">Department</th>
                    <th className="px-4 py-4">Type</th>
                    <th className="px-4 py-4 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredCourses.map((course) => (
                    <tr
                      key={course.id}
                      className="border-b border-[#F0F4F2] last:border-0 hover:bg-[#FAFCFB]"
                    >
                      <td className="px-4 py-4">
                        <div className="font-semibold text-[#20302D]">
                          {course.course_name}
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <span className="rounded-lg bg-[#F1F5F3] px-3 py-1.5 text-xs font-bold text-[#176D68]">
                          {course.course_code}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-sm text-[#52635D]">
                        {course.credit_units}
                      </td>

                      <td className="px-4 py-4 text-sm text-[#52635D]">
                        {course.department}
                      </td>

                      <td className="px-4 py-4">
                        <CourseType type={course.course_type} />
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEditModal(course)}
                            className="rounded-lg p-2 text-[#176D68] hover:bg-[#EAF4F1]"
                            title="Edit course"
                          >
                            <Pencil size={17} />
                          </button>

                          <button
                            onClick={() => deleteCourse(course)}
                            className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                            title="Delete course"
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
              {filteredCourses.map((course) => (
                <div
                  key={course.id}
                  className="rounded-xl border border-[#E7EEEA] p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-[#20302D]">
                        {course.course_name}
                      </h3>

                      <p className="mt-1 text-sm font-bold text-[#176D68]">
                        {course.course_code}
                      </p>

                      <p className="mt-1 text-sm font-bold text-[#176D68]">
                        {course.credit_units} Units
                      </p>
                    </div>

                    <CourseType type={course.course_type} />
                  </div>

                  <div className="mt-3 flex items-center gap-2 text-xs text-[#81918B]">
                    <GraduationCap size={15} />
                    {course.department}
                  </div>

                  <div className="mt-4 flex justify-end gap-2 border-t border-[#F0F4F2] pt-3">
                    <button
                      onClick={() => openEditModal(course)}
                      className="flex items-center gap-2 rounded-lg bg-[#EAF4F1] px-3 py-2 text-xs font-semibold text-[#176D68]"
                    >
                      <Pencil size={14} />
                      Edit
                    </button>

                    <button
                      onClick={() => deleteCourse(course)}
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
                  {editingCourse ? "Edit Course" : "Add New Course"}
                </h2>

                <p className="mt-1 text-sm text-[#81918B]">
                  Enter the course information below.
                </p>
              </div>

              <button
                onClick={() => setModalOpen(false)}
                className="rounded-full p-2 text-[#81918B] hover:bg-[#F1F5F3]"
              >
                <X size={20} />
              </button>
            </div>


            <form onSubmit={handleSubmit} className="space-y-4">

              <FormField label="Course Name">
                <input
                  required
                  name="course_name"
                  value={form.course_name}
                  onChange={handleChange}
                  placeholder="e.g. Introduction to Statistics"
                  className="form-input"
                />
              </FormField>

              <FormField label="Course Code">
                <input
                  required
                  name="course_code"
                  value={form.course_code}
                  onChange={handleChange}
                  placeholder="e.g. STA101"
                  className="form-input uppercase"
                />
              </FormField>

              <FormField label="Credit Units">
              <select required name="credit_units" value={form.credit_units} onChange={handleChange} className="form-input">
                {[1, 2, 3, 4, 5, 6].map((unit) => <option key={unit} value={unit}>{unit} Units</option>)}
              </select>
            </FormField>

              <FormField label="Department">
                <select required name="department" value={form.department} onChange={handleChange} className="form-input">
                <option value="">Select Department</option>
                <option value="All Departments">All Departments</option>
                {departments.map((department) => <option key={department} value={department}>{department}</option>)}
              </select>
              </FormField>

              <FormField label="Course Type">
                <select
                  required
                  name="course_type"
                  value={form.course_type}
                  onChange={handleChange}
                  className="form-input"
                >
                  <option value="Compulsory">Compulsory</option>
                  <option value="Elective">Elective</option>
                </select>
              </FormField>

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
                    : editingCourse
                    ? "Update Course"
                    : "Save Course"}
                </button>
              </div>

            </form>
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

// STAT CARD
function StatCard({ title, value, icon }) {
  return (
    <div className="rounded-2xl border border-[#E7EEEA] bg-white p-5 shadow-sm">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[#EAF4F1] text-[#176D68]">
        {icon}
      </div>

      <p className="text-sm text-[#81918B]">{title}</p>

      <h3 className="mt-1 text-2xl font-bold text-[#20302D]">
        {value}
      </h3>
    </div>
  );
}

// COURSE TYPE BADGE
function CourseType({ type }) {
  const compulsory = type === "Compulsory";

  return (
    <span
      className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${
        compulsory
          ? "bg-[#EAF4F1] text-[#176D68]"
          : "bg-amber-50 text-amber-700"
      }`}
    >
      {type}
    </span>
  );
}

// FORM FIELD
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
