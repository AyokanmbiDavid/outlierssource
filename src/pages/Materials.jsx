
import React, { useMemo, useState } from "react";
import {
  Search,
  FileText,
  FileImage,
  FileSpreadsheet,
  Download,
  BookOpen,
  FolderOpen,
  SlidersHorizontal,
  Clock3,
  ArrowUpRight,
  File,
  Presentation,
} from "lucide-react";

const materials = [
  {
    id: 1,
    title: "Introduction to Computer Science",
    description: "Complete lecture notes covering the fundamentals of computing.",
    course: "COS 101",
    category: "Lecture Notes",
    type: "PDF",
    size: "2.4 MB",
    date: "Nov 10, 2026",
    icon: FileText,
    color: "#E4F2EF",
    iconColor: "#176D68",
  },
  {
    id: 2,
    title: "Mathematics Assignment 1",
    description: "Practice questions on algebra, equations and number systems.",
    course: "MTH 101",
    category: "Assignments",
    type: "PDF",
    size: "850 KB",
    date: "Nov 9, 2026",
    icon: FileText,
    color: "#EAF0FA",
    iconColor: "#42658A",
  },
  {
    id: 3,
    title: "Statistical Data Presentation",
    description: "Presentation slides explaining charts and frequency tables.",
    course: "STA 101",
    category: "Presentations",
    type: "PPT",
    size: "4.1 MB",
    date: "Nov 7, 2026",
    icon: Presentation,
    color: "#F0EBF7",
    iconColor: "#8063A5",
  },
  {
    id: 4,
    title: "Computer Hardware Components",
    description: "Illustrated guide to the major components of a computer.",
    course: "COS 101",
    category: "Study Guides",
    type: "PDF",
    size: "3.2 MB",
    date: "Nov 5, 2026",
    icon: FileImage,
    color: "#F5EFE5",
    iconColor: "#A47A3C",
  },
  {
    id: 5,
    title: "Mathematics Practice Dataset",
    description: "Spreadsheet for practising basic statistical calculations.",
    course: "MTH 101",
    category: "Assignments",
    type: "XLSX",
    size: "620 KB",
    date: "Nov 3, 2026",
    icon: FileSpreadsheet,
    color: "#E8F2E8",
    iconColor: "#46804C",
  },
  {
    id: 6,
    title: "Introduction to Statistics",
    description: "A beginner-friendly guide to statistical concepts and methods.",
    course: "STA 101",
    category: "Lecture Notes",
    type: "PDF",
    size: "1.8 MB",
    date: "Nov 1, 2026",
    icon: FileText,
    color: "#E4F2EF",
    iconColor: "#176D68",
  },
];

const categories = [
  "All Materials",
  "Lecture Notes",
  "Assignments",
  "Presentations",
  "Study Guides",
];

const fileIcons = {
  PDF: FileText,
  PPT: Presentation,
  XLSX: FileSpreadsheet,
};

function MaterialCard({ material }) {
  const Icon = material.icon;

  return (
    <article className="bg-white rounded-[22px] p-5 hover:shadow-lg hover:shadow-[#176D68]/5 transition-all duration-200">
      <div className="flex items-start justify-between">
        <div
          className="w-12 h-12 rounded-2xl grid place-items-center"
          style={{ backgroundColor: material.color, color: material.iconColor }}
        >
          <Icon size={23} />
        </div>

        <span className="px-3 py-1.5 rounded-full bg-[#F1F5F3] text-[11px] font-semibold text-[#71827C]">
          {material.type}
        </span>
      </div>

      <div className="mt-5">
        <p className="text-xs font-semibold text-[#176D68]">
          {material.course} · {material.category}
        </p>

        <h3 className="text-[16px] font-bold text-[#20302D] mt-2 leading-snug">
          {material.title}
        </h3>

        <p className="text-sm text-[#81918B] mt-2 leading-relaxed min-h-[42px]">
          {material.description}
        </p>
      </div>

      <div className="flex items-center justify-between mt-5 pt-4">
        <div>
          <p className="text-xs text-[#81918B]">
            {material.size}
          </p>
          <p className="text-[11px] text-[#A0ACA7] mt-1">
            {material.date}
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            alert("This material will be downloadable once storage is connected.")
          }
          className="w-10 h-10 rounded-full bg-[#E4F2EF] text-[#176D68] grid place-items-center hover:bg-[#176D68] hover:text-white transition-colors"
          aria-label={`Download ${material.title}`}
        >
          <Download size={18} />
        </button>
      </div>
    </article>
  );
}

export default function Materials() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Materials");
  const [course, setCourse] = useState("All Courses");
  const [fileType, setFileType] = useState("All");

  const filteredMaterials = useMemo(() => {
    return materials.filter((item) => {
      const query = search.toLowerCase();

      const matchesSearch =
        item.title.toLowerCase().includes(query) ||
        item.course.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query);

      const matchesCategory =
        category === "All Materials" ||
        item.category === category;

      const matchesCourse =
        course === "All Courses" ||
        item.course === course;

      const matchesType =
        fileType === "All" || item.type === fileType;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesCourse &&
        matchesType
      );
    });
  }, [search, category, course, fileType]);

  const resetFilters = () => {
    setSearch("");
    setCategory("All Materials");
    setCourse("All Courses");
    setFileType("All");
  };

  return (
    <div className="space-y-7 pb-6">

      {/* Header */}
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

        <div className="flex items-center gap-2 bg-[#E4F2EF] text-[#176D68] px-4 py-3 rounded-2xl w-fit">
          <FolderOpen size={19} />
          <span className="text-sm font-semibold">
            {materials.length} Resources
          </span>
        </div>
      </section>

      {/* Overview */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
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
        ].map((item) => {
          const Icon = item.icon;

          return (
            <div key={item.label} className="bg-white rounded-[20px] p-4 sm:p-5">
              <div className="w-9 h-9 rounded-xl bg-[#E4F2EF] text-[#176D68] grid place-items-center">
                <Icon size={18} />
              </div>

              <h2 className="text-2xl font-bold text-[#20302D] mt-4">
                {item.value}
              </h2>

              <p className="text-xs text-[#81918B] mt-1">
                {item.label}
              </p>
            </div>
          );
        })}
      </section>

      {/* Search and filters */}
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
              <option>All Courses</option>
              <option value="COS 101">COS 101</option>
              <option value="MTH 101">MTH 101</option>
              <option value="STA 101">STA 101</option>
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
            </select>
          </div>
        </div>
      </section>

      {/* Results */}
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
            onClick={resetFilters}
            className="text-xs font-semibold text-[#176D68]"
          >
            Reset filters
          </button>
        </div>

        {filteredMaterials.length > 0 ? (
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
              No materials found
            </h3>

            <p className="text-sm text-[#81918B] mt-2">
              Try a different search or adjust your filters.
            </p>

            <button
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
