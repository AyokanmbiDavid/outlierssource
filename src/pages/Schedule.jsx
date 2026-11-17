
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarDays, ChevronLeft, ChevronRight, Clock3, MapPin,
  BookOpen, GraduationCap, CalendarCheck, RefreshCw,
  AlertCircle, CalendarRange
} from "lucide-react";
import { supabase } from "../services/supabase";

const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const formatDate = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const formatLongDate = (date) =>
  date.toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });

const normalizeDay = (day = "") => {
  const value = day.toLowerCase().trim();
  return weekdays.find((item) => item.toLowerCase() === value) ||
    weekdays.find((item) => item.toLowerCase().startsWith(value.slice(0, 3))) ||
    null;
};

const formatTime = (time) => {
  if (!time) return "Time not set";
  const [hours, minutes] = time.split(":");
  const date = new Date();
  date.setHours(Number(hours), Number(minutes), 0, 0);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });
};

const timeToMinutes = (time = "00:00") => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

export default function Schedule() {
  const today = new Date();
  const todayString = formatDate(today);

  const [currentMonth, setCurrentMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [selectedDate, setSelectedDate] = useState(todayString);
  const [classes, setClasses] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // Fetch every course and every timetable entry.
  const fetchTimetable = useCallback(async (manual = false) => {
    try {
      if (manual) setRefreshing(true);
      else setLoading(true);

      setError("");

      const [coursesResult, timetableResult] = await Promise.all([
        supabase
          .from("courses")
          .select("id, course_name, course_code, department, course_type, credit_units")
          .order("course_code"),

        supabase
          .from("class_timetable")
          .select("id, course_id, day_of_week, start_time, end_time, venue")
      ]);

      if (coursesResult.error) throw coursesResult.error;
      if (timetableResult.error) throw timetableResult.error;

      const allCourses = coursesResult.data || [];
      const courseMap = new Map(
        allCourses.map((course) => [course.id, course])
      );

      const mappedClasses = (timetableResult.data || [])
        .map((item) => {
          const course = courseMap.get(item.course_id);

          if (!course) return null;

          return {
            ...item,
            course_name: course.course_name,
            course_code: course.course_code,
            normalizedDay: normalizeDay(item.day_of_week)
          };
        })
        .filter((item) => item && item.normalizedDay)
        .sort((a, b) => {
          const dayDifference =
            weekdays.indexOf(a.normalizedDay) -
            weekdays.indexOf(b.normalizedDay);

          return dayDifference ||
            timeToMinutes(a.start_time) - timeToMinutes(b.start_time);
        });

      setCourses(allCourses);
      setClasses(mappedClasses);

    } catch (err) {
      console.error("Timetable fetch error:", err);
      setError(err.message || "Unable to load the timetable.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Initial fetch and realtime updates.
  useEffect(() => {
    fetchTimetable();

    const channel = supabase
      .channel("student-timetable-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "class_timetable" },
        () => fetchTimetable()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "courses" },
        () => fetchTimetable()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchTimetable]);

  const monthLabel = currentMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric"
  });

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    return [
      ...Array(firstDay).fill(null),
      ...Array.from(
        { length: totalDays },
        (_, index) => new Date(year, month, index + 1)
      )
    ];
  }, [currentMonth]);

  const selectedDateObject = new Date(`${selectedDate}T12:00:00`);
  const selectedDay = weekdays[selectedDateObject.getDay()];

  const selectedEvents = classes.filter(
    (item) => item.normalizedDay === selectedDay
  );

  // Generate occurrences for the next seven days.
  const upcomingEvents = useMemo(() => {
    const results = [];

    for (let offset = 0; offset < 7; offset++) {
      const date = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() + offset
      );

      const day = weekdays[date.getDay()];

      classes
        .filter((item) => item.normalizedDay === day)
        .forEach((item) => {
          results.push({
            ...item,
            occurrenceDate: formatDate(date),
            occurrenceLabel: date.toLocaleDateString("en-US", {
              weekday: "short",
              day: "numeric",
              month: "short"
            })
          });
        });
    }

    return results.sort((a, b) =>
      a.occurrenceDate.localeCompare(b.occurrenceDate) ||
      timeToMinutes(a.start_time) - timeToMinutes(b.start_time)
    );
  }, [classes]);

  const todayClasses = classes.filter(
    (item) => item.normalizedDay === weekdays[today.getDay()]
  );

  const activeDays = new Set(
    classes.map((item) => item.normalizedDay)
  ).size;

  const hasEvent = (date) =>
    classes.some(
      (item) => item.normalizedDay === weekdays[date.getDay()]
    );

  const changeMonth = (amount) => {
    setCurrentMonth((previous) =>
      new Date(previous.getFullYear(), previous.getMonth() + amount, 1)
    );
  };

  const goToToday = () => {
    setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDate(todayString);
  };

  const openUpcomingClass = (event) => {
    setSelectedDate(event.occurrenceDate);
    const date = new Date(`${event.occurrenceDate}T12:00:00`);
    setCurrentMonth(new Date(date.getFullYear(), date.getMonth(), 1));
  };

  const summaryCards = [
    { label: "Weekly classes", value: classes.length, icon: CalendarDays },
    { label: "Available courses", value: courses.length, icon: BookOpen },
    { label: "Today's classes", value: todayClasses.length, icon: GraduationCap },
    { label: "Active class days", value: activeDays, icon: CalendarCheck }
  ];

  return (
    <div className="space-y-6 pb-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#176D68] text-sm font-semibold mb-2">
            <CalendarDays size={17} />
            Academic planner
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-[#20302D]">
            My Timetable
          </h1>

          <p className="text-sm text-[#81918B] mt-1">
            View all courses and scheduled academic activities.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 bg-white rounded-2xl p-3">
            <span className="w-2 h-2 rounded-full bg-[#176D68]" />
            <span className="text-sm font-semibold text-[#20302D]">
              {today.toLocaleDateString("en-US", {
                day: "numeric",
                month: "short",
                year: "numeric"
              })}
            </span>
          </div>

          <button
            onClick={() => fetchTimetable(true)}
            disabled={refreshing}
            className="flex items-center gap-2 bg-[#176D68] text-white rounded-2xl px-4 py-3 text-sm font-semibold disabled:opacity-60"
          >
            <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="bg-white rounded-3xl p-10 text-center">
          <RefreshCw size={28} className="animate-spin text-[#176D68] mx-auto mb-3" />
          <p className="text-sm text-[#81918B]">Loading timetable...</p>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle size={20} className="text-red-600 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-700">
              Unable to load timetable
            </p>
            <p className="text-xs text-red-600 mt-1">{error}</p>
            <button
              onClick={() => fetchTimetable(true)}
              className="text-xs font-bold text-red-700 underline mt-2"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {summaryCards.map((item) => {
              const Icon = item.icon;

              return (
                <div key={item.label} className="bg-white rounded-2xl p-4 sm:p-5">
                  <div className="w-10 h-10 rounded-xl bg-[#E4F2EF] text-[#176D68] grid place-items-center mb-4">
                    <Icon size={20} />
                  </div>
                  <p className="text-2xl font-bold text-[#20302D]">{item.value}</p>
                  <p className="text-xs sm:text-sm text-[#81918B] mt-1">{item.label}</p>
                </div>
              );
            })}
          </div>

          {/* Calendar and agenda */}
          <div className="grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] gap-5">

            {/* Calendar */}
            <section className="bg-white rounded-3xl p-4 sm:p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-bold text-lg text-[#20302D]">
                    Academic calendar
                  </h2>
                  <p className="text-xs text-[#81918B] mt-1">
                    Select a date to view its classes
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => changeMonth(-1)}
                    className="w-9 h-9 rounded-xl bg-[#F1F5F3] grid place-items-center text-[#20302D]"
                    aria-label="Previous month"
                  >
                    <ChevronLeft size={19} />
                  </button>
                  <button
                    onClick={() => changeMonth(1)}
                    className="w-9 h-9 rounded-xl bg-[#F1F5F3] grid place-items-center text-[#20302D]"
                    aria-label="Next month"
                  >
                    <ChevronRight size={19} />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-[#176D68]">
                  {monthLabel}
                </h3>
                <button
                  onClick={goToToday}
                  className="text-xs font-semibold text-[#176D68] px-3 py-2 rounded-xl bg-[#E4F2EF]"
                >
                  Today
                </button>
              </div>

              <div className="grid grid-cols-7 mb-3">
                {weekdays.map((day) => (
                  <div
                    key={day}
                    className="text-center text-[10px] sm:text-xs font-semibold text-[#81918B] py-2"
                  >
                    {day.slice(0, 3)}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-y-2">
                {calendarDays.map((date, index) => {
                  if (!date) return <div key={`empty-${index}`} />;

                  const dateString = formatDate(date);
                  const isSelected = selectedDate === dateString;
                  const isToday = dateString === todayString;
                  const containsEvent = hasEvent(date);

                  return (
                    <button
                      key={dateString}
                      onClick={() => setSelectedDate(dateString)}
                      className={`relative mx-auto w-9 h-9 sm:w-11 sm:h-11 rounded-2xl flex flex-col items-center justify-center text-sm transition-colors ${
                        isSelected
                          ? "bg-[#176D68] text-white font-bold"
                          : isToday
                          ? "bg-[#E4F2EF] text-[#176D68] font-bold"
                          : "text-[#20302D] hover:bg-[#F1F5F3]"
                      }`}
                    >
                      {date.getDate()}
                      {containsEvent && (
                        <span className={`absolute bottom-1 w-1 h-1 rounded-full ${
                          isSelected ? "bg-white" : "bg-[#176D68]"
                        }`} />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-wrap items-center gap-4 mt-6 pt-5 border-t border-[#F1F5F3]">
                <div className="flex items-center gap-2 text-xs text-[#81918B]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#176D68]" />
                  Scheduled classes
                </div>
                <div className="flex items-center gap-2 text-xs text-[#81918B]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#E4F2EF]" />
                  Today
                </div>
              </div>
            </section>

            {/* Daily agenda */}
            <section className="bg-white rounded-3xl p-4 sm:p-6">
              <div className="mb-5">
                <h2 className="font-bold text-lg text-[#20302D]">
                  Daily agenda
                </h2>
                <p className="text-sm text-[#81918B] mt-1">
                  {formatLongDate(selectedDateObject)}
                </p>
              </div>

              {selectedEvents.length > 0 ? (
                <div className="space-y-3">
                  {selectedEvents.map((item) => (
                    <div key={item.id} className="p-4 rounded-2xl bg-[#F5F8F6]">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white text-[#176D68] grid place-items-center shrink-0">
                          <BookOpen size={19} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="font-bold text-sm text-[#20302D]">
                            {item.course_code}
                          </h3>
                          <p className="text-xs text-[#81918B] mt-1">
                            {item.course_name}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-[#81918B] mt-3">
                            <Clock3 size={14} />
                            {formatTime(item.start_time)} – {formatTime(item.end_time)}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-[#81918B] mt-2">
                            <MapPin size={14} />
                            {item.venue || "Venue not specified"}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="min-h-48 flex flex-col items-center justify-center text-center">
                  <div className="w-14 h-14 rounded-2xl bg-[#E4F2EF] text-[#176D68] grid place-items-center mb-3">
                    <CalendarCheck size={25} />
                  </div>
                  <h3 className="font-semibold text-[#20302D]">
                    No classes scheduled
                  </h3>
                  <p className="text-xs text-[#81918B] mt-1 max-w-[220px]">
                    There are no classes scheduled for this day.
                  </p>
                </div>
              )}
            </section>
          </div>

          {/* Upcoming classes */}
          <section className="bg-white rounded-3xl p-4 sm:p-6">
            <div className="flex items-center justify-between gap-3 mb-5">
              <div>
                <h2 className="font-bold text-lg text-[#20302D]">
                  Upcoming classes
                </h2>
                <p className="text-xs text-[#81918B] mt-1">
                  Your next seven days of academic activities
                </p>
              </div>
              <span className="text-xs font-semibold text-[#176D68] bg-[#E4F2EF] px-3 py-2 rounded-xl whitespace-nowrap">
                {upcomingEvents.length} classes
              </span>
            </div>

            {upcomingEvents.length > 0 ? (
              <div className="space-y-2">
                {upcomingEvents.map((item, index) => (
                  <button
                    key={`${item.id}-${item.occurrenceDate}-${index}`}
                    onClick={() => openUpcomingClass(item)}
                    className="w-full text-left flex items-center gap-3 p-3 sm:p-4 rounded-2xl hover:bg-[#F5F8F6] transition-colors"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-[#E4F2EF] text-[#176D68] grid place-items-center shrink-0">
                      <BookOpen size={21} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm text-[#20302D]">
                        {item.course_code} · {item.course_name}
                      </h3>
                      <p className="text-xs text-[#81918B] mt-1">
                        {item.occurrenceLabel} · {formatTime(item.start_time)}
                      </p>
                      <p className="text-xs text-[#81918B] mt-1">
                        {item.venue || "Venue not specified"}
                      </p>
                    </div>

                    <ChevronRight size={18} className="text-[#81918B] shrink-0" />
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <CalendarRange size={28} className="mx-auto text-[#176D68] mb-3" />
                <p className="text-sm font-semibold text-[#20302D]">
                  No upcoming classes
                </p>
                <p className="text-xs text-[#81918B] mt-1">
                  There are no timetable entries for the next seven days.
                </p>
              </div>
            )}
          </section>

          {/* All courses */}
          <section className="bg-white rounded-3xl p-4 sm:p-6">
            <div className="mb-4">
              <h2 className="font-bold text-lg text-[#20302D]">
                Available courses
              </h2>
              <p className="text-xs text-[#81918B] mt-1">
                All courses currently available on OutliersSource
              </p>
            </div>

            {courses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {courses.map((course) => {
                  const courseClasses = classes.filter(
                    (item) => item.course_id === course.id
                  );

                  return (
                    <div key={course.id} className="rounded-2xl bg-[#F5F8F6] p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white text-[#176D68] grid place-items-center">
                          <BookOpen size={19} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-[#20302D]">
                            {course.course_code}
                          </p>
                          <p className="text-xs text-[#81918B] truncate">
                            {course.course_name}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <span className="text-xs text-[#81918B]">
                          {course.course_type || "Course"}
                        </span>
                        <span className="text-xs text-[#176D68] font-semibold">
                          {courseClasses.length} weekly {courseClasses.length === 1 ? "class" : "classes"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-[#81918B] text-center py-8">
                No courses have been added yet.
              </p>
            )}
          </section>
        </>
      )}
    </div>
  );
}
