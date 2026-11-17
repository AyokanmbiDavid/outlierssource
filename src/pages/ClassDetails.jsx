
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  GraduationCap,
  Download,
  FileText,
  Image,
  FolderOpen,
  Search,
  RefreshCw,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  CalendarDays,
  Building2,
  Award,
  Package,
  FileArchive,
  Clock3,
  ExternalLink,
} from "lucide-react";

import { supabase } from "../services/supabase";

const BUCKET = "study-materials";

const formatDate = (value) => {
  if (!value) return "Date unavailable";

  return new Date(value).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatSize = (bytes) => {
  if (!bytes) return "File size unavailable";

  const size = Number(bytes);

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(0)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(2)} MB`;
};

const getFileLabel = (type) => {
  switch (type) {
    case "images_zip":
      return "Slides and Images";
    case "documents_zip":
      return "Documents";
    default:
      return "Course Material";
  }
};

const getFileIcon = (type) => {
  if (type === "images_zip") return Image;
  if (type === "documents_zip") return FileText;
  return FileArchive;
};

function MaterialFile({ file }) {
  const Icon = getFileIcon(file.file_type);

  const handleDownload = () => {
    if (!file.downloadUrl) return;

    const link = document.createElement("a");
    link.href = file.downloadUrl;
    link.download = file.file_name || "course-material.zip";
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-[#EDF2EF]">
      <div className="w-11 h-11 shrink-0 rounded-xl bg-[#E4F2EF] text-[#176D68] grid place-items-center">
        <Icon size={21} />
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-[#20302D] truncate">
          {file.file_name || getFileLabel(file.file_type)}
        </h4>

        <div className="flex flex-wrap gap-2 text-[11px] text-[#81918B] mt-1">
          <span>{getFileLabel(file.file_type)}</span>
          <span>•</span>
          <span>{formatSize(file.file_size)}</span>
        </div>
      </div>

      <button
        onClick={handleDownload}
        disabled={!file.downloadUrl}
        className="w-10 h-10 shrink-0 rounded-xl bg-[#E4F2EF] text-[#176D68] grid place-items-center hover:bg-[#176D68] hover:text-white transition disabled:opacity-40"
        title="Download material"
        aria-label={`Download ${file.file_name}`}
      >
        <Download size={18} />
      </button>
    </div>
  );
}

function MaterialCard({ material }) {
  const [expanded, setExpanded] = useState(true);

  const files = material.files || [];

  return (
    <div className="bg-white rounded-[22px] overflow-hidden border border-[#EDF2EF]">
      <button
        onClick={() => setExpanded((value) => !value)}
        className="w-full flex items-center gap-3 p-4 sm:p-5 text-left"
      >
        <div className="w-11 h-11 shrink-0 rounded-xl bg-[#E4F2EF] text-[#176D68] grid place-items-center">
          <FolderOpen size={21} />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-sm sm:text-base font-bold text-[#20302D]">
            {material.title}
          </h3>

          <p className="text-xs text-[#81918B] mt-1">
            {material.topic || material.category || "Course material"}
          </p>

          <p className="text-[11px] text-[#A0ADA8] mt-1">
            Uploaded {formatDate(material.created_at)}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[#176D68] hidden sm:block">
            {files.length} {files.length === 1 ? "file" : "files"}
          </span>

          {expanded ? (
            <ChevronUp size={19} className="text-[#81918B]" />
          ) : (
            <ChevronDown size={19} className="text-[#81918B]" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="px-4 sm:px-5 pb-5">
          {material.description && (
            <p className="text-sm text-[#71827C] leading-relaxed mb-4">
              {material.description}
            </p>
          )}

          {files.length > 0 ? (
            <div className="space-y-2">
              {files.map((file) => (
                <MaterialFile key={file.id || file.storage_path} file={file} />
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#81918B] py-3">
              No downloadable files are attached to this material.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default function ClassDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchCourseDetails = useCallback(async (manual = false) => {
    try {
      if (manual) setRefreshing(true);
      else setLoading(true);

      setError("");

      // Fetch the selected course.
      const { data: courseData, error: courseError } = await supabase
        .from("courses")
        .select(`
          id,
          course_name,
          course_code,
          department,
          course_type,
          credit_units,
          created_at,
          updated_at
        `)
        .eq("id", id)
        .single();

      if (courseError) throw courseError;

      // Fetch every published material attached to this course.
      const { data: materialData, error: materialError } = await supabase
        .from("materials")
        .select(`
          id,
          title,
          description,
          category,
          file_name,
          file_path,
          file_type,
          file_size,
          course_id,
          week_number,
          topic,
          created_at,
          updated_at
        `)
        .eq("course_id", id)
        .eq("is_published", true)
        .order("week_number", { ascending: true })
        .order("created_at", { ascending: false });

      if (materialError) throw materialError;

      const materialIds = (materialData || []).map((item) => item.id);

      // Fetch attached archive files.
      let attachedFiles = [];

      if (materialIds.length > 0) {
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
          .in("material_id", materialIds);

        if (filesError) throw filesError;

        attachedFiles = data || [];
      }

      // Generate temporary download links for private Storage files.
      const filesByMaterial = new Map();

      for (const file of attachedFiles) {
        const { data: signedData, error: signedError } =
          await supabase.storage
            .from(BUCKET)
            .createSignedUrl(file.storage_path, 3600);

        const preparedFile = {
          ...file,
          downloadUrl: signedError ? null : signedData?.signedUrl,
        };

        if (!filesByMaterial.has(file.material_id)) {
          filesByMaterial.set(file.material_id, []);
        }

        filesByMaterial.get(file.material_id).push(preparedFile);
      }

      // Support the older single-file material fields too.
      const preparedMaterials = await Promise.all(
        (materialData || []).map(async (material) => {
          const files = [...(filesByMaterial.get(material.id) || [])];

          if (material.file_path) {
            const alreadyIncluded = files.some(
              (file) => file.storage_path === material.file_path
            );

            if (!alreadyIncluded) {
              const { data: signedData, error: signedError } =
                await supabase.storage
                  .from(BUCKET)
                  .createSignedUrl(material.file_path, 3600);

              files.push({
                id: `legacy-${material.id}`,
                file_name: material.file_name || material.title,
                file_type: material.file_type || "other_archive",
                file_size: material.file_size,
                storage_path: material.file_path,
                downloadUrl: signedError ? null : signedData?.signedUrl,
              });
            }
          }

          return {
            ...material,
            files,
          };
        })
      );

      setCourse(courseData);
      setMaterials(preparedMaterials);

    } catch (err) {
      console.error("Course details error:", err);
      setError(err.message || "Unable to load course details.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  // Initial fetch and realtime updates.
  useEffect(() => {
    if (!id) return;

    fetchCourseDetails();

    const channel = supabase
      .channel(`course-details-${id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "materials",
        },
        (payload) => {
          const affected = payload.new?.course_id || payload.old?.course_id;

          if (!affected || affected === id) {
            fetchCourseDetails();
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "material_files",
        },
        () => fetchCourseDetails()
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "courses",
          filter: `id=eq.${id}`,
        },
        () => fetchCourseDetails()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, fetchCourseDetails]);

  // Group materials by week.
  const groupedMaterials = useMemo(() => {
    const filtered = materials.filter((material) => {
      const query = search.toLowerCase().trim();

      if (!query) return true;

      return (
        material.title?.toLowerCase().includes(query) ||
        material.topic?.toLowerCase().includes(query) ||
        material.category?.toLowerCase().includes(query) ||
        material.description?.toLowerCase().includes(query) ||
        material.files?.some((file) =>
          file.file_name?.toLowerCase().includes(query)
        )
      );
    });

    const groups = new Map();

    filtered.forEach((material) => {
      const week = material.week_number
        ? `Week ${material.week_number}`
        : "Other Materials";

      if (!groups.has(week)) groups.set(week, []);

      groups.get(week).push(material);
    });

    return [...groups.entries()].sort(([a], [b]) => {
      if (a === "Other Materials") return 1;
      if (b === "Other Materials") return -1;

      return Number(a.replace("Week ", "")) -
        Number(b.replace("Week ", ""));
    });
  }, [materials, search]);

  const totalFiles = materials.reduce(
    (sum, material) => sum + material.files.length,
    0
  );

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <RefreshCw size={30} className="animate-spin text-[#176D68] mb-4" />
        <p className="text-sm text-[#81918B]">
          Loading course and learning materials...
        </p>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => navigate("/courses")}
          className="flex items-center gap-2 text-sm font-semibold text-[#71827C]"
        >
          <ArrowLeft size={18} />
          Back to Courses
        </button>

        <div className="bg-white rounded-[24px] p-8 text-center">
          <AlertCircle size={32} className="text-red-500 mx-auto mb-3" />
          <h2 className="font-bold text-[#20302D]">
            Course unavailable
          </h2>
          <p className="text-sm text-[#81918B] mt-2">
            {error || "This course could not be found."}
          </p>

          <button
            onClick={() => fetchCourseDetails(true)}
            className="mt-5 px-5 py-3 rounded-full bg-[#176D68] text-white text-sm font-semibold"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">

      {/* Back and refresh */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={() => navigate("/courses")}
          className="flex items-center gap-2 text-sm font-semibold text-[#71827C] hover:text-[#176D68]"
        >
          <ArrowLeft size={18} />
          Back to Courses
        </button>

        <button
          onClick={() => fetchCourseDetails(true)}
          disabled={refreshing}
          className="flex items-center gap-2 text-xs font-semibold text-[#176D68] px-4 py-2.5 rounded-full bg-[#E4F2EF] disabled:opacity-50"
        >
          <RefreshCw
            size={15}
            className={refreshing ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      {/* Course information */}
      <section className="rounded-[26px] p-5 sm:p-8 bg-[#E5F2EF]">
        <div className="flex flex-col sm:flex-row sm:items-start gap-5">
          <div className="w-16 h-16 rounded-2xl bg-white/80 grid place-items-center text-[#176D68] shrink-0">
            <GraduationCap size={34} />
          </div>

          <div className="flex-1 min-w-0">
            <span className="inline-flex px-3 py-1.5 bg-white/80 rounded-full text-xs font-semibold text-[#53645E]">
              {course.course_code || "Course"}
            </span>

            <h1 className="text-2xl sm:text-3xl font-bold text-[#20302D] mt-4">
              {course.course_name}
            </h1>

            <p className="text-sm text-[#53645E] mt-3">
              Course information and all learning materials provided for this course.
            </p>

            <div className="flex flex-wrap gap-4 mt-6">
              <div className="flex items-center gap-2 text-sm text-[#53645E]">
                <Building2 size={16} />
                {course.department || "Department not specified"}
              </div>

              <div className="flex items-center gap-2 text-sm text-[#53645E]">
                <BookOpen size={16} />
                {course.course_type || "Course"}
              </div>

              <div className="flex items-center gap-2 text-sm text-[#53645E]">
                <Award size={16} />
                {course.credit_units ?? "—"} credit units
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Course statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-white rounded-[22px] p-4 sm:p-5">
          <FolderOpen size={20} className="text-[#176D68]" />
          <h2 className="text-2xl font-bold text-[#20302D] mt-3">
            {materials.length}
          </h2>
          <p className="text-xs text-[#81918B] mt-1">
            Published materials
          </p>
        </div>

        <div className="bg-white rounded-[22px] p-4 sm:p-5">
          <FileArchive size={20} className="text-[#176D68]" />
          <h2 className="text-2xl font-bold text-[#20302D] mt-3">
            {totalFiles}
          </h2>
          <p className="text-xs text-[#81918B] mt-1">
            Attached files
          </p>
        </div>

        <div className="bg-white rounded-[22px] p-4 sm:p-5 col-span-2 sm:col-span-1">
          <CalendarDays size={20} className="text-[#176D68]" />
          <h2 className="text-2xl font-bold text-[#20302D] mt-3">
            {new Set(
              materials
                .filter((item) => item.week_number)
                .map((item) => item.week_number)
            ).size}
          </h2>
          <p className="text-xs text-[#81918B] mt-1">
            Available weeks
          </p>
        </div>
      </div>

      {/* Materials heading and search */}
      <section className="space-y-5">
        <div>
          <h2 className="text-xl font-bold text-[#20302D]">
            Course Materials
          </h2>

          <p className="text-sm text-[#81918B] mt-1">
            Browse all published slides, lecture notes and documents for this course.
          </p>
        </div>

        <div className="relative">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#81918B]"
          />

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search materials, topics or filenames..."
            className="w-full h-12 pl-11 pr-4 rounded-full bg-white text-sm text-[#20302D] outline-none focus:ring-2 focus:ring-[#176D68]/20"
          />
        </div>

        {groupedMaterials.length > 0 ? (
          <div className="space-y-6">
            {groupedMaterials.map(([week, items]) => (
              <div key={week} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-[#20302D]">
                    {week}
                  </h3>

                  <span className="text-xs text-[#81918B]">
                    {items.length} {items.length === 1 ? "material" : "materials"}
                  </span>
                </div>

                {items.map((material) => (
                  <MaterialCard
                    key={material.id}
                    material={material}
                  />
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-[24px] p-10 text-center">
            <div className="w-14 h-14 rounded-full bg-[#E4F2EF] text-[#176D68] grid place-items-center mx-auto">
              <FolderOpen size={25} />
            </div>

            <h3 className="font-bold text-[#20302D] mt-4">
              {materials.length === 0
                ? "No materials published yet"
                : "No matching materials"}
            </h3>

            <p className="text-sm text-[#81918B] mt-2 max-w-sm mx-auto">
              {materials.length === 0
                ? "Your lecturer or administrator has not published materials for this course yet. New uploads will appear here."
                : "Try searching with another topic, title or filename."}
            </p>
          </div>
        )}
      </section>

      <div className="bg-[#E4F2EF] rounded-2xl p-4 flex items-start gap-3">
        <Clock3 size={19} className="text-[#176D68] shrink-0 mt-0.5" />
        <p className="text-xs text-[#53645E] leading-relaxed">
          Course materials are updated automatically when new published resources are uploaded by the administrator.
        </p>
      </div>
    </div>
  );
}
