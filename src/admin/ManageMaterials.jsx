
import React, { useEffect, useMemo, useRef, useState } from "react";
import { BookOpen, Upload, Search, Plus, Trash2, Pencil, X, FileArchive, FileText, Image, Download, CheckCircle2, AlertCircle, LoaderCircle, Eye, EyeOff, ChevronUp, ChevronDown } from "lucide-react";
import { supabase } from "../services/supabase";

const BUCKET = "study-materials";
const MAX_FILE_SIZE = 50 * 1024 * 1024;
const MAX_IMAGES = 50;

const emptyForm = { course_id: "", week_number: "1", topic: "", description: "" };

const formatSize = (bytes = 0) => bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
const formatDate = (date) => new Date(date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

const DRAFT_SESSION_KEY = "outlierssource_material_draft";
const DRAFT_DB_NAME = "outlierssource_materials";
const DRAFT_STORE_NAME = "draft_files";

const openDraftDB = () => new Promise((resolve, reject) => {
  const request = indexedDB.open(DRAFT_DB_NAME, 1);
  request.onupgradeneeded = () => {
    const db = request.result;
    if (!db.objectStoreNames.contains(DRAFT_STORE_NAME)) db.createObjectStore(DRAFT_STORE_NAME, { keyPath: "id" });
  };
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error);
});

const saveDraftFiles = async (images, documents) => {
  const db = await openDraftDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(DRAFT_STORE_NAME, "readwrite");
    transaction.objectStore(DRAFT_STORE_NAME).put({
      id: "current",
      images: images.map(file => ({ name: file.name, type: file.type, lastModified: file.lastModified, blob: file })),
      documents: documents.map(file => ({ name: file.name, type: file.type, lastModified: file.lastModified, blob: file }))
    });
    transaction.oncomplete = () => { db.close(); resolve(); };
    transaction.onerror = () => { db.close(); reject(transaction.error); };
  });
};

const readDraftFiles = async () => {
  const db = await openDraftDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(DRAFT_STORE_NAME, "readonly");
    const request = transaction.objectStore(DRAFT_STORE_NAME).get("current");
    request.onsuccess = () => {
      const data = request.result;
      db.close();

      const restore = file => new File([file.blob], file.name, {
        type: file.type,
        lastModified: file.lastModified
      });

      resolve({
        images: (data?.images || []).map(restore),
        documents: (data?.documents || []).map(restore)
      });
    };
    request.onerror = () => { db.close(); reject(request.error); };
  });
};

const clearDraftFiles = async () => {
  const db = await openDraftDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(DRAFT_STORE_NAME, "readwrite");
    transaction.objectStore(DRAFT_STORE_NAME).delete("current");
    transaction.oncomplete = () => { db.close(); resolve(); };
    transaction.onerror = () => { db.close(); reject(transaction.error); };
  });
};


export default function ManageMaterials() {
  const [courses, setCourses] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [files, setFiles] = useState({});
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState("");
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [images, setImages] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [message, setMessage] = useState({ type: "", text: "" });
  const documentInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const [draftReady, setDraftReady] = useState(false);

  useEffect(() => { fetchData(); }, []);

  
// RESTORE SAVED FORM AFTER RELOAD OR APP SWITCH
useEffect(() => {
  let cancelled = false;

  const restoreDraft = async () => {
    try {
      const saved = JSON.parse(sessionStorage.getItem(DRAFT_SESSION_KEY) || "null");
      const savedFiles = await readDraftFiles();

      if (cancelled) return;

      const hasFiles = savedFiles.images.length > 0 || savedFiles.documents.length > 0;

      if (saved?.showForm || hasFiles) {
        setForm({ ...emptyForm, ...(saved?.form || {}) });
        setEditing(saved?.editing || null);
        setImages(savedFiles.images);
        setDocuments(savedFiles.documents);
        setShowForm(true);

        setMessage({
          type: "success",
          text: "Your previous upload draft has been restored."
        });
      }
    } catch (error) {
      console.error("Draft restoration error:", error);
    } finally {
      if (!cancelled) setDraftReady(true);
    }
  };

  restoreDraft();
  return () => { cancelled = true; };
}, []);

// SAVE FORM INFORMATION AUTOMATICALLY
useEffect(() => {
  if (!draftReady || !showForm) return;

  sessionStorage.setItem(DRAFT_SESSION_KEY, JSON.stringify({
    showForm: true,
    form,
    editing
  }));
}, [draftReady, showForm, form, editing]);

// SAVE SELECTED FILES AUTOMATICALLY
useEffect(() => {
  if (!draftReady || !showForm) return;

  saveDraftFiles(images, documents).catch(error => {
    console.error("Draft files could not be saved:", error);
    setMessage({
      type: "error",
      text: "Unable to save your selected files temporarily. Please keep this page open."
    });
  });
}, [draftReady, showForm, images, documents]);

  
  // FETCH DATA
  const fetchData = async () => {
    setLoading(true);
    try {
      const [courseResult, materialResult] = await Promise.all([
        supabase.from("courses").select("id, course_name, course_code, department").order("course_code"),
        supabase.from("materials").select("*").order("created_at", { ascending: false })
      ]);

      if (courseResult.error) throw courseResult.error;
      if (materialResult.error) throw materialResult.error;

      setCourses(courseResult.data || []);
      setMaterials(materialResult.data || []);

      const ids = (materialResult.data || []).map(item => item.id);

      if (ids.length) {
        const { data, error } = await supabase.from("material_files").select("*").in("material_id", ids);
        if (error) throw error;

        const grouped = {};
        (data || []).forEach(file => {
          if (!grouped[file.material_id]) grouped[file.material_id] = [];
          grouped[file.material_id].push(file);
        });
        setFiles(grouped);
      } else {
        setFiles({});
      }
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // STATISTICS AND FILTERING
  const stats = useMemo(() => ({
    total: materials.length,
    published: materials.filter(m => m.is_published).length,
    drafts: materials.filter(m => !m.is_published).length
  }), [materials]);

  const filteredMaterials = useMemo(() => materials.filter(item => {
    const course = courses.find(c => c.id === item.course_id);
    const query = search.toLowerCase();
    const matchesSearch = (item.topic || item.title || "").toLowerCase().includes(query) || (course?.course_code || "").toLowerCase().includes(query) || (course?.course_name || "").toLowerCase().includes(query);
    return matchesSearch && (courseFilter === "all" || item.course_id === courseFilter);
  }), [materials, courses, search, courseFilter]);

  // FORM CONTROLS
  const resetForm = () => {
  setEditing(null);
  setForm(emptyForm);
  setImages([]);
  setDocuments([]);
  setShowForm(false);

  sessionStorage.removeItem(DRAFT_SESSION_KEY);
  clearDraftFiles().catch(error => console.error("Draft cleanup error:", error));
};
  const openNew = () => {
  setEditing(null);
  setForm(emptyForm);
  setImages([]);
  setDocuments([]);
  setMessage({ type: "", text: "" });
  setShowForm(true);
};

const openEdit = material => {
  setEditing(material);
  setForm({
    course_id: material.course_id || "",
    week_number: String(material.week_number || 1),
    topic: material.topic || material.title || "",
    description: material.description || ""
  });
  setImages([]);
  setDocuments([]);
  setMessage({ type: "", text: "" });
  setShowForm(true);
  window.scrollTo({ top: 0, behavior: "smooth" });
};

  // IMAGE SELECTION
  const handleImages = event => {
    const selected = Array.from(event.target.files || []);
    event.target.value = "";

    if (selected.length + images.length > MAX_IMAGES) {
      setMessage({ type: "error", text: "Maximum of 50 pictures per material." });
      return;
    }

    if (selected.some(file => !file.type.startsWith("image/"))) {
      setMessage({ type: "error", text: "Select image files only." });
      return;
    }

    setImages(previous => [...previous, ...selected]);
    setMessage({ type: "", text: "" });
  };

  // DOCUMENT SELECTION
  const handleDocuments = event => {
    const selected = Array.from(event.target.files || []);
    event.target.value = "";
    const allowed = /\.(pdf|doc|docx|ppt|pptx|xls|xlsx|txt)$/i;

    if (selected.some(file => !allowed.test(file.name))) {
      setMessage({ type: "error", text: "Unsupported document format." });
      return;
    }

    setDocuments(previous => [...previous, ...selected]);
    setMessage({ type: "", text: "" });
  };

  // CREATE IMAGE ZIP
  const createImageZip = async () => {
    const [compressionModule, zipModule] = await Promise.all([
      import("browser-image-compression"),
      import("jszip")
    ]);

    const imageCompression = compressionModule.default || compressionModule;
    const JSZip = zipModule.default || zipModule;
    const zip = new JSZip();

    for (let i = 0; i < images.length; i++) {
      setProgress(`Optimising picture ${i + 1}/${images.length}`);
      const compressed = await imageCompression(images[i], {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 1600,
        useWebWorker: true,
        fileType: "image/webp"
      });

      const name = images[i].name.replace(/\.[^.]+$/, "");
      zip.file(`${name}.webp`, compressed);
    }

    setProgress("Creating pictures ZIP...");
    return zip.generateAsync({ type: "blob", compression: "DEFLATE", compressionOptions: { level: 3 } });
  };

  // CREATE DOCUMENT ZIP
  const createDocumentZip = async () => {
    const { default: JSZip } = await import("jszip");
    const zip = new JSZip();

    documents.forEach((file, index) => {
      let name = file.name;

      if (documents.findIndex(f => f.name === name) !== index) {
        const extension = name.includes(".") ? name.slice(name.lastIndexOf(".")) : "";
        const base = extension ? name.slice(0, -extension.length) : name;
        name = `${base}-${index + 1}${extension}`;
      }

      zip.file(name, file);
    });

    setProgress("Packaging documents...");
    return zip.generateAsync({ type: "blob", compression: "DEFLATE", compressionOptions: { level: 3 } });
  };

  // UPLOAD ARCHIVE
  const uploadArchive = async (materialId, blob, fileType, fileName) => {
    if (!blob.size) throw new Error(`${fileName} is empty.`);
    if (blob.size > MAX_FILE_SIZE) throw new Error(`${fileName} exceeds the 50 MB upload limit. Current size: ${formatSize(blob.size)}`);

    const uniqueId = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const storagePath = `${materialId}/${uniqueId}.zip`;

    setProgress(`Uploading ${fileName}...`);

    const { error: uploadError } = await supabase.storage.from(BUCKET).upload(storagePath, blob, {
      contentType: "application/zip",
      upsert: false
    });

    if (uploadError) throw uploadError;

    const { error: databaseError } = await supabase.from("material_files").insert({
      material_id: materialId,
      file_name: fileName,
      storage_path: storagePath,
      file_type: fileType,
      file_size: blob.size
    });

    if (databaseError) {
      await supabase.storage.from(BUCKET).remove([storagePath]);
      throw databaseError;
    }

    return storagePath;
  };

  // SAVE MATERIAL
  const handleSave = async event => {
    event.preventDefault();

    if (!form.course_id || !form.topic.trim()) {
      setMessage({ type: "error", text: "Select a course and enter a topic." });
      return;
    }

    if (!editing && !images.length && !documents.length) {
      setMessage({ type: "error", text: "Select at least one picture or document." });
      return;
    }

    setUploading(true);
    setMessage({ type: "", text: "" });

    let materialId = editing?.id;
    const uploadedPaths = [];

    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData.user) throw new Error("Your session has expired. Log in again.");

      const materialData = {
        course_id: form.course_id,
        week_number: Number(form.week_number),
        topic: form.topic.trim(),
        title: form.topic.trim(),
        description: form.description.trim() || null,
        category: "Lecture Material",
        class_id: null,
        is_published: editing?.is_published ?? false,
        updated_at: new Date().toISOString()
      };

      if (!editing) {
        materialData.created_by = authData.user.id;
        materialData.uploaded_by = authData.user.id;
      }

      if (editing) {
        setProgress("Updating material...");
        const { error } = await supabase.from("materials").update(materialData).eq("id", editing.id);
        if (error) throw error;
      } else {
        setProgress("Creating material...");
        const { data, error } = await supabase.from("materials").insert(materialData).select().single();
        if (error) throw error;
        materialId = data.id;
      }

      if (images.length) {
        const blob = await createImageZip();
        uploadedPaths.push(await uploadArchive(materialId, blob, "images_zip", "Lecture Pictures.zip"));
      }

      if (documents.length) {
        const blob = await createDocumentZip();
        uploadedPaths.push(await uploadArchive(materialId, blob, "documents_zip", "Lecture Documents.zip"));
      }

      setProgress("Refreshing materials...");
      resetForm();
      await fetchData();

      setMessage({
        type: "success",
        text: editing ? "Material updated successfully." : "Material uploaded successfully as a draft."
      });
    } catch (error) {
      console.error("Material upload error:", error);

      if (uploadedPaths.length) {
        await supabase.storage.from(BUCKET).remove(uploadedPaths);
        await supabase.from("material_files").delete().in("storage_path", uploadedPaths);
      }

      setMessage({ type: "error", text: error.message || "Unable to save material." });
    } finally {
      setUploading(false);
      setProgress("");
    }
  };

  // PUBLISH / UNPUBLISH
  const togglePublish = async material => {
    const { error } = await supabase.from("materials").update({
      is_published: !material.is_published,
      updated_at: new Date().toISOString()
    }).eq("id", material.id);

    if (error) {
      setMessage({ type: "error", text: error.message });
      return;
    }

    setMaterials(previous => previous.map(item => item.id === material.id ? { ...item, is_published: !item.is_published } : item));
  };

  // DELETE MATERIAL
  const deleteMaterial = async material => {
    if (!window.confirm(`Delete "${material.topic || material.title}" and its files?`)) return;

    try {
      const materialFiles = files[material.id] || [];
      const paths = materialFiles.map(file => file.storage_path);

      if (paths.length) {
        const { error } = await supabase.storage.from(BUCKET).remove(paths);
        if (error) throw error;
      }

      const { error: fileError } = await supabase.from("material_files").delete().eq("material_id", material.id);
      if (fileError) throw fileError;

      const { error } = await supabase.from("materials").delete().eq("id", material.id);
      if (error) throw error;

      setMaterials(previous => previous.filter(item => item.id !== material.id));
      setFiles(previous => {
        const next = { ...previous };
        delete next[material.id];
        return next;
      });

      setMessage({ type: "success", text: "Material deleted successfully." });
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    }
  };

  // DOWNLOAD ARCHIVE
  const downloadFile = async file => {
    const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(file.storage_path, 60, {
      download: file.file_name
    });

    if (error) {
      setMessage({ type: "error", text: error.message });
      return;
    }

    window.location.assign(data.signedUrl);
  };

  return (
    <div className="min-h-screen bg-[#F5F8F6] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* HEADER */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-[#176D68]">ADMINISTRATION</p>
            <h1 className="mt-1 text-2xl font-bold text-[#20302D] sm:text-3xl">Learning Materials</h1>
            <p className="mt-1 text-sm text-[#81918B]">Upload and organise course lecture materials.</p>
          </div>

          <button onClick={showForm ? () => resetForm() : openNew} disabled={uploading} className="flex items-center justify-center gap-2 rounded-xl bg-[#176D68] px-5 py-3 font-semibold text-white hover:bg-[#105A55] disabled:opacity-50">
            {showForm ? <ChevronUp size={19} /> : <Plus size={19} />}
            {showForm ? "Close Form" : "Upload Material"}
          </button>
        </div>

        {/* ALERT */}
        {message.text && (
          <div className={`flex items-start gap-3 rounded-xl p-4 text-sm ${message.type === "error" ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
            {message.type === "error" ? <AlertCircle size={19} /> : <CheckCircle2 size={19} />}
            <span className="flex-1">{message.text}</span>
            <button onClick={() => setMessage({ type: "", text: "" })}><X size={17} /></button>
          </div>
        )}

        {/* INLINE UPLOAD FORM */}
        {showForm && (
          <div className="overflow-hidden rounded-2xl border border-[#DCEAE3] bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-[#EDF1EE] bg-[#F8FBF9] p-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-[#176D68]">{editing ? "EDIT MATERIAL" : "NEW MATERIAL"}</p>
                <h2 className="mt-1 text-xl font-bold text-[#20302D]">{editing ? "Update Lecture Material" : "Upload Lecture Material"}</h2>
                <p className="mt-1 text-xs text-[#81918B]">Organise lecture files by course and week.</p>
              </div>
              <button type="button" onClick={resetForm} disabled={uploading} className="rounded-lg p-2 text-[#81918B] hover:bg-[#EFF7F4] disabled:opacity-40"><X size={21} /></button>
            </div>

            <form onSubmit={handleSave} className="space-y-5 p-5">
              {/* COURSE */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#20302D]">Course</label>
                <select required value={form.course_id} onChange={e => setForm({ ...form, course_id: e.target.value })} className="w-full rounded-xl border border-[#DDE7E1] bg-white p-3 outline-none focus:border-[#176D68]">
                  <option value="">Select course</option>
                  {courses.map(course => <option key={course.id} value={course.id}>{course.course_code} — {course.course_name}</option>)}
                </select>
              </div>

              {/* WEEK AND TOPIC */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#20302D]">Week</label>
                  <select value={form.week_number} onChange={e => setForm({ ...form, week_number: e.target.value })} className="w-full rounded-xl border border-[#DDE7E1] bg-white p-3 outline-none focus:border-[#176D68]">
                    {Array.from({ length: 20 }, (_, i) => <option key={i + 1} value={i + 1}>Week {i + 1}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#20302D]">Topic</label>
                  <input required value={form.topic} onChange={e => setForm({ ...form, topic: e.target.value })} placeholder="Introduction to Computing" className="w-full rounded-xl border border-[#DDE7E1] p-3 outline-none focus:border-[#176D68]" />
                </div>
              </div>

              {/* DESCRIPTION */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#20302D]">Description (optional)</label>
                <textarea rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Briefly describe this lecture material..." className="w-full resize-none rounded-xl border border-[#DDE7E1] p-3 outline-none focus:border-[#176D68]" />
              </div>

              {/* PICTURES */}
              <div className="rounded-xl border border-dashed border-[#B8D1C8] p-4">
                <div className="flex items-center gap-2">
                  <Image size={20} className="text-[#176D68]" />
                  <div>
                    <p className="font-semibold text-[#20302D]">Lecture Pictures</p>
                    <p className="text-xs text-[#81918B]">Up to 50 pictures, optimised and packaged into one ZIP.</p>
                  </div>
                </div>

                <input ref={imageInputRef} type="file" accept="image/*" multiple hidden onChange={handleImages} />
                <button type="button" onClick={() => imageInputRef.current?.click()} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#EFF7F4] p-3 text-sm font-semibold text-[#176D68] hover:bg-[#E4F0EB]">
                  <Upload size={18} /> Select Pictures
                </button>

                {images.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-sm font-semibold text-[#20302D]">{images.length}/50 pictures selected</p>
                    {images.map((file, index) => (
                      <div key={`${file.name}-${index}`} className="flex items-center justify-between gap-2 text-xs text-[#81918B]">
                        <span className="truncate">{file.name}</span>
                        <button type="button" disabled={uploading} onClick={() => setImages(previous => previous.filter((_, i) => i !== index))} className="shrink-0 text-red-500"><X size={16} /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* DOCUMENTS */}
              <div className="rounded-xl border border-dashed border-[#B8D1C8] p-4">
                <div className="flex items-center gap-2">
                  <FileText size={20} className="text-[#176D68]" />
                  <div>
                    <p className="font-semibold text-[#20302D]">Lecture Documents</p>
                    <p className="text-xs text-[#81918B]">PDF, Word, PowerPoint, Excel and TXT.</p>
                  </div>
                </div>
<label className="mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#EFF7F4] p-3 text-sm font-semibold text-[#176D68] hover:bg-[#E4F0EB]">
  <Upload size={18} />
  Select Documents
  <input
    type="file"
    accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt"
    multiple
    onChange={handleDocuments}
    className="hidden"
  />
</label>

                {documents.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-sm font-semibold text-[#20302D]">{documents.length} documents selected</p>
                    {documents.map((file, index) => (
                      <div key={`${file.name}-${index}`} className="flex items-center justify-between gap-2 text-xs text-[#81918B]">
                        <span className="truncate">{file.name}</span>
                        <button type="button" disabled={uploading} onClick={() => setDocuments(previous => previous.filter((_, i) => i !== index))} className="shrink-0 text-red-500"><X size={16} /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {editing && <p className="rounded-xl bg-amber-50 p-3 text-xs text-amber-800">New archives will be added to existing files. Existing archives will remain.</p>}

              {/* PROGRESS */}
              {uploading && (
                <div className="rounded-xl bg-[#EFF7F4] p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-[#176D68]"><LoaderCircle size={18} className="animate-spin" />{progress || "Processing..."}</div>
                  <p className="mt-1 text-xs text-[#81918B]">Keep this page open until processing finishes.</p>
                </div>
              )}

              {/* FORM ACTIONS */}
              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button type="button" disabled={uploading} onClick={resetForm} className="rounded-xl border border-[#DDE7E1] px-5 py-3 font-semibold text-[#52635B] disabled:opacity-50">Cancel</button>
                <button type="submit" disabled={uploading} className="flex items-center justify-center gap-2 rounded-xl bg-[#176D68] px-6 py-3 font-semibold text-white disabled:opacity-60">
                  {uploading ? <LoaderCircle size={18} className="animate-spin" /> : <Upload size={18} />}
                  {uploading ? "Processing..." : editing ? "Save Changes" : "Upload Material"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STATISTICS */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { label: "Total Materials", value: stats.total, icon: BookOpen },
            { label: "Published", value: stats.published, icon: CheckCircle2 },
            { label: "Drafts", value: stats.drafts, icon: FileArchive }
          ].map(stat => (
            <div key={stat.label} className="rounded-2xl border border-[#E7EEEA] bg-white p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-[#81918B]">{stat.label}</p>
                <stat.icon size={21} className="text-[#176D68]" />
              </div>
              <p className="mt-3 text-3xl font-bold text-[#20302D]">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* SEARCH AND FILTER */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#81918B]" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search topic or course..." className="w-full rounded-xl border border-[#E1EAE5] bg-white py-3 pl-10 pr-4 outline-none focus:border-[#176D68]" />
          </div>
          <select value={courseFilter} onChange={e => setCourseFilter(e.target.value)} className="rounded-xl border border-[#E1EAE5] bg-white px-4 py-3 outline-none focus:border-[#176D68]">
            <option value="all">All Courses</option>
            {courses.map(course => <option key={course.id} value={course.id}>{course.course_code} — {course.course_name}</option>)}
          </select>
        </div>

        {/* MATERIAL LIST */}
        {loading ? (
          <div className="flex justify-center rounded-2xl bg-white p-16"><LoaderCircle className="animate-spin text-[#176D68]" size={30} /></div>
        ) : filteredMaterials.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#D6E2DC] bg-white p-12 text-center">
            <FileArchive size={40} className="mx-auto text-[#A6B5AE]" />
            <h3 className="mt-4 font-bold text-[#20302D]">No materials found</h3>
            <p className="mt-1 text-sm text-[#81918B]">Upload your first lecture material.</p>
            {!showForm && <button onClick={openNew} className="mt-4 rounded-xl bg-[#176D68] px-5 py-2.5 text-sm font-semibold text-white">Upload Material</button>}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredMaterials.map(material => {
              const course = courses.find(item => item.id === material.course_id);
              const materialFiles = files[material.id] || [];

              return (
                <div key={material.id} className="rounded-2xl border border-[#E7EEEA] bg-white p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-bold uppercase text-[#176D68]">{course?.course_code || "Unknown Course"}</p>
                      <h3 className="mt-2 font-bold text-[#20302D]">{material.topic || material.title}</h3>
                      <p className="mt-1 text-xs text-[#81918B]">Week {material.week_number || "—"}</p>
                    </div>
                    <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${material.is_published ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>
                      {material.is_published ? "Published" : "Draft"}
                    </span>
                  </div>

                  {material.description && <p className="mt-3 line-clamp-2 text-sm text-[#81918B]">{material.description}</p>}

                  <div className="mt-4 space-y-2">
                    {materialFiles.map(file => (
                      <div key={file.id} className="flex items-center gap-3 rounded-xl bg-[#F5F8F6] p-3">
                        <FileArchive size={20} className="shrink-0 text-[#176D68]" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-[#20302D]">{file.file_name}</p>
                          <p className="text-xs text-[#81918B]">{formatSize(file.file_size)}</p>
                        </div>
                        <button onClick={() => downloadFile(file)} title="Download archive" className="rounded-lg p-2 text-[#176D68] hover:bg-white"><Download size={18} /></button>
                      </div>
                    ))}
                    {!materialFiles.length && <p className="rounded-lg bg-[#F5F8F6] p-3 text-xs text-[#81918B]">No uploaded files.</p>}
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-[#EDF1EE] pt-4">
                    <span className="text-xs text-[#81918B]">{formatDate(material.created_at)}</span>
                    <div className="flex items-center gap-1">
                      <button onClick={() => togglePublish(material)} title={material.is_published ? "Unpublish" : "Publish"} className="rounded-lg p-2 text-[#176D68] hover:bg-[#EFF7F4]">{material.is_published ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                      <button onClick={() => openEdit(material)} title="Edit" className="rounded-lg p-2 text-[#176D68] hover:bg-[#EFF7F4]"><Pencil size={18} /></button>
                      <button onClick={() => deleteMaterial(material)} title="Delete" className="rounded-lg p-2 text-red-500 hover:bg-red-50"><Trash2 size={18} /></button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
