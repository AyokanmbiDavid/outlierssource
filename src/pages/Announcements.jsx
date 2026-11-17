
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search, Megaphone, Pin, CalendarDays, Clock3, ChevronRight,
  Bell, X, RefreshCw, AlertCircle, Image as ImageIcon
} from "lucide-react";
import { supabase } from "../services/supabase";

const BUCKET = "announcement-images";
const categories = ["All", "Academic", "Examinations", "Assignments", "Events", "General"];

const priorityStyles = {
  Urgent: "bg-[#FCEBE9] text-[#B5473C]",
  Important: "bg-[#FFF3DD] text-[#98651B]",
  Normal: "bg-[#E4F2EF] text-[#176D68]"
};

const formatDate = date => date
  ? new Date(date).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })
  : "Recently";

const formatTime = date => date
  ? new Date(date).toLocaleTimeString("en-NG", { hour: "numeric", minute: "2-digit" })
  : "";

function AnnouncementCard({ item, onOpen }) {
  return (
    <article className="bg-white rounded-[22px] p-5 sm:p-6 hover:shadow-lg hover:shadow-[#176D68]/5 transition-all">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-3 py-1.5 rounded-full bg-[#F1F5F3] text-[11px] font-semibold text-[#71827C]">
            {item.category || "General"}
          </span>
          <span className={`px-3 py-1.5 rounded-full text-[11px] font-semibold ${priorityStyles[item.priority] || priorityStyles.Normal}`}>
            {item.priority || "Normal"}
          </span>
        </div>
        {item.pinned && <Pin size={17} className="text-[#176D68] shrink-0" />}
      </div>

      {item.image_url && (
        <img
          src={item.image_url}
          alt=""
          loading="lazy"
          className="w-full max-h-64 object-cover rounded-xl mt-5"
        />
      )}

      <h3 className="text-[17px] font-bold text-[#20302D] mt-5 leading-snug">
        {item.title}
      </h3>
      <p className="text-sm text-[#81918B] mt-3 leading-relaxed line-clamp-3">
        {item.content}
      </p>

      <div className="flex flex-wrap items-center justify-between gap-3 mt-6 pt-4 border-t border-[#F1F5F3]">
        <div>
          <p className="text-xs font-semibold text-[#53645E]">Department Administration</p>
          <p className="flex items-center gap-1.5 text-[11px] text-[#9AA7A1] mt-1">
            <CalendarDays size={12} />
            {formatDate(item.published_at || item.created_at)}
            <span>·</span>
            <Clock3 size={12} />
            {formatTime(item.published_at || item.created_at)}
          </p>
        </div>
        <button
          onClick={() => onOpen(item)}
          className="flex items-center gap-1.5 text-xs font-bold text-[#176D68] hover:gap-2.5 transition-all"
        >
          Read announcement <ChevronRight size={16} />
        </button>
      </div>
    </article>
  );
}

export default function Announcements() {
  const [announcements, setAnnouncements] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchAnnouncements = useCallback(async (manual = false) => {
    if (manual) setRefreshing(true);
    else setLoading(true);

    try {
      const { data, error: queryError } = await supabase
        .from("announcements")
        .select("id, title, content, category, priority, target_audience, published_at, created_at, expires_at, image_path")
        .eq("is_published", true)
        .order("published_at", { ascending: false, nullsFirst: false });

      if (queryError) throw queryError;

      const now = new Date();
      const validItems = (data || []).filter(item =>
        !item.expires_at || new Date(item.expires_at) > now
      );

      const itemsWithImages = await Promise.all(
        validItems.map(async item => {
          if (!item.image_path) return { ...item, image_url: null };

          const { data: imageData, error: imageError } = await supabase.storage
            .from(BUCKET)
            .createSignedUrl(item.image_path, 3600);

          if (imageError) console.error("Announcement image error:", imageError);

          return {
            ...item,
            image_url: imageData?.signedUrl || null
          };
        })
      );

      setAnnouncements(itemsWithImages);
      setError("");
    } catch (err) {
      console.error("Announcements fetch error:", err);
      setError(err.message || "Unable to load announcements.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAnnouncements();

    const channel = supabase
      .channel("student-announcements-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "announcements" },
        () => fetchAnnouncements()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchAnnouncements]);

  const filtered = useMemo(() => {
    const query = search.toLowerCase().trim();

    return announcements.filter(item => {
      const matchesSearch =
        (item.title || "").toLowerCase().includes(query) ||
        (item.content || "").toLowerCase().includes(query) ||
        (item.category || "").toLowerCase().includes(query);

      const matchesCategory = category === "All" || item.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [announcements, search, category]);

  return (
    <div className="space-y-7 pb-6">
      <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-sm text-[#81918B]">Stay informed and updated</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#20302D] mt-1">
            Announcements
          </h1>
          <p className="text-sm text-[#81918B] mt-2">
            Important updates from your department and lecturers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-[#E4F2EF] text-[#176D68] px-4 py-3 rounded-2xl">
            <Megaphone size={19} />
            <span className="text-sm font-semibold">
              {announcements.length} Updates
            </span>
          </div>
          <button
            onClick={() => fetchAnnouncements(true)}
            disabled={refreshing}
            className="w-11 h-11 rounded-xl bg-white text-[#176D68] grid place-items-center disabled:opacity-50"
            aria-label="Refresh announcements"
          >
            <RefreshCw size={18} className={refreshing ? "animate-spin" : ""} />
          </button>
        </div>
      </section>

      <section className="bg-[#E4F2EF] rounded-[24px] p-5 sm:p-6 flex items-start gap-4">
        <div className="w-11 h-11 rounded-2xl bg-white text-[#176D68] grid place-items-center shrink-0">
          <Bell size={21} />
        </div>
        <div>
          <h2 className="font-bold text-[#20302D]">Stay up to date</h2>
          <p className="text-sm text-[#53645E] mt-1 leading-relaxed">
            Check regularly so you don't miss important academic information, deadlines and departmental updates.
          </p>
        </div>
      </section>

      <section className="bg-white rounded-[22px] p-4 sm:p-5 space-y-5">
        <div className="relative">
          <Search size={19} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#81918B]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search announcements..."
            className="w-full h-12 pl-12 pr-4 rounded-full bg-[#F5F8F6] text-sm outline-none focus:ring-2 focus:ring-[#176D68]/20"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {categories.map(item => (
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
      </section>

      <section>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-[#20302D]">Latest Updates</h2>
            <p className="text-xs text-[#81918B] mt-1">
              {filtered.length} announcements found
            </p>
          </div>
          <button
            onClick={() => { setSearch(""); setCategory("All"); }}
            className="text-xs font-semibold text-[#176D68]"
          >
            Reset filters
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 rounded-xl p-4 mb-4 flex gap-2 text-sm">
            <AlertCircle size={18} className="shrink-0" /> {error}
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-[24px] p-12 text-center text-sm text-[#81918B]">
            <RefreshCw size={25} className="mx-auto animate-spin text-[#176D68] mb-3" />
            Loading announcements...
          </div>
        ) : filtered.length > 0 ? (
          <div className="space-y-4">
            {filtered.map(item => (
              <AnnouncementCard key={item.id} item={item} onOpen={setSelected} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-[24px] p-10 text-center">
            <Megaphone size={28} className="mx-auto text-[#81918B]" />
            <h3 className="font-bold text-[#20302D] mt-4">No announcements found</h3>
            <p className="text-sm text-[#81918B] mt-2">
              {announcements.length === 0
                ? "There are no published announcements available right now."
                : "Try changing your search or category."}
            </p>
          </div>
        )}
      </section>

      {selected && (
        <div
          className="fixed inset-0 z-[100] bg-[#152522]/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-5"
          onClick={() => setSelected(null)}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="announcement-title"
            onClick={e => e.stopPropagation()}
            className="bg-white w-full max-w-xl max-h-[85vh] overflow-y-auto rounded-t-[26px] sm:rounded-[26px] p-6"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#176D68]">
                {selected.category || "General"} · {selected.priority || "Normal"}
              </span>
              <button
                onClick={() => setSelected(null)}
                className="w-9 h-9 rounded-full bg-[#F1F5F3] grid place-items-center text-[#53645E]"
                aria-label="Close announcement"
              >
                <X size={18} />
              </button>
            </div>

            {selected.image_url && (
              <img
                src={selected.image_url}
                alt=""
                className="w-full max-h-72 object-cover rounded-xl mt-5"
              />
            )}

            <h2 id="announcement-title" className="text-xl sm:text-2xl font-bold text-[#20302D] mt-5">
              {selected.title}
            </h2>

            <div className="flex flex-wrap items-center gap-3 mt-4 text-xs text-[#81918B]">
              <span>Department Administration</span>
              <span>·</span>
              <span>{formatDate(selected.published_at || selected.created_at)}</span>
            </div>

            <p className="mt-6 text-sm text-[#53645E] leading-7 whitespace-pre-wrap">
              {selected.content}
            </p>

            <button
              onClick={() => setSelected(null)}
              className="w-full mt-8 py-3 rounded-full bg-[#176D68] text-white font-semibold text-sm"
            >
              Close announcement
            </button>
          </section>
        </div>
      )}
    </div>
  );
}
