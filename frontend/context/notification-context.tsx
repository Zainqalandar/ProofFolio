"use client";

import { createContext, ReactNode, useCallback, useContext, useReducer } from "react";

export type NotificationType = "success" | "error" | "warning" | "info";
export type Notification = { id: string; type: NotificationType; message: string; duration: number };
type Action = { type: "ADD"; payload: Notification } | { type: "REMOVE"; id: string };
type NotificationContextValue = {
  notifications: Notification[];
  notify: (type: NotificationType, message: string, duration?: number) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  warning: (message: string) => void;
  dismiss: (id: string) => void;
};

const NotificationContext = createContext<NotificationContextValue | null>(null);
function reducer(state: Notification[], action: Action) {
  return action.type === "ADD" ? [action.payload, ...state].slice(0, 4) : state.filter((item) => item.id !== action.id);
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, dispatch] = useReducer(reducer, []);
  const dismiss = useCallback((id: string) => dispatch({ type: "REMOVE", id }), []);
  const notify = useCallback((type: NotificationType, message: string, duration = type === "error" ? 6000 : 4000) => {
    const id = `notice-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    dispatch({ type: "ADD", payload: { id, type, message, duration } });
    if (duration) window.setTimeout(() => dismiss(id), duration);
  }, [dismiss]);
  const value = { notifications, notify, dismiss, success: (message: string) => notify("success", message), error: (message: string) => notify("error", message), info: (message: string) => notify("info", message), warning: (message: string) => notify("warning", message) };
  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) throw new Error("useNotification must be used inside NotificationProvider");
  return context;
}
