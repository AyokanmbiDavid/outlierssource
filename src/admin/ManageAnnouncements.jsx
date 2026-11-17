
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Megaphone, Plus, Search, Edit3, Trash2, ImagePlus, X, Upload,
  CalendarDays, Eye, EyeOff, AlertCircle, Clock, CheckCircle2,
  Loader2, Filter, Users, Building2, Bell
} from "lucide-react";
import { supabase } from "../services/supabase";
import { useNotifications } from "../context/NotificationContext";

const BUCKET = "announcement-images";
const CATEGORIES = ["General", "Academic", "Events", "Examinations", "Registration", "Important"];
const PRIORITIES = ["Normal", "Important", "Urgent"];

const EMPTY_FORM = {
  title: "", content: "", category: "General", priority: "Normal",
  target_audience: "All", target_department: "", expires_at: ""
};

const inputClass = "w-full rounded-xl border border-[#E4EBE7] bg-white px-4 py-3 text-sm text-[#20302D] outline-none transition focus:border-[#176D68] focus:ring-2 focus:ring-[#176D68]/10";
const labelClass = "mb-2 block text-sm font-semibold text-[#344640]";

export default function ManageAnnouncements() {
  const { notify } = useNotifications();
  const fileRef = useRef(null);

  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [removeImage, setRemoveImage] = useState(false);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("announcements")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const rows = await Promise.all((data || []).map(async item => {
        if (!item.image_path) return { ...item, image_url: "" };

        const { data: signed } = await supabase.storage
          .from(BUCKET)
          .createSignedUrl(item.image_path, 3600);

        return { ...item, image_url: signed?.signedUrl || "" };
      }));

      setAnnouncements(rows);
    } catch (error) {
      console.error(error);
      notify("Unable to load announcements.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  useEffect(() => {
    return () => {
      if (imagePreview.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const stats = useMemo(() => ({
    total: announcements.length,
    published: announcements.filter(a => a.is_published).length,
    drafts: announcements.filter(a => !a.is_published).length,
    urgent: announcements.filter(a => a.priority === "Urgent" && a.is_published).length
  }), [announcements]);

  const filtered = useMemo(() => announcements.filter(a => {
    const term = search.toLowerCase();
    const matchesSearch = a.title.toLowerCase().includes(term) ||
      a.content.toLowerCase().includes(term);
    return matchesSearch && (categoryFilter === "All" || a.category === categoryFilter);
  }), [announcements, search, categoryFilter]);

  const updateField = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditing(null);
    setImageFile(null);
    setImagePreview("");
    setRemoveImage(false);
    setShowForm(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const openCreate = () => {
    resetForm();
    setShowForm(true);
  };

  const openEdit = item => {
    setEditing(item);
    setForm({
      title: item.title || "",
      content: item.content || "",
      category: item.category || "General",
      priority: item.priority || "Normal",
      target_audience: item.target_audience || "All",
      target_department: item.target_department || "",
      expires_at: item.expires_at ? new Date(item.expires_at).toISOString().slice(0, 16) : ""
    });
    setImageFile(null);
    setImagePreview(item.image_url || "");
    setRemoveImage(false);
    setShowForm(true);
  };

  const handleImage = event => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      notify("Please select a JPG, PNG or WebP image.", "error");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      notify("Image must not exceed 5MB.", "error");
      event.target.value = "";
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setRemoveImage(false);
  };

  const uploadImage = async (file, announcementId) => {
    const extension = file.name.split(".").pop().toLowerCase();
    const path = `${announcementId}/${crypto.randomUUID()}.${extension}`;

    const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
      contentType: file.type,
      upsert: false,
      cacheControl: "3600"
    });

    if (error) throw error;
    return path;
  };

  const handleSubmit = async event => {
    event.preventDefault();

    if (!form.title.trim() || !form.content.trim()) {
      notify("Enter an announcement title and content.", "warning");
      return;
    }

    if (form.target_audience === "Department" && !form.target_department.trim()) {
      notify("Enter the target department.", "warning");
      return;
    }

    setSaving(true);
    let uploadedPath = null;

    try {
      const id = editing?.id || crypto.randomUUID();

      if (imageFile) uploadedPath = await uploadImage(imageFile, id);

      const imagePath = imageFile
        ? uploadedPath
        : removeImage
          ? null
          : editing?.image_path || null;

      const payload = {
        title: form.title.trim(),
        content: form.content.trim(),
        category: form.category,
        priority: form.priority,
        target_audience: form.target_audience,
        target_department: form.target_audience === "Department"
          ? form.target_department.trim()
          : null,
        expires_at: form.expires_at
          ? new Date(form.expires_at).toISOString()
          : null,
        image_path: imagePath
      };

      if (editing) {
        const { error } = await supabase
          .from("announcements")
          .update(payload)
          .eq("id", editing.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("announcements")
          .insert({ id, ...payload, created_by: (await supabase.auth.getUser()).data.user?.id });

        if (error) throw error;
      }

      if (uploadedPath && editing?.image_path) {
        await supabase.storage.from(BUCKET).remove([editing.image_path]);
      } else if (removeImage && editing?.image_path) {
        await supabase.storage.from(BUCKET).remove([editing.image_path]);
      }

      notify(editing ? "Announcement updated successfully." : "Announcement created successfully.", "success");
      resetForm();
      await fetchAnnouncements();
    } catch (error) {
      console.error(error);
      if (uploadedPath) await supabase.storage.from(BUCKET).remove([uploadedPath]);
      notify(error.message || "Unable to save announcement.", "error");
    } finally {
      setSaving(false);
    }
  };

  const togglePublish = async item => {
    try {
      const publishing = !item.is_published;
      const { error } = await supabase
        .from("announcements")
        .update({
          is_published: publishing,
          ...(publishing && !item.published_at ? { published_at: new Date().toISOString() } : {})
        })
        .eq("id", item.id);

      if (error) throw error;

      notify(publishing ? "Announcement published." : "Announcement unpublished.", "success");
      await fetchAnnouncements();
    } catch (error) {
      notify(error.message || "Unable to update publication status.", "error");
    }
  };

  const deleteAnnouncement = async item => {
    if (!window.confirm(`Delete "${item.title}"? This cannot be undone.`)) return;

    try {
      const { error } = await supabase
        .from("announcements")
        .delete()
        .eq("id", item.id);

      if (error) throw error;

      if (item.image_path) {
        await supabase.storage.from(BUCKET).remove([item.image_path]);
      }

      setAnnouncements(prev => prev.filter(a => a.id !== item.id));
      notify("Announcement deleted successfully.", "success");
    } catch (error) {
      notify(error.message || "Unable to delete announcement.", "error");
    }
  };

  const priorityStyle = {
    Normal: "bg-slate-100 text-slate-600",
    Important: "bg-amber-100 text-amber-700",
    Urgent: "bg-red-100 text-red-700"
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2 text-[#176D68]">
            <Megaphone size={22} />
            <span className="text-xs font-bold uppercase tracking-widest">Communication</span>
          </div>
          <h1 className="mt-2 text-2xl font-bold text-[#20302D]">Announcements</h1>
          <p className="mt-1 text-sm text-[#81918B]">Share important updates with your students.</p>
        </div>
        <button onClick={openCreate} className="flex items-center justify-center gap-2 rounded-xl bg-[#176D68] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#105A55]">
          <Plus size={18} /> New announcement
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat icon={Bell} label="Total" value={stats.total} />
        <Stat icon={CheckCircle2} label="Published" value={stats.published} />
        <Stat icon={EyeOff} label="Drafts" value={stats.drafts} />
        <Stat icon={AlertCircle} label="Urgent" value={stats.urgent} />
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-[#E6ECE8] bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#20302D]">{editing ? "Edit announcement" : "Create announcement"}</h2>
              <p className="mt-1 text-xs text-[#81918B]">Fields marked with * are required.</p>
            </div>
            <button type="button" onClick={resetForm} className="rounded-lg p-2 text-[#81918B] hover:bg-[#F1F5F3]"><X size={20} /></button>
          </div>

          <div>
            <label className={labelClass}>Announcement title *</label>
            <input className={inputClass} maxLength={150} value={form.title} onChange={e => updateField("title", e.target.value)} placeholder="Enter announcement title" required />
          </div>

          <div>
            <label className={labelClass}>Announcement content *</label>
            <textarea className={`${inputClass} min-h-36 resize-y`} value={form.content} onChange={e => updateField("content", e.target.value)} placeholder="Write your announcement..." required />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Category</label>
              <select className={inputClass} value={form.category} onChange={e => updateField("category", e.target.value)}>
                {CATEGORIES.map(category => <option key={category}>{category}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Priority</label>
              <select className={inputClass} value={form.priority} onChange={e => updateField("priority", e.target.value)}>
                {PRIORITIES.map(priority => <option key={priority}>{priority}</option>)}
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Target audience</label>
              <select className={inputClass} value={form.target_audience} onChange={e => updateField("target_audience", e.target.value)}>
                <option value="All">All students</option>
                <option value="Department">Specific department</option>
              </select>
            </div>
            {form.target_audience === "Department" && (
              <div>
                <label className={labelClass}>Department *</label>
                <input className={inputClass} value={form.target_department} onChange={e => updateField("target_department", e.target.value)} placeholder="e.g. Statistics" required />
              </div>
            )}
          </div>

          <div>
            <label className={labelClass}>Expiration date (optional)</label>
            <input type="datetime-local" className={inputClass} value={form.expires_at} onChange={e => updateField("expires_at", e.target.value)} />
            <p className="mt-1 text-xs text-[#81918B]">The announcement will stop appearing to students after this date.</p>
          </div>

          <div>
            <label className={labelClass}>Announcement image (optional)</label>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImage} className="hidden" />
            {imagePreview && !removeImage ? (
              <div className="relative overflow-hidden rounded-2xl border border-[#E6ECE8]">
                <img src={imagePreview} alt="Announcement preview" className="max-h-72 w-full object-cover" />
                <button type="button" onClick={() => { setImageFile(null); setImagePreview(""); setRemoveImage(true); if (fileRef.current) fileRef.current.value = ""; }} className="absolute right-3 top-3 flex items-center gap-1 rounded-lg bg-white/95 px-3 py-2 text-xs font-semibold text-red-600 shadow">
                  <Trash2 size={14} /> Remove image
                </button>
              </div>
            ) : (
              <button type="button" onClick={() => fileRef.current?.click()} className="flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#DCE7E1] bg-[#F8FAF9] px-4 py-8 text-[#81918B] transition hover:border-[#176D68] hover:bg-[#F1F7F4]">
                <ImagePlus size={28} className="text-[#176D68]" />
                <span className="text-sm font-semibold text-[#344640]">Choose an image</span>
                <span className="text-xs">JPG, PNG or WebP · Maximum 5MB</span>
              </button>
            )}
            {imagePreview && !removeImage && (
              <button type="button" onClick={() => fileRef.current?.click()} className="mt-2 text-xs font-semibold text-[#176D68]">Replace image</button>
            )}
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-[#EDF1EE] pt-5 sm:flex-row sm:justify-end">
            <button type="button" onClick={resetForm} className="rounded-xl border border-[#E4EBE7] px-5 py-3 text-sm font-semibold text-[#53645D]">Cancel</button>
            <button disabled={saving} type="submit" className="flex items-center justify-center gap-2 rounded-xl bg-[#176D68] px-6 py-3 text-sm font-semibold text-white disabled:opacity-60">
              {saving ? <Loader2 size={17} className="animate-spin" /> : <Upload size={17} />}
              {saving ? "Saving..." : editing ? "Save changes" : "Create announcement"}
            </button>
          </div>
        </form>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9AA9A1]" />
          <input className={`${inputClass} pl-10`} value={search} onChange={e => setSearch(e.target.value)} placeholder="Search announcements..." />
        </div>
        <div className="relative sm:w-52">
          <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9AA9A1]" />
          <select className={`${inputClass} pl-9`} value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
            <option value="All">All categories</option>
            {CATEGORIES.map(category => <option key={category}>{category}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="animate-spin text-[#176D68]" size={30} /></div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#DCE7E1] bg-white py-16 text-center">
          <Megaphone size={34} className="mx-auto text-[#AAB8B0]" />
          <h3 className="mt-3 font-bold text-[#344640]">No announcements found</h3>
          <p className="mt-1 text-sm text-[#81918B]">Create your first announcement to get started.</p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {filtered.map(item => (
            <article key={item.id} className="overflow-hidden rounded-2xl border border-[#E6ECE8] bg-white shadow-sm">
              {item.image_url && <img src={item.image_url} alt="" className="h-44 w-full object-cover" />}
              <div className="space-y-3 p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${priorityStyle[item.priority] || priorityStyle.Normal}`}>{item.priority}</span>
                  <span className="rounded-full bg-[#EFF5F2] px-2.5 py-1 text-[10px] font-bold text-[#176D68]">{item.category}</span>
                  <span className={`ml-auto rounded-full px-2.5 py-1 text-[10px] font-bold ${item.is_published ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                    {item.is_published ? "Published" : "Draft"}
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#20302D]">{item.title}</h3>
                  <p className="mt-2 line-clamp-3 whitespace-pre-wrap text-sm leading-6 text-[#71827C]">{item.content}</p>
                </div>
                <div className="flex flex-wrap gap-3 text-xs text-[#81918B]">
                  <span className="flex items-center gap-1"><CalendarDays size={14} /> {new Date(item.created_at).toLocaleDateString()}</span>
                  <span className="flex items-center gap-1"><Users size={14} /> {item.target_audience === "All" ? "All students" : item.target_department}</span>
                  {item.expires_at && <span className="flex items-center gap-1"><Clock size={14} /> Expires {new Date(item.expires_at).toLocaleDateString()}</span>}
                </div>
                <div className="flex flex-wrap items-center gap-2 border-t border-[#EDF1EE] pt-3">
                  <button onClick={() => togglePublish(item)} className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold ${item.is_published ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>
                    {item.is_published ? <EyeOff size={14} /> : <Eye size={14} />}
                    {item.is_published ? "Unpublish" : "Publish"}
                  </button>
                  <button onClick={() => openEdit(item)} className="flex items-center gap-1.5 rounded-lg bg-[#F1F5F3] px-3 py-2 text-xs font-semibold text-[#53645D]"><Edit3 size={14} /> Edit</button>
                  <button onClick={() => deleteAnnouncement(item)} className="ml-auto flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600"><Trash2 size={14} /> Delete</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-[#E6ECE8] bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-[#81918B]">{label}</span>
        <Icon size={18} className="text-[#176D68]" />
      </div>
      <p className="mt-2 text-2xl font-bold text-[#20302D]">{value}</p>
    </div>
  );
}
