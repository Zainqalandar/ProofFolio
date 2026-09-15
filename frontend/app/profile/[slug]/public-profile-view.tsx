"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, BadgeCheck, BriefcaseBusiness, CalendarDays, LoaderCircle, MessageSquareQuote, Sparkles } from "lucide-react";
import { getPublicProfile } from "@/utils/prooffolio-api";
import { getApiErrorMessage } from "@/utils/api-error";
import type { PublicProfileResponse, Testimonial } from "@/types/api";

const caseStudyTitle = (testimonial: Testimonial) =>
  typeof testimonial.caseStudy === "string" ? "Client result" : testimonial.caseStudy.title;

const formattedDate = (value: string) =>
  new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));

export default function PublicProfileView({ slug }: { slug: string }) {
  const [data, setData] = useState<PublicProfileResponse | null>(null);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<"newest" | "oldest">("newest");
  const [selectedCaseStudy, setSelectedCaseStudy] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setLoadError("");
        const response = await getPublicProfile(slug, {
          page,
          limit: 6,
          sort,
          ...(selectedCaseStudy ? { caseStudy: selectedCaseStudy } : {}),
        });
        setData(response.data);
      } catch (requestError) {
        setLoadError(getApiErrorMessage(requestError, "This profile could not be loaded."));
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [page, selectedCaseStudy, slug, sort]);

  if (loading && !data) return <main className="grid flex-1 place-items-center bg-[#0a0d18]"><LoaderCircle className="h-7 w-7 animate-spin text-lime-300" /></main>;
  if (loadError && !data) return <main className="grid flex-1 place-items-center bg-[#0a0d18] px-5"><div className="max-w-md text-center"><MessageSquareQuote className="mx-auto h-9 w-9 text-rose-300" /><h1 className="mt-5 text-3xl font-semibold tracking-[-.05em] text-white">Profile unavailable</h1><p className="mt-3 text-sm leading-6 text-slate-400">{loadError}</p><Link href="/" className="mt-6 inline-flex font-bold text-lime-300">Back to ProofFolio</Link></div></main>;
  if (!data) return null;

  return (
    <main className="flex-1 bg-[#0a0d18]">
      <section className="relative overflow-hidden border-b border-white/8 px-5 py-16 sm:px-8 sm:py-20">
        <div className="grid-glow absolute inset-0 opacity-40 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
        <div className="absolute left-1/2 top-0 h-72 w-[650px] -translate-x-1/2 rounded-full bg-lime-300/8 blur-[110px]" />
        <div className="relative mx-auto max-w-6xl">
          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
            <div className="max-w-3xl">
              <div className="flex items-center gap-3"><span className="grid h-14 w-14 place-items-center rounded-2xl bg-fuchsia-300/15 text-xl font-bold text-fuchsia-200">{data.profile.name.charAt(0).toUpperCase()}</span><span className="inline-flex items-center gap-1.5 rounded-full border border-lime-300/20 bg-lime-300/8 px-3 py-1.5 text-xs font-bold text-lime-200"><BadgeCheck className="h-3.5 w-3.5" /> ProofFolio profile</span></div>
              <h1 className="mt-7 text-5xl font-semibold tracking-[-.065em] text-white sm:text-7xl">{data.profile.name}</h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-400">{data.profile.bio || "Independent professional sharing real work and verified client experiences."}</p>
            </div>
            <div className="flex gap-7 rounded-2xl border border-white/8 bg-[#111728]/80 px-6 py-5 backdrop-blur"><div><p className="text-2xl font-semibold text-white">{data.caseStudies.length}</p><p className="mt-1 text-xs text-slate-500">Case studies</p></div><div className="w-px bg-white/8" /><div><p className="text-2xl font-semibold text-white">{data.pagination.total}</p><p className="mt-1 text-xs text-slate-500">Testimonials</p></div></div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
        <div className="flex items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-fuchsia-300">Selected work</p><h2 className="mt-2 text-3xl font-semibold tracking-[-.05em] text-white">Case studies</h2></div></div>
        {data.caseStudies.length === 0 ? <p className="mt-6 rounded-2xl border border-dashed border-white/10 p-8 text-center text-sm text-slate-500">No case studies published yet.</p> : <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{data.caseStudies.map((caseStudy, index) => <article key={caseStudy._id} className="overflow-hidden rounded-3xl border border-white/8 bg-[#111728]">
          {caseStudy.screenshots[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={caseStudy.screenshots[0]} alt={`${caseStudy.title} project screenshot`} className="h-48 w-full bg-[#0b1020] object-cover" />
          ) : <div className="grid h-48 place-items-center bg-gradient-to-br from-[#3c2c6d] to-[#1e6b59]"><BriefcaseBusiness className="h-8 w-8 text-white/50" /></div>}
          <div className="p-6"><p className="text-xs font-bold uppercase tracking-[.14em] text-lime-300">Case study {String(index + 1).padStart(2, "0")}</p><h3 className="mt-3 text-xl font-semibold tracking-[-.04em] text-white">{caseStudy.title}</h3><p className="mt-3 line-clamp-4 text-sm leading-6 text-slate-400">{caseStudy.description}</p></div>
        </article>)}</div>}

        <div className="mt-16 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div><p className="text-xs font-bold uppercase tracking-[.18em] text-lime-300">Client voice</p><h2 className="mt-2 text-3xl font-semibold tracking-[-.05em] text-white">Verified testimonials</h2></div>
          <div className="flex flex-wrap gap-2"><select aria-label="Filter testimonials by case study" value={selectedCaseStudy} onChange={(event) => { setSelectedCaseStudy(event.target.value); setPage(1); }} className="h-10 rounded-xl border border-white/10 bg-[#111728] px-3 text-xs font-semibold text-slate-300 outline-none"><option value="">All case studies</option>{data.caseStudies.map((caseStudy) => <option key={caseStudy._id} value={caseStudy._id}>{caseStudy.title}</option>)}</select><select aria-label="Sort testimonials" value={sort} onChange={(event) => { setSort(event.target.value as "newest" | "oldest"); setPage(1); }} className="h-10 rounded-xl border border-white/10 bg-[#111728] px-3 text-xs font-semibold text-slate-300 outline-none"><option value="newest">Newest first</option><option value="oldest">Oldest first</option></select></div>
        </div>

        <div className={`relative mt-6 grid gap-5 md:grid-cols-2 ${loading ? "opacity-50" : ""}`} aria-busy={loading}>
          {data.testimonials.map((testimonial) => <article key={testimonial._id} className="rounded-3xl border border-white/8 bg-[#111728] p-7"><div className="flex items-center justify-between gap-4"><MessageSquareQuote className="h-6 w-6 text-fuchsia-300" /><span className="rounded-full bg-lime-300/8 px-2.5 py-1 text-[11px] font-bold text-lime-200"><BadgeCheck className="mr-1 inline h-3 w-3" /> Approved</span></div>{testimonial.aiHighlight && <p className="mt-7 text-lg font-semibold leading-7 text-lime-200">“{testimonial.aiHighlight}”</p>}<p className="mt-4 text-sm leading-7 text-slate-300">“{testimonial.message}”</p><div className="mt-7 border-t border-white/8 pt-5"><p className="font-semibold text-white">{testimonial.clientName}</p><p className="mt-1 text-xs text-slate-500">{testimonial.clientCompany || caseStudyTitle(testimonial)}</p><p className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-600"><CalendarDays className="h-3 w-3" /> {formattedDate(testimonial.submittedAt)}</p></div></article>)}
        </div>
        {!loading && data.testimonials.length === 0 && <div className="mt-6 rounded-3xl border border-dashed border-white/10 p-10 text-center"><Sparkles className="mx-auto h-7 w-7 text-slate-600" /><p className="mt-3 text-sm text-slate-500">No approved testimonials in this view yet.</p></div>}
        {data.pagination.totalPages > 1 && <div className="mt-8 flex items-center justify-center gap-3"><button onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={page === 1 || loading} className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/10 px-3 text-xs font-bold text-slate-300 disabled:opacity-30"><ArrowLeft className="h-3.5 w-3.5" /> Previous</button><span className="text-xs text-slate-500">Page {data.pagination.page} of {data.pagination.totalPages}</span><button onClick={() => setPage((value) => Math.min(data.pagination.totalPages, value + 1))} disabled={page >= data.pagination.totalPages || loading} className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/10 px-3 text-xs font-bold text-slate-300 disabled:opacity-30">Next <ArrowRight className="h-3.5 w-3.5" /></button></div>}
      </section>
    </main>
  );
}
