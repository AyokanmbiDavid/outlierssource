
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  FileText,
  FileImage,
  FileSpreadsheet,
  Download,
  BookOpen,
  FolderOpen,
  SlidersHorizontal,
  Presentation,
  File,
  RefreshCw,
  AlertCircle,
  Paperclip,
  CalendarDays,
} from "lucide-react";

import { supabase } from "../services/supabase";

const BUCKET = "study-materials";

const categories = [
  "All Materials",
  "Lecture Notes",
  "Assignments",
  "Presentations",
  "Study Guides",
];

const getFileIcon = (file) => {
  const name = (file?.file_name || "").toLowerCase();
  const type = (file?.file_type || "").toLowerCase();

  if (name.endsWith(".pdf")) return FileText;
  if (name.endsWith(".ppt") || name.endsWith(".pptx")) return Presentation;
  if (name.endsWith(".xls") || name.endsWith(".xlsx") || name.endsWith(".csv")) {
    return FileSpreadsheet;
  }
  if (name.match(/\.(png|jpg|jpeg|webp|gif)$/)) return FileImage;
  if (type.includes("images")) return FileImage;

  return File;
};

const formatSize = (bytes) => {
  if (!bytes || Number(bytes) <= 0) return "Unknown size";

  const size = Number(bytes);

  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

const formatDate = (date) => {
  if (!date) return "Date unavailable";

  return new Date(date).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const getFileLabel = (file) => {
  const name = (file?.file_name || "").toLowerCase();
  const type = (file?.file_type || "").toLowerCase();

  if (name.endsWith(".pdf")) return "PDF";
  if (name.endsWith(".ppt") || name.endsWith(".pptx")) return "PPT";
  if (name.endsWith(".xlsx") || name.endsWith(".xls")) return "XLSX";
  if (name.endsWith(".doc") || name.endsWith(".docx")) return "DOC";
  if (name.endsWith(".zip") || type.includes("_zip")) return "ZIP";

  return name.split(".").pop()?.toUpperCase() || "FILE";
};

function MaterialCard({ material }) {
  const [downloading, setDownloading] = useState(null);

  const files = material.files || [];

  const Icon = files.length
    ? getFileIcon(files[0])
    : FileText;

  const downloadFile = async (file) => {
    if (!file?.url) return;

    setDownloading(file.id);

    try {
      const link = document.createElement("a");
      link.href = file.url;
      link.download = file.file_name || "material";
      link.target = "_blank";
      link.rel = "noopener noreferrer";

      document.body.appendChild(link);
      link.click();
      link.remove();
    } finally {
      setDownloading(null);
    }
  };

  return (
    <article className="bg-white rounded-[22px] p-5 hover:shadow-lg hover:shadow-[#176D68]/5 transition-all duration-200">
      <div className="flex items-start justify-between gap-3">
        <div className="w-12 h-12 rounded-2xl bg-[#E4F2EF] text-[#176D68] grid place-items-center">
          <Icon size={23} />
        </div>

        <span className="px-3 py-1.5 rounded-full bg-[#F1F5F3] text-[11px] font-semibold text-[#71827C]">
          {files.length ? `${files.length} attachment${files.length > 1 ? "s" : ""}` : "No attachment"}
        </span>
      </div>

      <div className="mt-5">
        <p className="text-xs font-semibold text-[#176D68]">
          {material.course_code || "Course"} · {material.category || "General"}
        </p>

        <h3 className="text-[16px] font-bold text-[#20302D] mt-2 leading-snug">
          {material.title}
        </h3>

        {material.topic && (
          <p className="text-xs font-semibold text-[#71827C] mt-2">
            {material.topic}
            {material.week_number ? ` · Week ${material.week_number}` : ""}
          </p>
        )}

        <p className="text-sm text-[#81918B] mt-2 leading-relaxed min-h-[42px]">
          {material.description || "No description provided for this material."}
        </p>
      </div>

      <div className="mt-5 pt-4 border-t border-[#F1F5F3]">
        <div className="flex items-center justify-between text-xs text-[#81918B] mb-3">
          <span className="flex items-center gap-1.5">
            <CalendarDays size={13} />
            {formatDate(material.updated_at || material.created_at)}
          </span>

          <span>
            {formatSize(
              files.reduce((total, file) => total + Number(file.file_size || 0), 0)
            )}
          </span>
        </div>

        {files.length > 0 ? (
          <div className="space-y-2">
            {files.map((file) => {
              const FileIcon = getFileIcon(file);

              return (
                <div
                  key={file.id}
                  className="flex items-center gap-2 p-3 rounded-xl bg-[#F5F8F6]"
                >
                  <FileIcon size={17} className="text-[#176D68] shrink-0" />

                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-[#20302D] truncate">
                      {file.file_name || "Attached file"}
                    </p>

                    <p className="text-[10px] text-[#81918B] mt-1">
                      {getFileLabel(file)} · {formatSize(file.file_size)}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => downloadFile(file)}
                    disabled={!file.url || downloading === file.id}
                    className="w-9 h-9 rounded-full bg-[#E4F2EF] text-[#176D68] grid place-items-center hover:bg-[#176D68] hover:text-white disabled:opacity-40 transition-colors"
                    aria-label={`Download ${file.file_name}`}
                  >
                    {downloading === file.id ? (
                      <RefreshCw size={15} className="animate-spin" />
                    ) : (
                      <Download size={16} />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-[#A0ACA7]">
            No downloadable files attached.
          </p>
        )}
      </div>
    </article>
  );
}

export default function Materials() {
  const [materials, setMaterials] = useState([]);
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Materials");
  const [course, setCourse] = useState("All Courses");
  const [fileType, setFileType] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const fetchMaterials = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);

    setError("");

    try {
      const [materialsResult, coursesResult] = await Promise.all([
        supabase
          .from("materials")
          .select(`
            id,
            title,
            description,
            course_id,
            category,
            file_name,
            file_path,
            file_type,
            file_size,
            is_published,
            created_at,
            updated_at,
            week_number,
            topic
          `)
          .eq("is_published", true)
          .order("created_at", { ascending: false }),

        supabase
          .from("courses")
          .select("id, course_name, course_code, department"),
      ]);

      if (materialsResult.error) throw materialsResult.error;
      if (coursesResult.error) throw coursesResult.error;

      const materialRows = materialsResult.data || [];
      const courseRows = coursesResult.data || [];

      setCourses(courseRows);

      const courseMap = new Map(
        courseRows.map((item) => [item.id, item])
      );

      const materialIds = materialRows.map((item) => item.id);

      let fileRows = [];

      if (materialIds.length) {
        const { data, error: filesError } = await supabase
          .from("material_files")
          .select(`
            id,
            material_id,
            file_name,
            storage_path,
            file_type,
            file_size,
            created_at
          `)
          .in("material_id", materialIds)
          .order("created_at", { ascending: true });

        if (filesError) throw filesError;

        fileRows = data || [];
      }

      const groupedFiles = new Map();

      for (const file of fileRows) {
        if (!groupedFiles.has(file.material_id)) {
          groupedFiles.set(file.material_id, []);
        }

        groupedFiles.get(file.material_id).push(file);
      }

      const formattedMaterials = await Promise.all(
        materialRows.map(async (material) => {
          const courseInfo = courseMap.get(material.course_id);

          let attachments = groupedFiles.get(material.id) || [];

          // Support older materials stored directly on the materials table.
          if (!attachments.length && material.file_path) {
            attachments = [
              {
                id: `legacy-${material.id}`,
                material_id: material.id,
                file_name: material.file_name || "Download material",
                storage_path: material.file_path,
                file_type: material.file_type,
                file_size: material.file_size,
              },
            ];
          }

          const signedFiles = await Promise.all(
            attachments.map(async (file) => {
              const { data, error: signedError } = await supabase.storage
                .from(BUCKET)
                .createSignedUrl(file.storage_path, 3600);

              return {
                ...file,
                url: signedError ? null : data?.signedUrl || null,
              };
            })
          );

          return {
            ...material,
            course_name: courseInfo?.course_name || "Unknown course",
            course_code: courseInfo?.course_code || "N/A",
            department: courseInfo?.department || "",
            files: signedFiles,
          };
        })
      );

      setMaterials(formattedMaterials);
    } catch (err) {
      console.error("Materials fetch error:", err);
      setError(err.message || "Unable to load learning materials.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchMaterials();

    const channel = supabase
      .channel("student-learning-materials")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "materials" },
        () => fetchMaterials(true)
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "material_files" },
        () => fetchMaterials(true)
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "courses" },
        () => fetchMaterials(true)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchMaterials]);

  const filteredMaterials = useMemo(() => {
    const query = search.toLowerCase().trim();

    return materials.filter((item) => {
      const matchesSearch =
        !query ||
        item.title?.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        item.course_name?.toLowerCase().includes(query) ||
        item.course_code?.toLowerCase().includes(query) ||
        item.topic?.toLowerCase().includes(query);

      const matchesCategory =
        category === "All Materials" ||
        item.category === category;

      const matchesCourse =
        course === "All Courses" ||
        item.course_id === course;

      const matchesType =
        fileType === "All" ||
        item.files?.some((file) => getFileLabel(file) === fileType);

      return (
        matchesSearch &&
        matchesCategory &&
        matchesCourse &&
        matchesType
      );
    });
  }, [materials, search, category, course, fileType]);

  const resetFilters = () => {
    setSearch("");
    setCategory("All Materials");
    setCourse("All Courses");
    setFileType("All");
  };

  const stats = useMemo(() => [
    {
      label: "Total Resources",
      value: materials.length,
      icon: FolderOpen,
    },
    {
      label: "Lecture Notes",
      value: materials.filter((m) => m.category === "Lecture Notes").length,
      icon: BookOpen,
    },
    {
      label: "Assignments",
      value: materials.filter((m) => m.category === "Assignments").length,
      icon: FileText,
    },
    {
      label: "Presentations",
      value: materials.filter((m) => m.category === "Presentations").length,
      icon: Presentation,
    },
  ], [materials]);

  return (
    <div className="space-y-7 pb-6">

      <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-sm text-[#81918B]">
            Your academic library
          </p>

          <h1 className="text-2xl sm:text-3xl font-bold text-[#20302D] mt-1">
            Learning Materials
          </h1>

          <p className="text-sm text-[#81918B] mt-2">
            Access your lecture notes, assignments and study resources.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#E4F2EF] text-[#176D68] px-4 py-3 rounded-2xl">
            <FolderOpen size={19} />
            <span className="text-sm font-semibold">
              {materials.length} Resources
            </span>
          </div>

          <button
            type="button"
            onClick={() => fetchMaterials(true)}
            disabled={refreshing}
            className="w-11 h-11 rounded-2xl bg-white text-[#176D68] grid place-items-center hover:bg-[#E4F2EF] disabled:opacity-50"
            aria-label="Refresh materials"
          >
            <RefreshCw
              size={18}
              className={refreshing ? "animate-spin" : ""}
            />
          </button>
        </div>
      </section>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-700 rounded-2xl p-4 flex gap-3">
          <AlertCircle size={20} className="shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-semibold">Unable to load materials</p>
            <p className="text-xs mt-1 break-words">{error}</p>
            <button
              type="button"
              onClick={() => fetchMaterials(true)}
              className="text-xs font-bold underline mt-2"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((item) => {
          const Icon = item.icon;

          return (
            <div key={item.label} className="bg-white rounded-[20px] p-4 sm:p-5">
              <div className="w-9 h-9 rounded-xl bg-[#E4F2EF] text-[#176D68] grid place-items-center">
                <Icon size={18} />
              </div>

              <h2 className="text-2xl font-bold text-[#20302D] mt-4">
                {loading ? "—" : item.value}
              </h2>

              <p className="text-xs text-[#81918B] mt-1">
                {item.label}
              </p>
            </div>
          );
        })}
      </section>

      <section className="bg-white rounded-[22px] p-4 sm:p-5 space-y-5">
        <div className="relative">
          <Search
            size={19}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#81918B]"
          />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search materials, courses or topics..."
            className="w-full h-12 pl-12 pr-4 rounded-full bg-[#F5F8F6] text-sm text-[#20302D] outline-none focus:ring-2 focus:ring-[#176D68]/20"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {categories.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setCategory(item)}
              className={`whitespace-nowrap px-4 py-2.5 rounded-full text-xs font-semibold transition-colors ${
                category === item
                  ? "bg-[#176D68] text-white"
                  : "bg-[#F1F5F3] text-[#71827C] hover:bg-[#E4F2EF]"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative">
            <BookOpen
              size={17}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#81918B] pointer-events-none"
            />

            <select
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              className="w-full h-12 pl-11 pr-4 rounded-full bg-[#F5F8F6] text-sm text-[#53645E] outline-none appearance-none"
            >
              <option value="All Courses">All Courses</option>

              {courses.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.course_code} — {item.course_name}
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <SlidersHorizontal
              size={17}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#81918B] pointer-events-none"
            />

            <select
              value={fileType}
              onChange={(e) => setFileType(e.target.value)}
              className="w-full h-12 pl-11 pr-4 rounded-full bg-[#F5F8F6] text-sm text-[#53645E] outline-none appearance-none"
            >
              <option value="All">All File Types</option>
              <option value="PDF">PDF</option>
              <option value="PPT">PowerPoint</option>
              <option value="XLSX">Excel</option>
              <option value="DOC">Word Documents</option>
              <option value="ZIP">ZIP Archives</option>
            </select>
          </div>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-[#20302D]">
              Available Resources
            </h2>

            <p className="text-xs text-[#81918B] mt-1">
              Showing {filteredMaterials.length} resources
            </p>
          </div>

          <button
            type="button"
            onClick={resetFilters}
            className="text-xs font-semibold text-[#176D68]"
          >
            Reset filters
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-64 rounded-[22px] bg-white animate-pulse"
              />
            ))}
          </div>
        ) : filteredMaterials.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
            {filteredMaterials.map((material) => (
              <MaterialCard
                key={material.id}
                material={material}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-[24px] p-10 text-center">
            <div className="w-14 h-14 rounded-full bg-[#E4F2EF] text-[#176D68] grid place-items-center mx-auto">
              <Search size={23} />
            </div>

            <h3 className="font-bold text-[#20302D] mt-4">
              {materials.length ? "No materials found" : "No materials available yet"}
            </h3>

            <p className="text-sm text-[#81918B] mt-2">
              {materials.length
                ? "Try a different search or adjust your filters."
                : "Published learning materials will appear here when your administrator uploads them."}
            </p>

            <button
              type="button"
              onClick={resetFilters}
              className="mt-5 text-sm font-semibold text-[#176D68]"
            >
              Clear filters
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
