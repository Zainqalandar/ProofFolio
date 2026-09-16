"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, BriefcaseBusiness, LoaderCircle, RefreshCw, Sparkles } from "lucide-react";
import { getPublicProfiles } from "@/utils/prooffolio-api";
import { getApiErrorMessage } from "@/utils/api-error";
import type { PublicProfilesResponse } from "@/types/api";

const PAGE_SIZE = 9;

export default function PublicProfilesDirectory() {
  const [data, setData] = useState<PublicProfilesResponse | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const loadProfiles = async () => {
      try {
        setLoading(true);
        setLoadError("");
        const response = await getPublicProfiles({ page, limit: PAGE_SIZE });
        if (!cancelled) setData(response.data);
      } catch (requestError) {
        if (!cancelled) setLoadError(getApiErrorMessage(requestError, "Public profiles could not be loaded."));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void loadProfiles();
    return () => { cancelled = true; };
  }, [page, retryKey]);

  return (
    <main className="flex-1 bg-[#0a0d18]">
      <section className="relative overflow-hidden border-b border-white/8 px-5 py-16 sm:px-8 sm:py-20">
        <div className="grid-glow absolute inset-0 opacity-40 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
        <div className="absolute left-1/2 top-0 h-72 w-[650px] -translate-x-1/2 rounded-full bg-lime-300/8 blur-[110px]" />
        <div className="relative mx-auto max-w-6xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-lime-300/20 bg-lime-300/8 px-3 py-1.5 text-xs font-bold uppercase tracking-[.16em] text-lime-200"><Sparkles className="h-3.5 w-3.5" /> Public directory</p>
          <h1 className="mt-6 max-w-3xl text-5xl font-semibold tracking-[-.065em] text-white sm:text-7xl">Discover work that<br /><span className="text-lime-300">speaks for itself.</span></h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-400">Browse public creator profiles and the real projects behind their proof.</p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
        <div className="flex items-end justify-between gap-4">
          <div><p className="text-xs font-bold uppercase tracking-[.18em] text-fuchsia-300">ProofFolio community</p><h2 className="mt-2 text-3xl font-semibold tracking-[-.05em] text-white">Profiles and projects</h2></div>
          {data && <span className="text-sm text-slate-500">{data.pagination.total} public {data.pagination.total === 1 ? "profile" : "profiles"}</span>}
        </div>

        {loading && !data ? (
          <div className="grid min-h-64 place-items-center"><LoaderCircle className="h-7 w-7 animate-spin text-lime-300" /></div>
        ) : loadError && !data ? (
          <div className="mt-7 rounded-3xl border border-rose-300/15 bg-rose-300/[.04] p-10 text-center"><p className="text-sm text-rose-200">{loadError}</p><button type="button" onClick={() => setRetryKey((value) => value + 1)} className="mt-5 inline-flex items-center gap-2 rounded-xl border border-white/12 px-4 py-2.5 text-sm font-bold text-white hover:bg-white/5"><RefreshCw className="h-4 w-4" /> Try again</button></div>
        ) : data && data.profiles.length > 0 ? (
          <div className={`mt-7 grid gap-5 lg:grid-cols-2 ${loading ? "opacity-55" : ""}`} aria-busy={loading}>
            {data.profiles.map((profile) => (
              <article key={profile.profileSlug} className="flex flex-col rounded-3xl border border-white/8 bg-[#111728] p-6 sm:p-7">
                <div className="flex items-start gap-4">
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-fuchsia-300/15 text-lg font-bold text-fuchsia-200">
                    {profile.profilePicture ? (
                      // User-uploaded images can be hosted by different Cloudinary accounts.
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={profile.profilePicture} alt={`${profile.name} profile`} className="h-full w-full object-cover" />
                    ) : <span className="grid h-full w-full place-items-center">{profile.name.charAt(0).toUpperCase()}</span>}
                  </div>
                  <div className="min-w-0 flex-1"><h3 className="truncate text-xl font-semibold tracking-[-.04em] text-white">{profile.name}</h3><p className="mt-1 truncate text-xs text-slate-500">/{profile.profileSlug}</p></div>
                  <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-lime-300/8 px-2.5 py-1 text-[11px] font-bold text-lime-200"><BriefcaseBusiness className="h-3 w-3" /> {profile.projectCount}</span>
                </div>

                <p className="mt-5 line-clamp-2 min-h-12 text-sm leading-6 text-slate-400">{profile.bio || "Independent professional sharing real work and client proof."}</p>

                <div className="mt-6 space-y-2.5">
                  {profile.projects.length > 0 ? profile.projects.map((project) => (
                    <div key={project._id} className="flex items-center gap-3 rounded-2xl border border-white/7 bg-[#0b1020] p-2.5">
                      {project.screenshots[0] ? (
                        // Project screenshots are stored on user-configured Cloudinary hosts.
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={project.screenshots[0]} alt="" className="h-14 w-16 shrink-0 rounded-xl object-cover" />
                      ) : <span className="grid h-14 w-16 shrink-0 place-items-center rounded-xl bg-white/[.04]"><BriefcaseBusiness className="h-4 w-4 text-slate-600" /></span>}
                      <div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-100">{project.title}</p><p className="mt-1 line-clamp-1 text-xs text-slate-500">{project.description}</p></div>
                    </div>
                  )) : <div className="grid min-h-20 place-items-center rounded-2xl border border-dashed border-white/8 text-xs text-slate-600">No projects published yet</div>}
                </div>

                <Link href={`/profile/${profile.profileSlug}`} className="mt-6 inline-flex items-center gap-2 self-start text-sm font-bold text-lime-300 hover:text-lime-200">View full profile <ArrowUpRight className="h-4 w-4" /></Link>
              </article>
            ))}
          </div>
        ) : data ? (
          <div className="mt-7 rounded-3xl border border-dashed border-white/10 p-12 text-center"><BriefcaseBusiness className="mx-auto h-8 w-8 text-slate-600" /><h3 className="mt-4 font-semibold text-white">No public profiles yet.</h3><p className="mt-2 text-sm text-slate-500">The first creator profile will appear here automatically.</p></div>
        ) : null}

        {data && data.pagination.totalPages > 1 && <div className="mt-9 flex items-center justify-center gap-3"><button type="button" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={page === 1 || loading} className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/10 px-3 text-xs font-bold text-slate-300 hover:bg-white/5 disabled:opacity-30"><ArrowLeft className="h-3.5 w-3.5" /> Previous</button><span className="text-xs text-slate-500">Page {data.pagination.page} of {data.pagination.totalPages}</span><button type="button" onClick={() => setPage((value) => Math.min(data.pagination.totalPages, value + 1))} disabled={page >= data.pagination.totalPages || loading} className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/10 px-3 text-xs font-bold text-slate-300 hover:bg-white/5 disabled:opacity-30">Next <ArrowRight className="h-3.5 w-3.5" /></button></div>}
      </section>
    </main>
  );
}
