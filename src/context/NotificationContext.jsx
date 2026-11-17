
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

const NotificationContext = createContext(null);
const STORAGE_KEY = "outlierssource_notifications";

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "[]");
    } catch {
      return [];
    }
  });

  const timers = useRef(new Map());

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  }, [notifications]);

  const dismiss = useCallback(id => {
    clearTimeout(timers.current.get(id));
    timers.current.delete(id);
    setNotifications(prev => prev.filter(item => item.id !== id));
  }, []);

  const notify = useCallback((message, type = "info", options = {}) => {
    const id = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`;
    const notification = {
      id,
      message,
      type,
      title: options.title || "",
      createdAt: Date.now(),
      read: false,
      duration: options.duration ?? 0
    };

    setNotifications(prev => [notification, ...prev].slice(0, 50));

    if (notification.duration > 0) {
      timers.current.set(id, setTimeout(() => dismiss(id), notification.duration));
    }

    return id;
  }, [dismiss]);

  const markAsRead = useCallback(id => {
    setNotifications(prev => prev.map(item => item.id === id ? { ...item, read: true } : item));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(item => ({ ...item, read: true })));
  }, []);

  const clearAll = useCallback(() => {
    timers.current.forEach(timer => clearTimeout(timer));
    timers.current.clear();
    setNotifications([]);
  }, []);

  useEffect(() => () => {
    timers.current.forEach(timer => clearTimeout(timer));
    timers.current.clear();
  }, []);

  const unreadCount = notifications.filter(item => !item.read).length;

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      notify,
      dismiss,
      markAsRead,
      markAllAsRead,
      clearAll
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) throw new Error("useNotifications must be used inside NotificationProvider");
  return context;
}
