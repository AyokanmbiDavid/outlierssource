
import React, { useMemo, useState } from "react";
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  BookOpen,
  CalendarDays,
  FileText,
  Megaphone,
  Award,
  Clock3,
  Filter,
  Inbox,
} from "lucide-react";

const initialNotifications = [
  {
    id: 1,
    title: "New course material available",
    message: "New lecture notes have been uploaded for Introduction to Computer Science.",
    category: "Academic",
    date: "2026-11-14",
    time: "10:30 AM",
    icon: BookOpen,
    read: false,
  },
  {
    id: 2,
    title: "Upcoming assignment deadline",
    message: "Your MTH 101 assignment is due soon. Remember to submit it before the deadline.",
    category: "Reminder",
    date: "2026-11-14",
    time: "09:15 AM",
    icon: Clock3,
    read: false,
  },
  {
    id: 3,
    title: "Departmental announcement",
    message: "A new departmental announcement has been published.",
    category: "Announcement",
    date: "2026-11-13",
    time: "03:20 PM",
    icon: Megaphone,
    read: false,
  },
  {
    id: 4,
    title: "Class timetable updated",
    message: "Your weekly class timetable has been updated.",
    category: "Schedule",
    date: "2026-11-12",
    time: "11:00 AM",
    icon: CalendarDays,
    read: true,
  },
  {
    id: 5,
    title: "Achievement unlocked",
    message: "Congratulations! You completed your learning milestone.",
    category: "Achievement",
    date: "2026-11-11",
    time: "02:45 PM",
    icon: Award,
    read: true,
  },
  {
    id: 6,
    title: "New assignment published",
    message: "A new assignment is available in your COS 101 course.",
    category: "Academic",
    date: "2026-11-10",
    time: "08:30 AM",
    icon: FileText,
    read: true,
  },
];

const filters = ["All", "Unread", "Read"];

const categoryStyles = {
  Academic: "bg-[#E4F2EF] text-[#176D68]",
  Reminder: "bg-orange-50 text-orange-700",
  Announcement: "bg-blue-50 text-blue-700",
  Schedule: "bg-indigo-50 text-indigo-700",
  Achievement: "bg-amber-50 text-amber-700",
};

export default function Notifications() {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [activeFilter, setActiveFilter] = useState("All");

  const unreadCount = notifications.filter((item) => !item.read).length;

  const filteredNotifications = useMemo(() => {
    return notifications.filter((item) => {
      if (activeFilter === "Unread") return !item.read;
      if (activeFilter === "Read") return item.read;
      return true;
    });
  }, [notifications, activeFilter]);

  const markAsRead = (id) => {
    setNotifications((previous) =>
      previous.map((item) =>
        item.id === id ? { ...item, read: true } : item
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications((previous) =>
      previous.map((item) => ({ ...item, read: true }))
    );
  };

  const deleteNotification = (id) => {
    setNotifications((previous) =>
      previous.filter((item) => item.id !== id)
    );
  };

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-[#176D68] mb-2">
            <Bell size={17} />
            Stay updated
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-[#20302D]">
            Notifications
          </h1>

          <p className="text-sm text-[#81918B] mt-1">
            Important updates about your academic activities.
          </p>
        </div>

        <button
          onClick={markAllAsRead}
          disabled={unreadCount === 0}
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#E4F2EF] text-[#176D68] text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <CheckCheck size={17} />
          Mark all as read
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-[#81918B]">Total notifications</p>
            <Bell size={19} className="text-[#176D68]" />
          </div>
          <p className="text-3xl font-bold text-[#20302D] mt-3">
            {notifications.length}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-[#81918B]">Unread notifications</p>
            <Inbox size={19} className="text-[#176D68]" />
          </div>
          <p className="text-3xl font-bold text-[#176D68] mt-3">
            {unreadCount}
          </p>
        </div>
      </div>

      {/* Notification list */}
      <section className="bg-white rounded-3xl p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
          <div>
            <h2 className="text-lg font-bold text-[#20302D]">
              Your notifications
            </h2>
            <p className="text-xs text-[#81918B] mt-1">
              You have {unreadCount} unread updates
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Filter size={16} className="text-[#81918B]" />

            <div className="flex gap-1 bg-[#F1F5F3] rounded-xl p-1">
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold ${
                    activeFilter === filter
                      ? "bg-white text-[#176D68]"
                      : "text-[#81918B]"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </div>

        {filteredNotifications.length > 0 ? (
          <div className="space-y-2">
            {filteredNotifications.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.id}
                  className={`flex items-start gap-3 p-4 rounded-2xl transition-colors ${
                    item.read ? "bg-white" : "bg-[#F1F7F5]"
                  }`}
                >
                  <div className="w-11 h-11 rounded-xl bg-[#E4F2EF] text-[#176D68] grid place-items-center shrink-0">
                    <Icon size={20} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-semibold text-[#20302D]">
                        {item.title}
                      </h3>

                      {!item.read && (
                        <span className="w-2 h-2 rounded-full bg-[#176D68]" />
                      )}
                    </div>

                    <p className="text-xs text-[#71827C] leading-relaxed mt-2">
                      {item.message}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      <span
                        className={`text-[10px] font-semibold px-2 py-1 rounded-full ${
                          categoryStyles[item.category]
                        }`}
                      >
                        {item.category}
                      </span>

                      <span className="text-[11px] text-[#81918B]">
                        {item.date} · {item.time}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {!item.read && (
                      <button
                        onClick={() => markAsRead(item.id)}
                        title="Mark as read"
                        aria-label={`Mark ${item.title} as read`}
                        className="w-9 h-9 rounded-xl grid place-items-center text-[#176D68] hover:bg-[#E4F2EF]"
                      >
                        <Check size={18} />
                      </button>
                    )}

                    <button
                      onClick={() => deleteNotification(item.id)}
                      title="Delete notification"
                      aria-label={`Delete ${item.title}`}
                      className="w-9 h-9 rounded-xl grid place-items-center text-[#81918B] hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#E4F2EF] text-[#176D68] grid place-items-center mx-auto mb-4">
              <Inbox size={28} />
            </div>

            <h3 className="font-semibold text-[#20302D]">
              No notifications here
            </h3>

            <p className="text-sm text-[#81918B] mt-1">
              {activeFilter === "Unread"
                ? "You're all caught up."
                : "Your notifications will appear here."}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
