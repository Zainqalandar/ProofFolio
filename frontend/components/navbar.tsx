"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSyncExternalStore } from "react";
import { ArrowUpRight, LayoutDashboard, LogOut, Plus, Sparkles } from "lucide-react";
import { clearAuthToken, hasAuthToken, subscribeToAuthChanges } from "@/utils/auth";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const isAuthenticated = useSyncExternalStore(subscribeToAuthChanges, hasAuthToken, () => false);
  const isAuthPage = pathname === "/signin" || pathname === "/signup";
  return <header className="sticky top-0 z-50 border-b border-white/8 bg-[#0a0d18]/85 backdrop-blur-xl">
    <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-8">
      <Link href="/" className="group flex items-center gap-2.5" aria-label="ProofFolio home"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-lime-300 text-[#101424] shadow-[0_0_25px_rgba(216,255,99,.27)] transition-transform group-hover:rotate-6"><Sparkles className="h-5 w-5" strokeWidth={2.6} /></span><span className="text-lg font-bold tracking-[-.055em] text-white">Proof<span className="text-lime-300">Folio</span></span></Link>
      {!isAuthPage && <nav className="hidden items-center gap-7 text-sm text-slate-400 md:flex"><Link href="/#how-it-works" className="transition hover:text-white">How it works</Link><Link href="/#why-proof" className="transition hover:text-white">Why ProofFolio</Link></nav>}
      <div className="flex items-center gap-2.5">{isAuthenticated ? <><Link href="/dashboard" className="inline-flex items-center gap-1.5 rounded-xl px-2.5 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-white/5 hover:text-white"><LayoutDashboard className="h-4 w-4" /><span className="hidden md:inline">Dashboard</span></Link><Link href="/case-studies/new" className="hidden items-center gap-1.5 rounded-xl bg-lime-300 px-3.5 py-2.5 text-sm font-bold text-[#101424] transition hover:bg-lime-200 sm:flex"><Plus className="h-4 w-4" /> New proof</Link><button type="button" onClick={() => { clearAuthToken(); router.replace("/signin"); }} className="flex items-center gap-1.5 rounded-xl border border-white/12 px-3 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-white/30 hover:bg-white/5"><LogOut className="h-4 w-4" /><span className="hidden sm:inline">Log out</span></button></> : <><Link href="/signin" className="hidden rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-white/5 sm:inline-flex">Sign in</Link><Link href="/signup" className="flex items-center gap-1.5 rounded-xl bg-lime-300 px-3.5 py-2.5 text-sm font-bold text-[#101424] transition hover:-translate-y-0.5 hover:bg-lime-200">Start collecting <ArrowUpRight className="h-4 w-4" /></Link></>}</div>
    </div>
  </header>;
}
