
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Users, Search, Plus, Eye, Pencil, Trash2, X,
  Mail, Phone, GraduationCap, UserRound,
  CheckCircle2, Clock, Ban, RefreshCw
} from "lucide-react";

import { supabase } from "../services/supabase";

const emptyForm = {
  surname: "",
  matric: "",
  email: "",
  department: "Computer Science",
  level: "100 Level",
  status: "Pending"
};

export default function ManageStudents() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [modal, setModal] = useState("");
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pageError, setPageError] = useState("");

  // =========================================
  // FETCH STUDENTS FROM SUPABASE
  // =========================================

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    setPageError("");

    try {
      const [registryResult, profilesResult] = await Promise.all([
        supabase
          .from("student_registry")
          .select("*")
          .order("created_at", { ascending: false }),

        supabase
          .from("profiles")
          .select("*")
          .eq("role", "student")
      ]);

      if (registryResult.error) throw registryResult.error;
      if (profilesResult.error) throw profilesResult.error;

      const registry = registryResult.data || [];
      const profiles = profilesResult.data || [];

      // Match profiles with registry records using matric number.
      const mergedStudents = registry.map(record => {
        const profile = profiles.find(
          item =>
            item.matric_number?.toLowerCase() ===
            record.matric_number?.toLowerCase()
        );

        let status = "Pending";

        if (!record.is_active) {
          status = "Suspended";
        } else if (profile) {
          status = "Active";
        }

        return {
          id: record.matric_number,
          matric: record.matric_number,
          surname: record.surname,
          name: profile?.full_name || record.surname,
          email: record.email,
          phone: profile?.phone || "",
          department: record.department || profile?.department || "Not specified",
          level: record.level || profile?.level || "Not specified",
          status,
          joined: record.created_at,
          profile,
          registry: record,
          registered: Boolean(profile)
        };
      });

      setStudents(mergedStudents);
    } catch (err) {
      console.error("Student fetch error:", err);
      setPageError(err.message || "Unable to load student records.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // =========================================
  // STATISTICS
  // =========================================

  const stats = useMemo(() => [
    {
      label: "Total Students",
      value: students.length,
      icon: Users
    },
    {
      label: "Active Students",
      value: students.filter(s => s.status === "Active").length,
      icon: CheckCircle2
    },
    {
      label: "Pending Accounts",
      value: students.filter(s => s.status === "Pending").length,
      icon: Clock
    },
    {
      label: "Suspended",
      value: students.filter(s => s.status === "Suspended").length,
      icon: Ban
    }
  ], [students]);

  // =========================================
  // SEARCH AND FILTER
  // =========================================

  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const query = search.toLowerCase();

      const matchesSearch = [
        student.name,
        student.surname,
        student.matric,
        student.email
      ]
        .join(" ")
        .toLowerCase()
        .includes(query);

      const matchesLevel =
        levelFilter === "All" || student.level === levelFilter;

      const matchesStatus =
        statusFilter === "All" || student.status === statusFilter;

      return matchesSearch && matchesLevel && matchesStatus;
    });
  }, [students, search, levelFilter, statusFilter]);

  // =========================================
  // MODALS
  // =========================================

  const openAdd = () => {
    setForm(emptyForm);
    setSelected(null);
    setError("");
    setModal("add");
  };

  const openEdit = student => {
    setForm({
      surname: student.surname || "",
      matric: student.matric,
      email: student.email,
      department: student.department,
      level: student.level,
      status: student.status
    });

    setSelected(student);
    setError("");
    setModal("edit");
  };

  const closeModal = () => {
    setModal("");
    setSelected(null);
    setError("");
  };

  // =========================================
  // ADD / EDIT STUDENT
  // =========================================

  const handleSubmit = async e => {
    e.preventDefault();
    setError("");

    const surname = form.surname.trim();
    const matric = form.matric.trim();
    const email = form.email.trim().toLowerCase();

    if (!surname || !matric || !email) {
      setError("Please complete all required fields.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email address.");
      return;
    }

    if (modal === "edit" && selected?.registered) {
      if (email !== selected.email.toLowerCase()) {
        setError(
          "This student already has an account. Change their email through a secure Auth email update process."
        );
        return;
      }
    }

    setSaving(true);

    try {
      if (modal === "add") {
        const { error: insertError } = await supabase
          .from("student_registry")
          .insert({
            matric_number: matric,
            surname,
            email,
            department: form.department,
            level: form.level,
            is_active: true
          });

        if (insertError) {
          if (insertError.code === "23505") {
            throw new Error(
              "This matric number or email address already exists."
            );
          }

          throw insertError;
        }
      } else {
        // Matric number remains immutable.
        const { error: updateError } = await supabase
          .from("student_registry")
          .update({
            surname,
            department: form.department,
            level: form.level
          })
          .eq("matric_number", selected.matric);

        if (updateError) throw updateError;

        // Change eligibility only when the student is not registered.
        // Existing account suspension needs a separate Auth process.
        if (!selected.registered) {
          const { error: statusError } = await supabase
            .from("student_registry")
            .update({
              is_active: form.status !== "Suspended"
            })
            .eq("matric_number", selected.matric);

          if (statusError) throw statusError;
        }
      }

      await fetchStudents();

      setModal("");
      setSelected(null);
    } catch (err) {
      console.error("Student save error:", err);
      setError(err.message || "Unable to save student.");
    } finally {
      setSaving(false);
    }
  };

  // =========================================
  // ACTIVATE / DEACTIVATE
  // =========================================

  const changeStatus = async (student, status) => {
    if (student.registered) {
      setError(
        "This student already has an account. Changing registry eligibility alone cannot suspend an existing Auth session."
      );
      return;
    }

    const { error: updateError } = await supabase
      .from("student_registry")
      .update({
        is_active: status !== "Suspended"
      })
      .eq("matric_number", student.matric);

    if (updateError) {
      console.error(updateError);
      setError(updateError.message);
      return;
    }

    await fetchStudents();

    const updated = {
      ...student,
      status
    };

    setSelected(updated);
  };

  // =========================================
  // DEACTIVATE RECORD
  // =========================================

  const deactivateStudent = async student => {
    const confirmed = window.confirm(
      `Deactivate ${student.name}'s student record?`
    );

    if (!confirmed) return;

    const { error: updateError } = await supabase
      .from("student_registry")
      .update({ is_active: false })
      .eq("matric_number", student.matric);

    if (updateError) {
      alert(updateError.message);
      return;
    }

    closeModal();
    await fetchStudents();
  };

  // =========================================
  // HELPERS
  // =========================================

  const statusStyle = status => {
    if (status === "Active") {
      return "bg-[#E4F2EF] text-[#176D68]";
    }

    if (status === "Pending") {
      return "bg-amber-50 text-amber-700";
    }

    return "bg-red-50 text-red-600";
  };

  const initials = name =>
    (name || "?")
      .split(" ")
      .filter(Boolean)
      .map(n => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

  const formatDate = date => {
    if (!date) return "Not available";

    return new Date(date).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric"
    });
  };

  // =========================================
  // UI
  // =========================================

  return (
    <div className="space-y-7">

      {/* HEADER */}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-sm text-[#81918B]">
            Administration / Students
          </p>

          <h1 className="text-2xl sm:text-3xl font-bold text-[#20302D] mt-1">
            Manage Students
          </h1>

          <p className="text-sm text-[#81918B] mt-2">
            Register, manage and monitor student accounts.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={fetchStudents}
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-white text-[#52645E] rounded-xl px-4 py-3 text-sm font-semibold"
          >
            <RefreshCw size={17} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>

          <button
            onClick={openAdd}
            className="flex items-center justify-center gap-2 bg-[#176D68] text-white rounded-xl px-5 py-3 text-sm font-semibold"
          >
            <Plus size={18} />
            Add Student
          </button>
        </div>
      </div>

      {/* PAGE ERROR */}

      {pageError && (
        <div className="bg-red-50 text-red-700 rounded-xl p-4 text-sm">
          {pageError}
          <button
            onClick={fetchStudents}
            className="underline ml-2 font-semibold"
          >
            Try again
          </button>
        </div>
      )}

      {/* STATISTICS */}

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map(item => {
          const Icon = item.icon;

          return (
            <div key={item.label} className="bg-white rounded-2xl p-4 sm:p-5">
              <div className="w-10 h-10 rounded-xl bg-[#E4F2EF] text-[#176D68] flex items-center justify-center">
                <Icon size={20} />
              </div>

              <p className="text-xs sm:text-sm text-[#81918B] mt-4">
                {item.label}
              </p>

              <h2 className="text-2xl font-bold text-[#20302D] mt-1">
                {item.value}
              </h2>
            </div>
          );
        })}
      </div>

      {/* SEARCH AND FILTERS */}

      <div className="bg-white rounded-2xl p-4">
        <div className="flex flex-col lg:flex-row gap-3">

          <div className="flex items-center gap-2 flex-1 bg-[#F5F8F6] rounded-xl px-3">
            <Search size={18} className="text-[#81918B]" />

            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search name, matric number or email..."
              className="w-full py-3 bg-transparent outline-none text-sm"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={levelFilter}
              onChange={e => setLevelFilter(e.target.value)}
              className="bg-[#F5F8F6] rounded-xl px-4 py-3 text-sm outline-none"
            >
              <option value="All">All Levels</option>
              <option value="100 Level">100 Level</option>
              <option value="200 Level">200 Level</option>
              <option value="300 Level">300 Level</option>
              <option value="400 Level">400 Level</option>
            </select>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="bg-[#F5F8F6] rounded-xl px-4 py-3 text-sm outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Pending">Pending</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>
        </div>
      </div>

      {/* DIRECTORY */}

      <section className="bg-white rounded-2xl overflow-hidden">
        <div className="p-5 flex items-center justify-between gap-3">
          <div>
            <h2 className="font-bold text-[#20302D]">
              Student Directory
            </h2>

            <p className="text-xs text-[#81918B] mt-1">
              {filteredStudents.length} students found
            </p>
          </div>

          <Users size={21} className="text-[#176D68]" />
        </div>

        {loading ? (
          <div className="py-16 text-center">
            <RefreshCw
              size={25}
              className="mx-auto text-[#176D68] animate-spin"
            />
            <p className="text-sm text-[#81918B] mt-3">
              Loading student records...
            </p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="text-center py-14 px-4">
            <UserRound size={35} className="mx-auto text-[#A0ADA7]" />

            <h3 className="font-semibold text-[#20302D] mt-3">
              No students found
            </h3>

            <p className="text-sm text-[#81918B] mt-1">
              Try changing your search or filters.
            </p>
          </div>
        ) : (
          <>
            {/* MOBILE CARDS */}

            <div className="md:hidden divide-y divide-[#F1F5F3]">
              {filteredStudents.map(student => (
                <div key={student.id} className="p-4">
                  <div className="flex items-start gap-3">

                    <div className="w-11 h-11 shrink-0 rounded-full bg-[#E4F2EF] text-[#176D68] flex items-center justify-center font-bold">
                      {initials(student.name)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-semibold text-sm text-[#20302D] truncate">
                            {student.name}
                          </p>

                          <p className="text-xs text-[#81918B] mt-1">
                            {student.matric}
                          </p>
                        </div>

                        <span className={`text-[10px] px-2.5 py-1 rounded-full h-fit ${statusStyle(student.status)}`}>
                          {student.status}
                        </span>
                      </div>

                      <p className="text-xs text-[#81918B] mt-2 truncate">
                        {student.email}
                      </p>

                      <p className="text-xs text-[#81918B] mt-1">
                        {student.level}
                      </p>

                      <div className="flex gap-4 mt-4">
                        <button
                          onClick={() => {
                            setSelected(student);
                            setModal("view");
                          }}
                          className="text-xs font-semibold text-[#176D68] flex items-center gap-1"
                        >
                          <Eye size={15} /> View
                        </button>

                        <button
                          onClick={() => openEdit(student)}
                          className="text-xs font-semibold text-[#52645E] flex items-center gap-1"
                        >
                          <Pencil size={14} /> Edit
                        </button>

                        {student.status !== "Suspended" && (
                          <button
                            onClick={() => deactivateStudent(student)}
                            className="text-xs font-semibold text-red-500 flex items-center gap-1"
                          >
                            <Ban size={14} /> Deactivate
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* DESKTOP TABLE */}

            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#F8FAF9] text-xs text-[#81918B]">
                  <tr>
                    <th className="px-5 py-4 font-semibold">Student</th>
                    <th className="px-5 py-4 font-semibold">Matric Number</th>
                    <th className="px-5 py-4 font-semibold">Level</th>
                    <th className="px-5 py-4 font-semibold">Status</th>
                    <th className="px-5 py-4 font-semibold">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#F1F5F3]">
                  {filteredStudents.map(student => (
                    <tr key={student.id} className="hover:bg-[#FAFCFB]">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#E4F2EF] text-[#176D68] flex items-center justify-center text-xs font-bold">
                            {initials(student.name)}
                          </div>

                          <div>
                            <p className="text-sm font-semibold text-[#20302D]">
                              {student.name}
                            </p>

                            <p className="text-xs text-[#81918B] mt-1">
                              {student.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm text-[#52645E]">
                        {student.matric}
                      </td>

                      <td className="px-5 py-4 text-sm text-[#52645E]">
                        {student.level}
                      </td>

                      <td className="px-5 py-4">
                        <span className={`text-xs px-3 py-1.5 rounded-full ${statusStyle(student.status)}`}>
                          {student.status}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => {
                              setSelected(student);
                              setModal("view");
                            }}
                            className="text-[#176D68]"
                            title="View"
                          >
                            <Eye size={17} />
                          </button>

                          <button
                            onClick={() => openEdit(student)}
                            className="text-[#71827C]"
                            title="Edit"
                          >
                            <Pencil size={17} />
                          </button>

                          {student.status !== "Suspended" && (
                            <button
                              onClick={() => deactivateStudent(student)}
                              className="text-red-500"
                              title="Deactivate"
                            >
                              <Ban size={17} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>

      {/* ADD / EDIT MODAL */}

      {(modal === "add" || modal === "edit") && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-3xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto space-y-4"
          >
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-[#20302D]">
                  {modal === "add" ? "Approve Student" : "Edit Student"}
                </h2>

                <p className="text-xs text-[#81918B] mt-1">
                  {modal === "add"
                    ? "Add this student to the approved registration list."
                    : "Update this student's registry information."}
                </p>
              </div>

              <button type="button" onClick={closeModal}>
                <X />
              </button>
            </div>

            {[
              ["surname", "Surname", "Enter surname", "text"],
              ["matric", "Matric Number", "Enter matric number", "text"],
              ["email", "Email Address", "Enter email address", "email"]
            ].map(([key, label, placeholder, type]) => (
              <div key={key}>
                <label className="block text-sm font-semibold text-[#52645E] mb-2">
                  {label}
                </label>

                <input
                  required
                  type={type}
                  value={form[key]}
                  disabled={
                    (modal === "edit" && key === "matric") ||
                    (modal === "edit" && key === "email" && selected?.registered)
                  }
                  onChange={e =>
                    setForm(prev => ({
                      ...prev,
                      [key]: e.target.value
                    }))
                  }
                  placeholder={placeholder}
                  className="w-full bg-[#F5F8F6] rounded-xl p-3 outline-none text-sm disabled:opacity-60"
                />
              </div>
            ))}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-[#52645E] mb-2">
                  Department
                </label>

                <input
                  value={form.department}
                  onChange={e =>
                    setForm(prev => ({
                      ...prev,
                      department: e.target.value
                    }))
                  }
                  required
                  className="w-full bg-[#F5F8F6] rounded-xl p-3 outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#52645E] mb-2">
                  Level
                </label>

                <select
                  value={form.level}
                  onChange={e =>
                    setForm(prev => ({
                      ...prev,
                      level: e.target.value
                    }))
                  }
                  className="w-full bg-[#F5F8F6] rounded-xl p-3 outline-none text-sm"
                >
                  <option>100 Level</option>
                  <option>200 Level</option>
                  <option>300 Level</option>
                  <option>400 Level</option>
                </select>
              </div>
            </div>

            {modal === "edit" && !selected?.registered && (
              <div>
                <label className="block text-sm font-semibold text-[#52645E] mb-2">
                  Registration Eligibility
                </label>

                <select
                  value={form.status}
                  onChange={e =>
                    setForm(prev => ({
                      ...prev,
                      status: e.target.value
                    }))
                  }
                  className="w-full bg-[#F5F8F6] rounded-xl p-3 outline-none text-sm"
                >
                  <option value="Pending">Pending</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </div>
            )}

            {modal === "edit" && selected?.registered && (
              <p className="text-xs text-[#81918B] bg-[#F5F8F6] p-3 rounded-xl">
                This student already has an account. Their email and account status cannot be changed from this form.
              </p>
            )}

            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="flex-1 bg-[#F1F5F3] text-[#52645E] rounded-xl py-3 text-sm font-semibold"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-[#176D68] text-white rounded-xl py-3 text-sm font-semibold disabled:opacity-60"
              >
                {saving
                  ? "Saving..."
                  : modal === "add"
                    ? "Approve Student"
                    : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* STUDENT PROFILE MODAL */}

      {modal === "view" && selected && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">

            <div className="flex justify-between items-center">
              <h2 className="font-bold text-lg text-[#20302D]">
                Student Profile
              </h2>

              <button onClick={closeModal}>
                <X />
              </button>
            </div>

            <div className="text-center py-6">
              <div className="w-20 h-20 mx-auto rounded-full bg-[#E4F2EF] text-[#176D68] flex items-center justify-center text-2xl font-bold">
                {initials(selected.name)}
              </div>

              <h3 className="font-bold text-xl text-[#20302D] mt-3">
                {selected.name}
              </h3>

              <p className="text-sm text-[#81918B] mt-1">
                {selected.matric}
              </p>

              <span className={`inline-block mt-3 text-xs px-3 py-1.5 rounded-full ${statusStyle(selected.status)}`}>
                {selected.status}
              </span>
            </div>

            <div className="space-y-4 bg-[#F5F8F6] rounded-2xl p-4 text-sm">
              <p className="flex gap-3 items-center text-[#52645E]">
                <Mail size={17} className="text-[#176D68]" />
                {selected.email}
              </p>

              <p className="flex gap-3 items-center text-[#52645E]">
                <Phone size={17} className="text-[#176D68]" />
                {selected.phone || "Not provided"}
              </p>

              <p className="flex gap-3 items-center text-[#52645E]">
                <GraduationCap size={17} className="text-[#176D68]" />
                {selected.department}
              </p>

              <p className="flex gap-3 items-center text-[#52645E]">
                <Users size={17} className="text-[#176D68]" />
                {selected.level}
              </p>

              <p className="text-xs text-[#81918B]">
                Registry date: {formatDate(selected.joined)}
              </p>

              <p className="text-xs text-[#81918B]">
                Account: {selected.registered ? "Registered" : "Not registered"}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-5">
              <button
                onClick={() => openEdit(selected)}
                className="bg-[#E4F2EF] text-[#176D68] rounded-xl py-3 text-sm font-semibold flex items-center justify-center gap-2"
              >
                <Pencil size={16} /> Edit Profile
              </button>

              <button
                onClick={closeModal}
                className="bg-[#176D68] text-white rounded-xl py-3 text-sm font-semibold"
              >
                Close
              </button>
            </div>

            {!selected.registered && (
              <div className="mt-4 flex flex-wrap gap-2">
                {selected.status === "Suspended" && (
                  <button
                    onClick={() => changeStatus(selected, "Pending")}
                    className="text-xs text-[#176D68] font-semibold bg-[#E4F2EF] rounded-lg px-3 py-2"
                  >
                    Reactivate eligibility
                  </button>
                )}

                {selected.status !== "Suspended" && (
                  <button
                    onClick={() => changeStatus(selected, "Suspended")}
                    className="text-xs text-red-600 font-semibold bg-red-50 rounded-lg px-3 py-2"
                  >
                    Suspend eligibility
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <p className="text-xs text-[#81918B]">
        Student records are loaded from Supabase. Account status is derived from registration and registry eligibility.
      </p>
    </div>
  );
}
