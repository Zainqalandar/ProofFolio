import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/navbar";
import { NotificationProvider } from "@/context/notification-context";
import { NotificationContainer } from "@/components/notification-container";

export const metadata: Metadata = {
  title: "ProofFolio — Proof that speaks for your work",
  description: "Collect, approve, and present client proof in one polished portfolio.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <NotificationProvider>
          <NotificationContainer />
          <Navbar />
          {children}
        </NotificationProvider>
      </body>
    </html>
  );
}
