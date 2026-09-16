"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import { ArrowUpRight, LayoutDashboard, LogOut, Plus } from "lucide-react";
import type { AuthUser } from "@/types/api";
import { getCurrentUser } from "@/utils/auth-api";
import { clearAuthToken, getAuthToken, subscribeToAuthChanges, subscribeToProfileChanges } from "@/utils/auth";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const token = useSyncExternalStore(subscribeToAuthChanges, getAuthToken, () => null);
  const [profile, setProfile] = useState<{ token: string; user: AuthUser } | null>(null);
  const user = profile?.token === token ? profile.user : null;
  const isAuthenticated = Boolean(token);
  const isAuthPage = pathname === "/signin" || pathname === "/signup";
  const isExplorePage = pathname === "/explore" || pathname.startsWith("/explore/");
  const exploreClassName = isExplorePage
    ? "rounded-lg bg-lime-300/10 px-3 py-2 font-semibold text-lime-300"
    : "rounded-lg px-3 py-2 text-slate-400 transition hover:bg-white/5 hover:text-white";

  useEffect(() => {
    if (!token) return;

    let cancelled = false;
    const loadProfile = () => {
      void getCurrentUser()
        .then((response) => {
          if (!cancelled) setProfile({ token, user: response.data.user });
        })
        .catch(() => {
          if (!cancelled) setProfile(null);
        });
    };

    loadProfile();
    const unsubscribe = subscribeToProfileChanges(loadProfile);
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [token]);

  return (
    <header className="sticky top-0 z-50 border-b border-white/8 bg-[#0a0d18]/85 backdrop-blur-xl">
      <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between gap-3 px-5 sm:px-8">
        <Link href="/" className="group flex shrink-0 items-center gap-2.5 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime-300" aria-label="ProofFolio home">
          <Image src="/prooffolio-mark.svg" alt="" width={38} height={38} className="transition-transform group-hover:-rotate-6" priority />
          <span className="hidden text-lg font-bold tracking-[-.055em] text-white min-[380px]:inline">Proof<span className="text-lime-300">Folio</span></span>
        </Link>

        {!isAuthPage && (
          <nav aria-label="Main navigation" className="hidden items-center gap-1 text-sm lg:flex">
            <Link href="/explore" aria-current={isExplorePage ? "page" : undefined} className={exploreClassName}>Explore</Link>
            <Link href="/#how-it-works" className="rounded-lg px-3 py-2 text-slate-400 transition hover:bg-white/5 hover:text-white">How it works</Link>
            <Link href="/#why-proof" className="rounded-lg px-3 py-2 text-slate-400 transition hover:bg-white/5 hover:text-white">Why ProofFolio</Link>
          </nav>
        )}

        <div className="flex shrink-0 items-center gap-2 sm:gap-2.5">
          {isAuthenticated ? (
            <>
              <Link href="/dashboard" className="inline-flex items-center gap-1.5 rounded-xl px-2.5 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-white/5 hover:text-white focus-visible:outline-2 focus-visible:outline-lime-300" aria-label="Dashboard">
                <LayoutDashboard className="h-4 w-4" />
                <span className="hidden lg:inline">Dashboard</span>
              </Link>
              <Link href="/case-studies/new" className="hidden items-center gap-1.5 rounded-xl bg-lime-300 px-3.5 py-2.5 text-sm font-bold text-[#101424] transition hover:bg-lime-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-300 sm:flex">
                <Plus className="h-4 w-4" /> New proof
              </Link>
              <button type="button" onClick={() => { setProfile(null); clearAuthToken(); router.replace("/signin"); }} className="flex items-center gap-1.5 rounded-xl border border-white/12 px-3 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-white/30 hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-lime-300" aria-label="Log out">
                <LogOut className="h-4 w-4" />
                <span className="hidden lg:inline">Log out</span>
              </button>
              {user ? (
                <Link href={`/profile/${encodeURIComponent(user.profileSlug)}`} aria-label={`View ${user.name}'s profile`} title="View your profile" className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-lime-300/70 bg-[#222944] text-sm font-bold text-lime-200 ring-2 ring-lime-300/10 transition hover:border-lime-200 hover:ring-lime-300/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-300">
                  {user.profilePicture ? (
                    <Image src={user.profilePicture} alt="" width={40} height={40} unoptimized className="h-full w-full object-cover" />
                  ) : (
                    <span aria-hidden="true">{user.name.trim().charAt(0).toUpperCase() || "P"}</span>
                  )}
                </Link>
              ) : (
                <span aria-hidden="true" className="h-10 w-10 shrink-0 rounded-full border-2 border-white/10 bg-white/5" />
              )}
            </>
          ) : (
            <>
              <Link href="/signin" className="hidden rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-white/5 sm:inline-flex">Sign in</Link>
              <Link href="/signup" className="flex items-center gap-1.5 rounded-xl bg-lime-300 px-3.5 py-2.5 text-sm font-bold text-[#101424] transition hover:-translate-y-0.5 hover:bg-lime-200">Start collecting <ArrowUpRight className="h-4 w-4" /></Link>
            </>
          )}
        </div>
      </div>

      {!isAuthPage && (
        <nav aria-label="Mobile navigation" className="flex items-center justify-center gap-1 border-t border-white/8 px-3 py-1.5 text-xs lg:hidden">
          <Link href="/explore" aria-current={isExplorePage ? "page" : undefined} className={exploreClassName}>Explore</Link>
          <Link href="/#how-it-works" className="rounded-lg px-3 py-2 text-slate-400 transition hover:bg-white/5 hover:text-white">How it works</Link>
          <Link href="/#why-proof" className="rounded-lg px-3 py-2 text-slate-400 transition hover:bg-white/5 hover:text-white">Why ProofFolio</Link>
        </nav>
      )}
    </header>
  );
}
