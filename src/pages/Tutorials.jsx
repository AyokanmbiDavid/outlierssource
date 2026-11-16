
import React, { useMemo, useState } from "react";
import {
  Search,
  BookOpen,
  Clock,
  Bookmark,
  BookmarkCheck,
  Code2,
  Globe,
  Database,
  Layers,
  ArrowRight,
  X,
  GraduationCap,
  CheckCircle2,
} from "lucide-react";

const tutorialData = [
  {
    id: 1,
    title: "HTML Fundamentals",
    description: "Learn how to structure web pages using HTML elements and semantic tags.",
    category: "Web Development",
    level: "Beginner",
    duration: "20 min",
    lessons: 6,
    featured: true,
    content: [
      "Introduction to HTML",
      "Understanding HTML elements",
      "Working with headings and paragraphs",
      "Creating links and images",
      "HTML forms and inputs",
      "Semantic HTML elements",
    ],
  },
  {
    id: 2,
    title: "CSS Styling Essentials",
    description: "Understand CSS selectors, layouts, colors and responsive styling.",
    category: "Web Development",
    level: "Beginner",
    duration: "35 min",
    lessons: 8,
    featured: true,
    content: [
      "Introduction to CSS",
      "Selectors and properties",
      "Colors and typography",
      "The box model",
      "Flexbox layouts",
      "CSS Grid",
      "Responsive design",
      "CSS best practices",
    ],
  },
  {
    id: 3,
    title: "JavaScript Fundamentals",
    description: "Explore variables, functions, arrays, objects and basic programming logic.",
    category: "Programming",
    level: "Beginner",
    duration: "45 min",
    lessons: 10,
    featured: true,
    content: [
      "Introduction to JavaScript",
      "Variables and data types",
      "Operators and expressions",
      "Conditional statements",
      "Loops",
      "Functions",
      "Arrays",
      "Objects",
      "DOM introduction",
      "Basic exercises",
    ],
  },
  {
    id: 4,
    title: "Introduction to Python",
    description: "Start programming with Python and understand its basic syntax.",
    category: "Programming",
    level: "Beginner",
    duration: "30 min",
    lessons: 7,
    featured: false,
    content: [
      "Installing Python",
      "Variables and data types",
      "Input and output",
      "Conditional statements",
      "Loops",
      "Functions",
      "Practice exercises",
    ],
  },
  {
    id: 5,
    title: "Database Fundamentals",
    description: "Understand databases, tables, relationships and basic SQL queries.",
    category: "Database",
    level: "Intermediate",
    duration: "40 min",
    lessons: 8,
    featured: false,
    content: [
      "What is a database?",
      "Relational databases",
      "Tables and records",
      "Primary and foreign keys",
      "Introduction to SQL",
      "SELECT queries",
      "Filtering records",
      "Database relationships",
    ],
  },
  {
    id: 6,
    title: "React Fundamentals",
    description: "Learn components, props, state and how React applications work.",
    category: "Web Development",
    level: "Intermediate",
    duration: "50 min",
    lessons: 9,
    featured: false,
    content: [
      "Introduction to React",
      "Creating components",
      "JSX fundamentals",
      "Understanding props",
      "React state",
      "Handling events",
      "Rendering lists",
      "React hooks",
      "Building a small application",
    ],
  },
  {
    id: 7,
    title: "Data Structures",
    description: "Understand arrays, stacks, queues and other fundamental structures.",
    category: "Programming",
    level: "Advanced",
    duration: "55 min",
    lessons: 9,
    featured: false,
    content: [
      "Introduction to data structures",
      "Arrays",
      "Linked lists",
      "Stacks",
      "Queues",
      "Trees",
      "Searching",
      "Sorting",
      "Practice problems",
    ],
  },
  {
    id: 8,
    title: "SQL Query Techniques",
    description: "Learn how to retrieve, filter and organize data using SQL.",
    category: "Database",
    level: "Intermediate",
    duration: "35 min",
    lessons: 6,
    featured: false,
    content: [
      "SQL syntax",
      "SELECT and FROM",
      "WHERE conditions",
      "ORDER BY",
      "JOIN operations",
      "Aggregate functions",
    ],
  },
];

const categories = [
  "All",
  "Web Development",
  "Programming",
  "Database",
];

const levelStyles = {
  Beginner: "bg-[#E4F2EF] text-[#176D68]",
  Intermediate: "bg-[#FFF2E5] text-[#B87532]",
  Advanced: "bg-[#FCEAEA] text-[#B94B4B]",
};

export default function Tutorials() {
  const [tutorials, setTutorials] = useState(tutorialData);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [level, setLevel] = useState("All");
  const [selected, setSelected] = useState(null);
  const [savedOnly, setSavedOnly] = useState(false);

  const filteredTutorials = useMemo(() => {
    return tutorials.filter((tutorial) => {
      const matchesSearch =
        tutorial.title.toLowerCase().includes(search.toLowerCase()) ||
        tutorial.description.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        category === "All" || tutorial.category === category;

      const matchesLevel =
        level === "All" || tutorial.level === level;

      const matchesSaved =
        !savedOnly || tutorial.saved;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesLevel &&
        matchesSaved
      );
    });
  }, [tutorials, search, category, level, savedOnly]);

  const toggleSave = (id) => {
    setTutorials((previous) =>
      previous.map((tutorial) =>
        tutorial.id === id
          ? { ...tutorial, saved: !tutorial.saved }
          : tutorial
      )
    );
  };

  const getCategoryIcon = (itemCategory) => {
    if (itemCategory === "Web Development") return Globe;
    if (itemCategory === "Database") return Database;
    return Code2;
  };

  const savedCount = tutorials.filter((item) => item.saved).length;

  return (
    <div className="space-y-7 pb-8">

      {/* Header */}
      <div>
        <p className="text-sm text-[#81918B] mb-1">
          Learning / Knowledge Library
        </p>

        <h1 className="text-2xl sm:text-3xl font-bold text-[#20302D]">
          Tutorials
        </h1>

        <p className="text-sm text-[#81918B] mt-2">
          Explore practical guides and improve your skills.
        </p>
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden bg-[#176D68] rounded-[28px] p-6 sm:p-8 text-white">
        <div className="relative z-10 max-w-xl">
          <span className="text-xs font-semibold bg-white/15 px-3 py-1.5 rounded-full">
            LEARN SOMETHING NEW
          </span>

          <h2 className="text-2xl sm:text-3xl font-bold mt-5 leading-tight">
            Knowledge grows when you keep learning.
          </h2>

          <p className="text-sm text-white/75 mt-3 leading-6">
            Discover tutorials, explore new concepts and build
            practical knowledge at your own pace.
          </p>

          <div className="flex items-center gap-5 mt-6 text-sm">
            <span className="flex items-center gap-2">
              <BookOpen size={17} />
              {tutorials.length} Tutorials
            </span>

            <span className="flex items-center gap-2">
              <Bookmark size={17} />
              {savedCount} Saved
            </span>
          </div>
        </div>

        <div className="absolute right-6 bottom-4 opacity-10">
          <GraduationCap size={150} />
        </div>
      </section>

      {/* Search */}
      <section className="bg-white rounded-[24px] p-4">
        <div className="relative">
          <Search
            size={19}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#81918B]"
          />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tutorials..."
            className="w-full bg-[#F5F8F6] rounded-2xl py-4 pl-12 pr-4 text-sm outline-none focus:ring-2 focus:ring-[#176D68]/20"
          />
        </div>
      </section>

      {/* Featured Tutorials */}
      {category === "All" && !search && !savedOnly && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-lg text-[#20302D]">
                Featured Tutorials
              </h2>
              <p className="text-xs text-[#81918B] mt-1">
                Recommended starting points
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {tutorials
              .filter((item) => item.featured)
              .map((item) => {
                const Icon = getCategoryIcon(item.category);

                return (
                  <button
                    key={item.id}
                    onClick={() => setSelected(item)}
                    className="bg-white rounded-[24px] p-5 text-left hover:shadow-sm transition"
                  >
                    <div className="flex items-center justify-between">
                      <div className="p-3 rounded-2xl bg-[#E4F2EF] text-[#176D68]">
                        <Icon size={22} />
                      </div>

                      <ArrowRight
                        size={18}
                        className="text-[#81918B]"
                      />
                    </div>

                    <h3 className="font-bold text-[#20302D] mt-5">
                      {item.title}
                    </h3>

                    <p className="text-xs text-[#81918B] leading-5 mt-2 line-clamp-2">
                      {item.description}
                    </p>

                    <div className="flex items-center gap-3 mt-4 text-xs text-[#81918B]">
                      <span>{item.duration}</span>
                      <span>·</span>
                      <span>{item.lessons} lessons</span>
                    </div>
                  </button>
                );
              })}
          </div>
        </section>
      )}

      {/* Filters */}
      <section className="space-y-4">
        <div>
          <h2 className="font-bold text-lg text-[#20302D]">
            Explore Tutorials
          </h2>
          <p className="text-xs text-[#81918B] mt-1">
            Find a topic that interests you.
          </p>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {categories.map((item) => (
            <button
              key={item}
              onClick={() => setCategory(item)}
              className={`shrink-0 px-4 py-2.5 rounded-full text-xs font-semibold transition ${
                category === item
                  ? "bg-[#176D68] text-white"
                  : "bg-white text-[#81918B]"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {["All", "Beginner", "Intermediate", "Advanced"].map((item) => (
            <button
              key={item}
              onClick={() => setLevel(item)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
                level === item
                  ? "bg-[#E4F2EF] text-[#176D68]"
                  : "bg-white text-[#81918B]"
              }`}
            >
              {item}
            </button>
          ))}

          <button
            onClick={() => setSavedOnly(!savedOnly)}
            className={`ml-auto flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold ${
              savedOnly
                ? "bg-[#176D68] text-white"
                : "bg-white text-[#81918B]"
            }`}
          >
            <Bookmark size={14} />
            Saved only
          </button>
        </div>
      </section>

      {/* Tutorial List */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold text-[#20302D]">
            {filteredTutorials.length} Tutorials found
          </p>
        </div>

        {filteredTutorials.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredTutorials.map((item) => {
              const Icon = getCategoryIcon(item.category);

              return (
                <article
                  key={item.id}
                  className="bg-white rounded-[26px] p-5 flex flex-col"
                >
                  <div className="flex justify-between items-start">
                    <div className="p-3 rounded-2xl bg-[#E4F2EF] text-[#176D68]">
                      <Icon size={22} />
                    </div>

                    <button
                      onClick={() => toggleSave(item.id)}
                      aria-label={
                        item.saved ? "Remove saved tutorial" : "Save tutorial"
                      }
                      className="p-2.5 rounded-xl bg-[#F5F8F6] text-[#176D68]"
                    >
                      {item.saved ? (
                        <BookmarkCheck size={18} />
                      ) : (
                        <Bookmark size={18} />
                      )}
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-5">
                    <span className="text-xs text-[#81918B]">
                      {item.category}
                    </span>

                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${levelStyles[item.level]}`}>
                      {item.level}
                    </span>
                  </div>

                  <h3 className="font-bold text-[#20302D] mt-3">
                    {item.title}
                  </h3>

                  <p className="text-sm text-[#81918B] leading-6 mt-2 flex-1">
                    {item.description}
                  </p>

                  <div className="flex items-center gap-4 mt-5 pt-4 border-t border-[#F1F5F3] text-xs text-[#81918B]">
                    <span className="flex items-center gap-1.5">
                      <Clock size={14} />
                      {item.duration}
                    </span>

                    <span className="flex items-center gap-1.5">
                      <Layers size={14} />
                      {item.lessons} lessons
                    </span>
                  </div>

                  <button
                    onClick={() => setSelected(item)}
                    className="w-full flex items-center justify-center gap-2 bg-[#E4F2EF] text-[#176D68] hover:bg-[#d5eae5] rounded-2xl py-3 mt-4 text-sm font-semibold transition"
                  >
                    View Tutorial
                    <ArrowRight size={16} />
                  </button>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-[26px] py-16 text-center">
            <BookOpen
              size={35}
              className="mx-auto text-[#81918B]"
            />

            <h3 className="font-bold text-[#20302D] mt-4">
              No tutorials found
            </h3>

            <p className="text-sm text-[#81918B] mt-2">
              Try changing your search or filters.
            </p>

            <button
              onClick={() => {
                setSearch("");
                setCategory("All");
                setLevel("All");
                setSavedOnly(false);
              }}
              className="text-sm text-[#176D68] font-semibold mt-4"
            >
              Reset filters
            </button>
          </div>
        )}
      </section>

      {/* Tutorial Details Modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white w-full max-w-xl max-h-[85vh] overflow-y-auto rounded-[28px] p-5 sm:p-7"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start gap-4">
              <div>
                <span className="text-xs font-semibold text-[#176D68]">
                  {selected.category}
                </span>

                <h2 className="text-xl font-bold text-[#20302D] mt-2">
                  {selected.title}
                </h2>
              </div>

              <button
                onClick={() => setSelected(null)}
                className="p-2 rounded-xl bg-[#F1F5F3]"
              >
                <X size={19} />
              </button>
            </div>

            <p className="text-sm text-[#81918B] leading-6 mt-4">
              {selected.description}
            </p>

            <div className="flex gap-4 mt-5 text-xs text-[#81918B]">
              <span>{selected.level}</span>
              <span>{selected.duration}</span>
              <span>{selected.lessons} lessons</span>
            </div>

            <div className="mt-7">
              <h3 className="font-bold text-[#20302D] mb-4">
                What you will learn
              </h3>

              <div className="space-y-3">
                {selected.content.map((lesson, index) => (
                  <div
                    key={lesson}
                    className="flex items-center gap-3 text-sm text-[#52645E]"
                  >
                    <CheckCircle2
                      size={17}
                      className="text-[#176D68] shrink-0"
                    />

                    <span>
                      {index + 1}. {lesson}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#F5F8F6] rounded-2xl p-4 mt-7">
              <p className="text-xs text-[#81918B] leading-5">
                Tutorial lessons are currently sample content.
                Full lesson reading and progress tracking will be
                connected in a later stage.
              </p>
            </div>

            <button
              onClick={() => setSelected(null)}
              className="w-full bg-[#176D68] text-white rounded-2xl py-3.5 mt-5 font-semibold text-sm"
            >
              Close Tutorial
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
