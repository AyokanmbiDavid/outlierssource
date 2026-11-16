
import React, { useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  MapPin,
  BookOpen,
  ClipboardList,
  GraduationCap,
  CalendarCheck,
  Plus,
} from "lucide-react";

const events = [
  {
    id: 1,
    title: "COS 101 Lecture",
    type: "Class",
    date: "2026-11-16",
    time: "09:00 AM",
    end: "11:00 AM",
    location: "Lecture Hall A",
    color: "teal",
  },
  {
    id: 2,
    title: "MTH 101 Tutorial",
    type: "Tutorial",
    date: "2026-11-16",
    time: "12:00 PM",
    end: "01:00 PM",
    location: "Room 204",
    color: "blue",
  },
  {
    id: 3,
    title: "STA 101 Lecture",
    type: "Class",
    date: "2026-11-17",
    time: "10:00 AM",
    end: "12:00 PM",
    location: "Lecture Hall B",
    color: "teal",
  },
  {
    id: 4,
    title: "COS 103 Assignment",
    type: "Deadline",
    date: "2026-11-18",
    time: "11:59 PM",
    end: "",
    location: "Online submission",
    color: "orange",
  },
  {
    id: 5,
    title: "Departmental Seminar",
    type: "Event",
    date: "2026-11-20",
    time: "02:00 PM",
    end: "04:00 PM",
    location: "Faculty Auditorium",
    color: "purple",
  },
  {
    id: 6,
    title: "GST 111 Lecture",
    type: "Class",
    date: "2026-11-23",
    time: "08:00 AM",
    end: "10:00 AM",
    location: "Lecture Hall C",
    color: "teal",
  },
  {
    id: 7,
    title: "COS 101 Test",
    type: "Assessment",
    date: "2026-11-25",
    time: "10:00 AM",
    end: "11:00 AM",
    location: "Computer Lab",
    color: "red",
  },
];

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const colorStyles = {
  teal: "bg-[#E4F2EF] text-[#176D68]",
  blue: "bg-blue-50 text-blue-700",
  orange: "bg-orange-50 text-orange-700",
  purple: "bg-purple-50 text-purple-700",
  red: "bg-red-50 text-red-700",
};

const eventIcons = {
  Class: BookOpen,
  Tutorial: GraduationCap,
  Deadline: ClipboardList,
  Event: CalendarDays,
  Assessment: CalendarCheck,
};

function formatDate(date) {
  return date.toISOString().split("T")[0];
}

function formatLongDate(date) {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function Schedule() {
  const today = new Date();

  const [currentMonth, setCurrentMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );

  const [selectedDate, setSelectedDate] = useState(formatDate(today));

  const monthLabel = currentMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    for (let day = 1; day <= totalDays; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  }, [currentMonth]);

  const selectedEvents = events.filter(
    (event) => event.date === selectedDate
  );

  const upcomingEvents = events
    .filter((event) => event.date >= formatDate(today))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5);

  const changeMonth = (amount) => {
    setCurrentMonth(
      (previous) =>
        new Date(
          previous.getFullYear(),
          previous.getMonth() + amount,
          1
        )
    );
  };

  const hasEvent = (date) =>
    events.some((event) => event.date === formatDate(date));

  return (
    <div className="space-y-6 pb-6">
      {/* Page heading */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#176D68] text-sm font-semibold mb-2">
            <CalendarDays size={17} />
            Academic planner
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-[#20302D]">
            Schedule & Timetable
          </h1>

          <p className="text-sm text-[#81918B] mt-1">
            Keep track of your classes, deadlines and academic activities.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white rounded-2xl p-2 w-fit">
          <span className="w-2 h-2 rounded-full bg-[#176D68]" />
          <span className="text-sm font-semibold text-[#20302D]">
            {today.toLocaleDateString("en-US", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            label: "Total events",
            value: events.length,
            icon: CalendarDays,
          },
          {
            label: "Classes",
            value: events.filter((e) => e.type === "Class").length,
            icon: BookOpen,
          },
          {
            label: "Deadlines",
            value: events.filter((e) => e.type === "Deadline").length,
            icon: ClipboardList,
          },
          {
            label: "Assessments",
            value: events.filter((e) => e.type === "Assessment").length,
            icon: GraduationCap,
          },
        ].map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className="bg-white rounded-2xl p-4 sm:p-5"
            >
              <div className="w-10 h-10 rounded-xl bg-[#E4F2EF] text-[#176D68] grid place-items-center mb-4">
                <Icon size={20} />
              </div>

              <p className="text-2xl font-bold text-[#20302D]">
                {item.value}
              </p>

              <p className="text-xs sm:text-sm text-[#81918B] mt-1">
                {item.label}
              </p>
            </div>
          );
        })}
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] gap-5">
        {/* Calendar */}
        <section className="bg-white rounded-3xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-bold text-lg text-[#20302D]">
                Academic calendar
              </h2>
              <p className="text-xs text-[#81918B] mt-1">
                Select a date to view activities
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => changeMonth(-1)}
                className="w-9 h-9 rounded-xl bg-[#F1F5F3] grid place-items-center text-[#20302D] hover:bg-[#E4F2EF]"
                aria-label="Previous month"
              >
                <ChevronLeft size={19} />
              </button>

              <button
                onClick={() => changeMonth(1)}
                className="w-9 h-9 rounded-xl bg-[#F1F5F3] grid place-items-center text-[#20302D] hover:bg-[#E4F2EF]"
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
              onClick={() => {
                setCurrentMonth(
                  new Date(today.getFullYear(), today.getMonth(), 1)
                );
                setSelectedDate(formatDate(today));
              }}
              className="text-xs font-semibold text-[#176D68] px-3 py-2 rounded-xl bg-[#E4F2EF]"
            >
              Today
            </button>
          </div>

          <div className="grid grid-cols-7 mb-3">
            {weekdays.map((day) => (
              <div
                key={day}
                className="text-center text-xs font-semibold text-[#81918B] py-2"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-y-2">
            {calendarDays.map((date, index) => {
              if (!date) {
                return <div key={`empty-${index}`} />;
              }

              const dateString = formatDate(date);
              const isSelected = selectedDate === dateString;
              const isToday = dateString === formatDate(today);
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
                    <span
                      className={`absolute bottom-1 w-1 h-1 rounded-full ${
                        isSelected ? "bg-white" : "bg-[#176D68]"
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-4 mt-6 pt-5 border-t border-[#F1F5F3]">
            <div className="flex items-center gap-2 text-xs text-[#81918B]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#176D68]" />
              Scheduled activity
            </div>

            <div className="flex items-center gap-2 text-xs text-[#81918B]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E4F2EF]" />
              Today
            </div>
          </div>
        </section>

        {/* Selected date agenda */}
        <section className="bg-white rounded-3xl p-4 sm:p-6">
          <div className="mb-5">
            <h2 className="font-bold text-lg text-[#20302D]">
              Daily agenda
            </h2>

            <p className="text-sm text-[#81918B] mt-1">
              {formatLongDate(new Date(`${selectedDate}T12:00:00`))}
            </p>
          </div>

          {selectedEvents.length > 0 ? (
            <div className="space-y-3">
              {selectedEvents.map((event) => {
                const Icon = eventIcons[event.type] || CalendarDays;

                return (
                  <div
                    key={event.id}
                    className="p-4 rounded-2xl bg-[#F5F8F6]"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white text-[#176D68] grid place-items-center shrink-0">
                        <Icon size={19} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-sm text-[#20302D]">
                            {event.title}
                          </h3>

                          <span
                            className={`text-[10px] px-2 py-1 rounded-full font-semibold ${
                              colorStyles[event.color]
                            }`}
                          >
                            {event.type}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-[#81918B] mt-3">
                          <Clock3 size={14} />
                          {event.time}
                          {event.end && ` - ${event.end}`}
                        </div>

                        <div className="flex items-center gap-2 text-xs text-[#81918B] mt-2">
                          <MapPin size={14} />
                          {event.location}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="min-h-48 flex flex-col items-center justify-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-[#E4F2EF] text-[#176D68] grid place-items-center mb-3">
                <CalendarCheck size={25} />
              </div>

              <h3 className="font-semibold text-[#20302D]">
                No activities scheduled
              </h3>

              <p className="text-xs text-[#81918B] mt-1 max-w-[220px]">
                There are no academic activities scheduled for this date.
              </p>
            </div>
          )}
        </section>
      </div>

      {/* Upcoming events */}
      <section className="bg-white rounded-3xl p-4 sm:p-6">
        <div className="flex items-center justify-between gap-3 mb-5">
          <div>
            <h2 className="font-bold text-lg text-[#20302D]">
              Upcoming activities
            </h2>
            <p className="text-xs text-[#81918B] mt-1">
              Your next academic commitments
            </p>
          </div>

          <span className="text-xs font-semibold text-[#176D68] bg-[#E4F2EF] px-3 py-2 rounded-xl">
            {upcomingEvents.length} upcoming
          </span>
        </div>

        <div className="space-y-2">
          {upcomingEvents.map((event) => {
            const Icon = eventIcons[event.type] || CalendarDays;

            return (
              <button
                key={event.id}
                onClick={() => {
                  setSelectedDate(event.date);
                  setCurrentMonth(
                    new Date(
                      Number(event.date.slice(0, 4)),
                      Number(event.date.slice(5, 7)) - 1,
                      1
                    )
                  );
                }}
                className="w-full text-left flex items-center gap-3 p-3 sm:p-4 rounded-2xl hover:bg-[#F5F8F6] transition-colors"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#E4F2EF] text-[#176D68] grid place-items-center shrink-0">
                  <Icon size={21} />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-[#20302D]">
                    {event.title}
                  </h3>

                  <p className="text-xs text-[#81918B] mt-1">
                    {new Date(`${event.date}T12:00:00`).toLocaleDateString(
                      "en-US",
                      { weekday: "short", day: "numeric", month: "short" }
                    )}
                    {" · "}
                    {event.time}
                  </p>
                </div>

                <ChevronRight
                  size={18}
                  className="text-[#81918B] shrink-0"
                />
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
