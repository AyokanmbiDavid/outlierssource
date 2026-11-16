
import React, { useMemo, useState } from "react";
import {
  Search,
  Code2,
  GraduationCap,
  BriefcaseBusiness,
  ShieldCheck,
  Lightbulb,
  Bookmark,
  BookmarkCheck,
  ArrowUpRight,
  X,
  CheckCircle2,
  BookOpen,
  Sparkles,
} from "lucide-react";

const practices = [
  {
    id: 1,
    title: "Write Clean and Readable Code",
    category: "Programming",
    level: "Beginner",
    icon: Code2,
    description: "Make your code easy to understand, maintain and improve.",
    points: [
      "Use meaningful variable and function names.",
      "Keep functions focused on one responsibility.",
      "Avoid unnecessary repetition.",
      "Use consistent indentation and formatting.",
      "Add comments when they genuinely improve understanding.",
    ],
  },
  {
    id: 2,
    title: "Master Time Management",
    category: "Academic",
    level: "Beginner",
    icon: GraduationCap,
    description: "Organise your academic activities and make better use of your time.",
    points: [
      "Create a realistic weekly study timetable.",
      "Break large tasks into smaller activities.",
      "Prioritise important deadlines.",
      "Take short breaks during study sessions.",
      "Review your progress regularly.",
    ],
  },
  {
    id: 3,
    title: "Use Version Control",
    category: "Programming",
    level: "Intermediate",
    icon: Code2,
    description: "Learn how to track changes and collaborate using Git.",
    points: [
      "Commit changes regularly.",
      "Write meaningful commit messages.",
      "Use branches for separate features.",
      "Avoid committing sensitive information.",
      "Review changes before merging.",
    ],
  },
  {
    id: 4,
    title: "Build Strong Communication Skills",
    category: "Professional",
    level: "Beginner",
    icon: BriefcaseBusiness,
    description: "Communicate clearly when working with classmates and teams.",
    points: [
      "Listen carefully before responding.",
      "Explain ideas using simple language.",
      "Ask questions when something is unclear.",
      "Give constructive feedback.",
      "Respect different opinions.",
    ],
  },
  {
    id: 5,
    title: "Protect Your Digital Accounts",
    category: "Security",
    level: "Intermediate",
    icon: ShieldCheck,
    description: "Develop responsible security habits when using digital platforms.",
    points: [
      "Use strong, unique passwords.",
      "Enable multi-factor authentication where available.",
      "Never share your login credentials.",
      "Be careful with suspicious links.",
      "Keep your software updated.",
    ],
  },
  {
    id: 6,
    title: "Understand Before Memorising",
    category: "Academic",
    level: "Beginner",
    icon: GraduationCap,
    description: "Develop deeper understanding instead of relying only on memorisation.",
    points: [
      "Understand the meaning behind concepts.",
      "Use practical examples.",
      "Explain topics in your own words.",
      "Practise with relevant questions.",
      "Review difficult concepts regularly.",
    ],
  },
  {
    id: 7,
    title: "Write Maintainable Documentation",
    category: "Programming",
    level: "Advanced",
    icon: BookOpen,
    description: "Document your projects so other developers can understand them.",
    points: [
      "Include a clear project overview.",
      "Explain installation requirements.",
      "Document important configurations.",
      "Provide examples where useful.",
      "Keep documentation updated.",
    ],
  },
  {
    id: 8,
    title: "Develop a Professional Portfolio",
    category: "Professional",
    level: "Intermediate",
    icon: BriefcaseBusiness,
    description: "Present your skills and projects in a clear, organised way.",
    points: [
      "Showcase projects you understand.",
      "Explain your contribution to each project.",
      "Include working project demonstrations.",
      "Keep your contact information updated.",
      "Improve your portfolio as you learn.",
    ],
  },
];

const categories = [
  "All",
  "Programming",
  "Academic",
  "Professional",
  "Security",
];

const levelStyles = {
  Beginner: "bg-[#E4F2EF] text-[#176D68]",
  Intermediate: "bg-[#FFF2E5] text-[#B87532]",
  Advanced: "bg-[#EAF0FA] text-[#5276A8]",
};

export default function BestPractices() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [selected, setSelected] = useState(null);
  const [saved, setSaved] = useState([]);
  const [savedOnly, setSavedOnly] = useState(false);

  const filteredPractices = useMemo(() => {
    return practices.filter((item) => {
      const matchesCategory = category === "All" || item.category === category;

      const matchesSearch =
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.description.toLowerCase().includes(search.toLowerCase()) ||
        item.category.toLowerCase().includes(search.toLowerCase());

      const matchesSaved = !savedOnly || saved.includes(item.id);

      return matchesCategory && matchesSearch && matchesSaved;
    });
  }, [search, category, saved, savedOnly]);

  const toggleSave = (id) => {
    setSaved((previous) =>
      previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id]
    );
  };

  return (
    <div className="space-y-7 pb-8">

      {/* Header */}
      <div>
        <p className="text-sm text-[#81918B] mb-1">
          Learning / Knowledge Centre
        </p>

        <h1 className="text-2xl sm:text-3xl font-bold text-[#20302D]">
          Best Practices
        </h1>

        <p className="text-sm text-[#81918B] mt-2">
          Develop better habits for learning, coding and professional growth.
        </p>
      </div>

      {/* Hero */}
      <section className="bg-[#176D68] rounded-[28px] p-6 sm:p-8 text-white relative overflow-hidden">
        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-2 bg-white/15 px-3 py-2 rounded-full text-xs font-semibold">
            <Sparkles size={15} />
            GROW WITH KNOWLEDGE
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold mt-5 leading-tight">
            Small improvements create better results.
          </h2>

          <p className="text-sm text-white/75 mt-3 leading-6">
            Explore useful guidelines that can help you become
            a better student, developer and professional.
          </p>

          <div className="flex gap-5 mt-6 text-sm text-white/85">
            <span>{practices.length} Guidelines</span>
            <span>{saved.length} Saved</span>
          </div>
        </div>

        <div className="absolute right-5 bottom-3 opacity-10">
          <Lightbulb size={150} />
        </div>
      </section>

      {/* Search */}
      <section className="bg-white rounded-[24px] p-4">
        <div className="relative">
          <Search size={19} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#81918B]" />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search best practices..."
            className="w-full bg-[#F5F8F6] rounded-2xl py-4 pl-12 pr-4 text-sm outline-none focus:ring-2 focus:ring-[#176D68]/20"
          />
        </div>
      </section>

      {/* Category Filters */}
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

        <button
          onClick={() => setSavedOnly(!savedOnly)}
          className={`shrink-0 px-4 py-2.5 rounded-full text-xs font-semibold flex items-center gap-2 ${
            savedOnly
              ? "bg-[#176D68] text-white"
              : "bg-white text-[#81918B]"
          }`}
        >
          <Bookmark size={14} />
          Saved
        </button>
      </div>

      {/* Results */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-[#20302D]">
              Explore Guidelines
            </h2>
            <p className="text-xs text-[#81918B] mt-1">
              {filteredPractices.length} guidelines available
            </p>
          </div>
        </div>

        {filteredPractices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredPractices.map((item) => {
              const Icon = item.icon;
              const isSaved = saved.includes(item.id);

              return (
                <article
                  key={item.id}
                  className="bg-white rounded-[26px] p-5 flex flex-col"
                >
                  <div className="flex justify-between items-start">
                    <div className="p-3.5 rounded-2xl bg-[#E4F2EF] text-[#176D68]">
                      <Icon size={22} />
                    </div>

                    <button
                      onClick={() => toggleSave(item.id)}
                      aria-label={isSaved ? "Remove saved guideline" : "Save guideline"}
                      className="p-2.5 rounded-xl bg-[#F5F8F6] text-[#176D68]"
                    >
                      {isSaved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
                    </button>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap mt-5">
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

                  <button
                    onClick={() => setSelected(item)}
                    className="w-full flex items-center justify-center gap-2 bg-[#E4F2EF] text-[#176D68] hover:bg-[#d5eae5] rounded-2xl py-3 mt-5 text-sm font-semibold transition"
                  >
                    Read Guidelines
                    <ArrowUpRight size={16} />
                  </button>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-[26px] py-16 text-center">
            <BookOpen size={35} className="mx-auto text-[#81918B]" />

            <h3 className="font-bold text-[#20302D] mt-4">
              No guidelines found
            </h3>

            <p className="text-sm text-[#81918B] mt-2">
              Try a different search or category.
            </p>

            <button
              onClick={() => {
                setSearch("");
                setCategory("All");
                setSavedOnly(false);
              }}
              className="text-sm text-[#176D68] font-semibold mt-4"
            >
              Reset filters
            </button>
          </div>
        )}
      </section>

      {/* Details Modal */}
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

            <div className="mt-7">
              <h3 className="font-bold text-[#20302D] mb-4">
                Recommended Practices
              </h3>

              <div className="space-y-4">
                {selected.points.map((point, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle2 size={18} className="text-[#176D68] shrink-0 mt-0.5" />

                    <p className="text-sm text-[#52645E] leading-6">
                      {point}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => toggleSave(selected.id)}
              className="w-full flex items-center justify-center gap-2 bg-[#E4F2EF] text-[#176D68] rounded-2xl py-3.5 mt-7 font-semibold text-sm"
            >
              {saved.includes(selected.id) ? (
                <>
                  <BookmarkCheck size={17} />
                  Saved
                </>
              ) : (
                <>
                  <Bookmark size={17} />
                  Save Guideline
                </>
              )}
            </button>

            <button
              onClick={() => setSelected(null)}
              className="w-full bg-[#176D68] text-white rounded-2xl py-3.5 mt-3 font-semibold text-sm"
            >
              Done Reading
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
