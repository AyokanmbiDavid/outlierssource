
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  CirclePlay,
  Clock3,
  Download,
  FileText,
  GraduationCap,
  Play,
  PlayCircle,
  UserRound,
  Video,
  Lock,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

// Temporary course data
const courseData = {
  1: {
    title: "Introduction to Computer Science",
    code: "COS 101",
    category: "Computer Science",
    lecturer: "Dr. A. Johnson",
    description:
      "Learn the foundations of computer science, computational thinking, computer systems and the basic principles behind modern computing.",
    duration: "8 weeks",
    lessons: 20,
    completed: 15,
    color: "#E5F2EF",
    icon: "💻",
    modules: [
      {
        title: "Module 1: Introduction",
        lessons: [
          "What is Computer Science?",
          "History of Computing",
          "Computer Science Applications",
          "Introduction Assessment",
        ],
      },
      {
        title: "Module 2: Computer Systems",
        lessons: [
          "Computer Hardware",
          "Computer Software",
          "Input and Output Devices",
          "Computer Memory",
        ],
      },
      {
        title: "Module 3: Data and Information",
        lessons: [
          "Understanding Data",
          "Data Processing",
          "Number Systems",
          "Module Assessment",
        ],
      },
    ],
  },
  2: {
    title: "Fundamentals of Mathematics",
    code: "MTH 101",
    category: "Mathematics",
    lecturer: "Prof. Williams",
    description:
      "Explore fundamental mathematical concepts, equations, number systems and problem-solving techniques.",
    duration: "6 weeks",
    lessons: 16,
    completed: 7,
    color: "#EAF0FA",
    icon: "📐",
    modules: [
      {
        title: "Module 1: Number Systems",
        lessons: [
          "Introduction to Numbers",
          "Real Numbers",
          "Fractions and Decimals",
        ],
      },
      {
        title: "Module 2: Algebra",
        lessons: [
          "Algebraic Expressions",
          "Linear Equations",
          "Quadratic Equations",
        ],
      },
    ],
  },
};

const defaultCourse = {
  title: "Introduction to Statistics",
  code: "STA 101",
  category: "Statistics",
  lecturer: "Dr. Ibrahim",
  description:
    "Understand statistical concepts, data collection, data presentation and basic statistical analysis.",
  duration: "7 weeks",
  lessons: 15,
  completed: 3,
  color: "#F0EBF7",
  icon: "📊",
  modules: [
    {
      title: "Module 1: Introduction to Statistics",
      lessons: [
        "Meaning of Statistics",
        "Types of Data",
        "Population and Samples",
      ],
    },
    {
      title: "Module 2: Data Presentation",
      lessons: [
        "Frequency Distribution",
        "Tables and Charts",
        "Graphical Presentation",
      ],
    },
  ],
};

export default function ClassDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const course = courseData[id] || defaultCourse;

  const [completedLessons, setCompletedLessons] = useState(
    course.completed
  );

  const [expandedModules, setExpandedModules] = useState([0]);

  const progress = Math.round(
    (completedLessons / course.lessons) * 100
  );

  const toggleModule = (index) => {
    setExpandedModules((current) =>
      current.includes(index)
        ? current.filter((item) => item !== index)
        : [...current, index]
    );
  };

  const toggleLesson = () => {
    setCompletedLessons((current) =>
      Math.min(course.lessons, current + 1)
    );
  };

  return (
    <div className="space-y-6 pb-8">

      {/* Back button */}
      <button
        onClick={() => navigate("/courses")}
        className="flex items-center gap-2 text-sm font-semibold text-[#71827C] hover:text-[#176D68]"
      >
        <ArrowLeft size={18} />
        Back to Courses
      </button>

      {/* Course hero */}
      <section
        className="rounded-[26px] p-5 sm:p-8"
        style={{ backgroundColor: course.color }}
      >
        <div className="flex flex-col lg:flex-row lg:items-center gap-7">

          <div className="flex-1">
            <span className="inline-flex px-3 py-1.5 bg-white/80 rounded-full text-xs font-semibold text-[#53645E]">
              {course.code} · {course.category}
            </span>

            <h1 className="text-2xl sm:text-3xl font-bold text-[#20302D] mt-4 max-w-2xl">
              {course.title}
            </h1>

            <p className="text-sm text-[#53645E] leading-relaxed mt-3 max-w-2xl">
              {course.description}
            </p>

            <div className="flex flex-wrap gap-5 mt-6 text-sm text-[#53645E]">
              <span className="flex items-center gap-2">
                <UserRound size={16} />
                {course.lecturer}
              </span>

              <span className="flex items-center gap-2">
                <Clock3 size={16} />
                {course.duration}
              </span>

              <span className="flex items-center gap-2">
                <BookOpen size={16} />
                {course.lessons} lessons
              </span>
            </div>

            <button
              onClick={() => {
                document.getElementById("course-content")?.scrollIntoView({
                  behavior: "smooth",
                });
              }}
              className="mt-7 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#176D68] text-white text-sm font-semibold hover:bg-[#105A55]"
            >
              <Play size={16} />
              Continue Learning
            </button>
          </div>

          <div className="hidden lg:flex w-48 h-48 rounded-[30px] bg-white/50 items-center justify-center">
            <span className="text-8xl">{course.icon}</span>
          </div>
        </div>
      </section>

      {/* Progress and lecturer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        <div className="lg:col-span-2 bg-white rounded-[24px] p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-[#20302D]">
                Your Learning Progress
              </h2>
              <p className="text-xs text-[#81918B] mt-1">
                Keep going. You're making progress!
              </p>
            </div>

            <span className="text-xl font-bold text-[#176D68]">
              {progress}%
            </span>
          </div>

          <div className="h-3 bg-[#EDF2EF] rounded-full mt-6 overflow-hidden">
            <div
              className="h-full bg-[#176D68] rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex justify-between mt-3 text-xs text-[#81918B]">
            <span>{completedLessons} lessons completed</span>
            <span>{course.lessons - completedLessons} remaining</span>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-7">
            <div className="bg-[#F5F8F6] rounded-2xl p-4">
              <CheckCircle2 size={20} className="text-[#176D68]" />
              <h3 className="text-2xl font-bold text-[#20302D] mt-3">
                {completedLessons}
              </h3>
              <p className="text-xs text-[#81918B]">Completed lessons</p>
            </div>

            <div className="bg-[#F5F8F6] rounded-2xl p-4">
              <BookOpen size={20} className="text-[#176D68]" />
              <h3 className="text-2xl font-bold text-[#20302D] mt-3">
                {course.lessons - completedLessons}
              </h3>
              <p className="text-xs text-[#81918B]">Remaining lessons</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[24px] p-5 sm:p-6">
          <div className="w-12 h-12 rounded-full bg-[#E4F2EF] grid place-items-center text-[#176D68]">
            <GraduationCap size={23} />
          </div>

          <h2 className="font-bold text-[#20302D] mt-4">
            Course Lecturer
          </h2>

          <p className="text-sm text-[#81918B] mt-1">
            Your course instructor
          </p>

          <div className="mt-5 flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-[#E4F2EF] grid place-items-center text-[#176D68] font-bold">
              {course.lecturer.charAt(0)}
            </div>

            <div>
              <p className="font-semibold text-sm text-[#20302D]">
                {course.lecturer}
              </p>
              <p className="text-xs text-[#81918B]">
                Course Instructor
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Course content */}
      <section id="course-content" className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-[#20302D]">
            Course Content
          </h2>
          <p className="text-sm text-[#81918B] mt-1">
            Explore your modules and lessons.
          </p>
        </div>

        {course.modules.map((module, index) => {
          const expanded = expandedModules.includes(index);

          return (
            <div
              key={module.title}
              className="bg-white rounded-[22px] overflow-hidden"
            >
              <button
                onClick={() => toggleModule(index)}
                className="w-full p-5 flex items-center justify-between text-left"
              >
                <div>
                  <h3 className="font-bold text-[#20302D]">
                    {module.title}
                  </h3>
                  <p className="text-xs text-[#81918B] mt-1">
                    {module.lessons.length} lessons
                  </p>
                </div>

                <span className="text-[#81918B]">
                  {expanded ? (
                    <ChevronUp size={20} />
                  ) : (
                    <ChevronDown size={20} />
                  )}
                </span>
              </button>

              {expanded && (
                <div className="px-5 pb-4 space-y-2">
                  {module.lessons.map((lesson, lessonIndex) => {
                    const lessonNumber =
                      course.modules
                        .slice(0, index)
                        .reduce(
                          (total, item) =>
                            total + item.lessons.length,
                          0
                        ) + lessonIndex;

                    const isCompleted =
                      lessonNumber < completedLessons;

                    return (
                      <div
                        key={lesson}
                        className="flex items-center gap-3 p-3 rounded-xl bg-[#F7F9F8]"
                      >
                        <span className="text-[#176D68]">
                          {isCompleted ? (
                            <CheckCircle2 size={19} />
                          ) : (
                            <CirclePlay size={19} />
                          )}
                        </span>

                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#20302D]">
                            {lesson}
                          </p>
                          <p className="text-xs text-[#81918B] mt-1">
                            Lesson {lessonNumber + 1}
                          </p>
                        </div>

                        <button
                          onClick={toggleLesson}
                          disabled={isCompleted}
                          className="text-xs font-semibold text-[#176D68] disabled:text-[#81918B]"
                        >
                          {isCompleted ? "Completed" : "Mark done"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </section>

      {/* Learning resources */}
      <section className="bg-white rounded-[24px] p-5 sm:p-6">
        <h2 className="font-bold text-[#20302D]">
          Learning Resources
        </h2>
        <p className="text-xs text-[#81918B] mt-1">
          Materials provided for this course.
        </p>

        <div className="mt-5 flex flex-col sm:flex-row gap-3">
          <div className="flex-1 flex items-center gap-3 bg-[#F5F8F6] rounded-2xl p-4">
            <div className="w-11 h-11 rounded-xl bg-[#E4F2EF] text-[#176D68] grid place-items-center">
              <FileText size={21} />
            </div>

            <div className="flex-1">
              <p className="text-sm font-semibold text-[#20302D]">
                Course Handbook
              </p>
              <p className="text-xs text-[#81918B]">
                PDF document
              </p>
            </div>

            <Download size={18} className="text-[#81918B]" />
          </div>

          <div className="flex-1 flex items-center gap-3 bg-[#F5F8F6] rounded-2xl p-4">
            <div className="w-11 h-11 rounded-xl bg-[#EAF0FA] text-[#42658A] grid place-items-center">
              <Video size={21} />
            </div>

            <div className="flex-1">
              <p className="text-sm font-semibold text-[#20302D]">
                Video Tutorials
              </p>
              <p className="text-xs text-[#81918B]">
                Video collection
              </p>
            </div>

            <PlayCircle size={18} className="text-[#81918B]" />
          </div>
        </div>
      </section>
    </div>
  );
}
