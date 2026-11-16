
import React, { useEffect, useRef, useState } from "react";
import {
  UserRound,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  BookOpen,
  CalendarDays,
  ShieldCheck,
  Pencil,
  X,
  Check,
  Camera,
  ChevronRight,
  Clock,
  Loader2,
} from "lucide-react";

import { useProfile } from "../context/ProfileContext";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const {
    profile,
    loading,
    updating,
    uploadingAvatar,
    error,
    updateProfile,
    uploadAvatar,
  } = useProfile();

  const { user } = useAuth();

  const [editing, setEditing] = useState(false);
  const [savingError, setSavingError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const fileInputRef = useRef(null);

  const student = {
    name:
      profile?.full_name ||
      user?.user_metadata?.full_name ||
      "Student",

    matricNumber: profile?.matric_number || "Not provided",
    department: profile?.department || "Not provided",
    level: profile?.level || "Not provided",

    email: user?.email || profile?.email || "Not provided",

    phone: profile?.phone || "",
    faculty: profile?.faculty || "Not provided",
    session: profile?.session || "Not provided",
    admissionYear: profile?.admission_year || "Not provided",
    bio: profile?.bio || "",

    avatar: profile?.avatar_url || "",
  };

  const [form, setForm] = useState({
    name: "",
    phone: "",
    bio: "",
  });

  useEffect(() => {
    if (!editing) {
      setForm({
        name: student.name === "Student" ? "" : student.name,
        phone: student.phone,
        bio: student.bio,
      });
    }
  }, [profile, user, editing]);

  const initials = student.name
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleChange = (e) => {
    setForm((previous) => ({
      ...previous,
      [e.target.name]: e.target.value,
    }));
  };

  const saveProfile = async (e) => {
    e.preventDefault();

    setSavingError("");
    setSuccessMessage("");

    try {
      await updateProfile({
        full_name: form.name.trim(),
        phone: form.phone.trim(),
        bio: form.bio.trim(),
      });

      setEditing(false);
      setSuccessMessage("Profile updated successfully.");

    } catch (err) {
      setSavingError(err.message || "Unable to update profile.");
    }
  };

  const cancelEdit = () => {
    setForm({
      name: student.name === "Student" ? "" : student.name,
      phone: student.phone,
      bio: student.bio,
    });

    setSavingError("");
    setEditing(false);
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setSavingError("");
    setSuccessMessage("");

    try {
      await uploadAvatar(file);
      setSuccessMessage("Profile picture updated successfully.");
    } catch (err) {
      setSavingError(err.message || "Avatar upload failed.");
    } finally {
      e.target.value = "";
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="animate-spin text-[#176D68]" size={30} />
        <p className="text-sm text-[#81918B]">
          Loading your profile...
        </p>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="bg-white rounded-[28px] p-7">
        <h2 className="font-bold text-lg text-[#20302D]">
          Unable to load profile
        </h2>

        <p className="text-sm text-red-600 mt-2">
          {error}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-7 pb-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-sm text-[#81918B] mb-1">
            Account / Profile
          </p>

          <h1 className="text-2xl sm:text-3xl font-bold text-[#20302D]">
            My Profile
          </h1>

          <p className="text-sm text-[#81918B] mt-2">
            Manage your personal and academic information.
          </p>
        </div>

        <button
          onClick={() => {
            setForm({
              name: student.name === "Student" ? "" : student.name,
              phone: student.phone,
              bio: student.bio,
            });

            setSavingError("");
            setEditing(true);
          }}
          className="flex items-center justify-center gap-2 bg-[#176D68] hover:bg-[#105A55] text-white px-5 py-3 rounded-2xl text-sm font-semibold transition"
        >
          <Pencil size={16} />
          Edit Profile
        </button>
      </div>

      {/* Feedback */}
      {successMessage && (
        <div className="bg-[#E4F2EF] text-[#176D68] p-4 rounded-2xl text-sm">
          {successMessage}
        </div>
      )}

      {savingError && (
        <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm">
          {savingError}
        </div>
      )}

      {/* Profile Hero */}
      <section className="bg-white rounded-[28px] p-5 sm:p-7">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">

          <div className="relative w-fit">

            {student.avatar ? (
              <img
                src={student.avatar}
                alt="Profile"
                className="w-24 h-24 rounded-[28px] object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-[28px] bg-[#E4F2EF] text-[#176D68] flex items-center justify-center text-3xl font-bold">
                {initials}
              </div>
            )}

            <button
              type="button"
              disabled={uploadingAvatar}
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-2 -right-2 bg-[#176D68] hover:bg-[#105A55] disabled:opacity-50 text-white p-2 rounded-xl"
              title="Change profile picture"
            >
              {uploadingAvatar ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Camera size={15} />
              )}
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>

          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <h2 className="text-xl sm:text-2xl font-bold text-[#20302D]">
                {student.name}
              </h2>

              <span className="text-xs font-semibold bg-[#E4F2EF] text-[#176D68] px-3 py-1 rounded-full">
                {profile?.role === "admin" ? "Administrator" : "Active Student"}
              </span>
            </div>

            <p className="text-sm text-[#81918B]">
              {student.department} · {student.level}
            </p>

            <p className="text-sm text-[#81918B] mt-2">
              Matric Number: {student.matricNumber}
            </p>
          </div>

          <div className="sm:text-right">
            <p className="text-xs text-[#81918B]">
              Academic Session
            </p>

            <p className="font-bold text-[#20302D] mt-1">
              {student.session}
            </p>
          </div>
        </div>
      </section>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Personal Information */}
        <section className="lg:col-span-2 bg-white rounded-[28px] p-5 sm:p-7">

          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-lg text-[#20302D]">
                Personal Information
              </h3>

              <p className="text-sm text-[#81918B] mt-1">
                Your personal contact details
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-[#E4F2EF] text-[#176D68]">
              <UserRound size={20} />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">

            <InfoItem
              icon={UserRound}
              label="Full Name"
              value={student.name}
            />

            <InfoItem
              icon={Mail}
              label="Email Address"
              value={student.email}
            />

            <InfoItem
              icon={Phone}
              label="Phone Number"
              value={student.phone || "Not provided"}
            />

            <InfoItem
              icon={MapPin}
              label="Location"
              value="Nigeria"
            />

          </div>

          <div className="mt-7 pt-6 border-t border-[#F1F5F3]">
            <h4 className="font-semibold text-sm text-[#20302D] mb-3">
              About Me
            </h4>

            <p className="text-sm text-[#81918B] leading-7">
              {student.bio || "No bio added yet."}
            </p>
          </div>
        </section>

        {/* Academic Information */}
        <section className="bg-white rounded-[28px] p-5 sm:p-7">

          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-lg text-[#20302D]">
                Academic Details
              </h3>

              <p className="text-sm text-[#81918B] mt-1">
                Your school information
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-[#E4F2EF] text-[#176D68]">
              <GraduationCap size={20} />
            </div>
          </div>

          <div className="space-y-5">

            <InfoItem
              icon={GraduationCap}
              label="Department"
              value={student.department}
            />

            <InfoItem
              icon={BookOpen}
              label="Faculty"
              value={student.faculty}
            />

            <InfoItem
              icon={CalendarDays}
              label="Current Level"
              value={student.level}
            />

            <InfoItem
              icon={Clock}
              label="Admission Year"
              value={student.admissionYear}
            />

            <InfoItem
              icon={ShieldCheck}
              label="Matric Number"
              value={student.matricNumber}
            />

          </div>
        </section>
      </div>

      {/* Account Settings */}
      <section className="bg-white rounded-[28px] p-5 sm:p-7">
        <h3 className="font-bold text-lg text-[#20302D]">
          Account Settings
        </h3>

        <p className="text-sm text-[#81918B] mt-1 mb-5">
          Manage your account preferences and security.
        </p>

        <div className="space-y-2">

          <SettingsItem
            icon={ShieldCheck}
            title="Account Security"
            description="Manage your password and account protection."
          />

          <SettingsItem
            icon={Mail}
            title="Email Preferences"
            description="Manage your academic email notifications."
          />

          <SettingsItem
            icon={Camera}
            title="Profile Picture"
            description="Upload or change your profile picture."
            onClick={() => fileInputRef.current?.click()}
          />

        </div>
      </section>

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">

          <div className="bg-white w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-[28px] p-5 sm:p-7">

            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-[#20302D]">
                  Edit Profile
                </h2>

                <p className="text-sm text-[#81918B] mt-1">
                  Update your personal information.
                </p>
              </div>

              <button
                onClick={cancelEdit}
                className="p-2 rounded-xl bg-[#F1F5F3] text-[#20302D]"
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={saveProfile} className="space-y-4">

              <FormField
                label="Full Name"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
              />

              <FormField
                label="Email Address"
                name="email"
                type="email"
                value={student.email}
                disabled
              />

              <FormField
                label="Phone Number"
                name="phone"
                value={form.phone}
                onChange={handleChange}
              />

              <div>
                <label className="block text-sm font-semibold text-[#20302D] mb-2">
                  About Me
                </label>

                <textarea
                  name="bio"
                  value={form.bio}
                  onChange={handleChange}
                  rows={4}
                  maxLength={500}
                  className="w-full rounded-2xl bg-[#F5F8F6] p-4 text-sm outline-none focus:ring-2 focus:ring-[#176D68]/20 resize-none"
                />
              </div>

              <div className="bg-[#F5F8F6] rounded-2xl p-4 text-sm text-[#81918B]">
                Matric number, department, faculty and academic level cannot be changed here. Email changes require a separate email verification process.
              </div>

              {savingError && (
                <p className="text-sm text-red-600">
                  {savingError}
                </p>
              )}

              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-3">

                <button
                  type="button"
                  onClick={cancelEdit}
                  disabled={updating}
                  className="flex-1 py-3 rounded-2xl bg-[#F1F5F3] text-[#20302D] font-semibold text-sm"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={updating || !form.name.trim()}
                  className="flex-1 py-3 rounded-2xl bg-[#176D68] hover:bg-[#105A55] disabled:opacity-50 text-white font-semibold text-sm flex items-center justify-center gap-2"
                >
                  {updating ? (
                    <Loader2 size={17} className="animate-spin" />
                  ) : (
                    <Check size={17} />
                  )}

                  {updating ? "Saving..." : "Save Changes"}
                </button>

              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

/* Reusable Information Item */
function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 min-w-0">
      <div className="p-3 rounded-xl bg-[#F1F5F3] text-[#176D68]">
        <Icon size={18} />
      </div>

      <div className="min-w-0">
        <p className="text-xs text-[#81918B] mb-1">
          {label}
        </p>

        <p className="text-sm font-semibold text-[#20302D] break-words">
          {value || "Not provided"}
        </p>
      </div>
    </div>
  );
}

/* Reusable Settings Item */
function SettingsItem({ icon: Icon, title, description, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-[#F5F8F6] transition text-left"
    >
      <div className="p-3 rounded-xl bg-[#E4F2EF] text-[#176D68]">
        <Icon size={19} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-[#20302D]">
          {title}
        </p>

        <p className="text-xs text-[#81918B] mt-1">
          {description}
        </p>
      </div>

      <ChevronRight size={18} className="text-[#81918B]" />
    </button>
  );
}

/* Reusable Form Field */
function FormField({
  label,
  name,
  value,
  onChange,
  type = "text",
  disabled = false,
  required = false,
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-[#20302D] mb-2">
        {label}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        className="w-full rounded-2xl bg-[#F5F8F6] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#176D68]/20 disabled:opacity-60"
      />
    </div>
  );
}
