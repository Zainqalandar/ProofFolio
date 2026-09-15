"use client";

import { CheckCircle2, CircleAlert, Info, X, XCircle } from "lucide-react";
import { useNotification, type NotificationType } from "@/context/notification-context";

const styles: Record<NotificationType, { icon: typeof Info; className: string }> = {
  success: { icon: CheckCircle2, className: "border-lime-300/50 bg-[#161d30] text-lime-100" },
  error: { icon: XCircle, className: "border-rose-400/50 bg-[#2a1723] text-rose-100" },
  warning: { icon: CircleAlert, className: "border-amber-300/50 bg-[#292315] text-amber-100" },
  info: { icon: Info, className: "border-sky-300/50 bg-[#142532] text-sky-100" },
};

export function NotificationContainer() {
  const { notifications, dismiss } = useNotification();
  return <div className="pointer-events-none fixed right-4 top-4 z-[100] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-3">
    {notifications.map((notice) => {
      const config = styles[notice.type]; const Icon = config.icon;
      return <div key={notice.id} role="alert" className={`pointer-events-auto flex items-start gap-3 rounded-2xl border p-4 shadow-2xl shadow-black/30 ${config.className}`}>
        <Icon className="mt-0.5 h-5 w-5 shrink-0" />
        <p className="flex-1 text-sm leading-5">{notice.message}</p>
        <button onClick={() => dismiss(notice.id)} aria-label="Dismiss notification" className="rounded-lg p-1 opacity-70 hover:bg-white/10 hover:opacity-100"><X className="h-4 w-4" /></button>
      </div>;
    })}
  </div>;
}
