
import React, { useEffect, useState } from "react";
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from "lucide-react";
import { useNotifications } from "../context/NotificationContext";

const config = {
  success: { icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
  error: { icon: AlertCircle, color: "text-red-600", bg: "bg-red-50" },
  warning: { icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-50" },
  info: { icon: Info, color: "text-[#176D68]", bg: "bg-[#EFF7F4]" }
};

export default function NotificationPanel() {
  const { notifications, dismiss } = useNotifications();
  const [visible, setVisible] = useState([]);

  useEffect(() => {
    setVisible(notifications.slice(0, 4));
  }, [notifications]);

  return (
    <div className="fixed right-3 top-4 z-[9999] flex w-[calc(100%-24px)] max-w-sm flex-col gap-3 pointer-events-none">
      {visible.map(item => {
        const style = config[item.type] || config.info;
        const Icon = style.icon;

        return (
          <Toast
            key={item.id}
            item={item}
            Icon={Icon}
            style={style}
            dismiss={dismiss}
          />
        );
      })}
    </div>
  );
}

function Toast({ item, Icon, style, dismiss }) {
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLeaving(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!leaving) return;
    const timer = setTimeout(() => dismiss(item.id), 300);
    return () => clearTimeout(timer);
  }, [leaving, dismiss, item.id]);

  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 rounded-2xl border border-[#E7EEEA] bg-white p-4 shadow-xl transition-all duration-300 ${
        leaving
          ? "translate-x-full opacity-0"
          : "translate-x-0 opacity-100 animate-[toastIn_0.35s_ease-out]"
      }`}
    >
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${style.bg} ${style.color}`}>
        <Icon size={21} />
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="text-sm font-bold text-[#20302D]">
          {item.title || item.type.toUpperCase()}
        </h3>
        <p className="mt-1 break-words text-xs leading-5 text-[#71827C]">
          {item.message}
        </p>
      </div>

      <button
        onClick={() => dismiss(item.id)}
        aria-label="Dismiss notification"
        className="rounded-lg p-1 text-[#9AA9A1] hover:bg-[#F1F5F3]"
      >
        <X size={17} />
      </button>
    </div>
  );
}
