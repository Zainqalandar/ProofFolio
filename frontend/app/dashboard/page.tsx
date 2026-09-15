"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  BriefcaseBusiness,
  Check,
  Copy,
  ExternalLink,
  MessageSquareQuote,
  Pencil,
  Plus,
  RefreshCw,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { getCurrentUser } from "@/utils/auth-api";
import {
  approveTestimonial,
  deleteCaseStudy,
  generateAiHighlight,
  getMyCaseStudies,
  getPendingTestimonials,
  rejectTestimonial,
} from "@/utils/prooffolio-api";
import { getApiErrorMessage } from "@/utils/api-error";
import { useNotification } from "@/context/notification-context";
import type { AuthUser, CaseStudy, Testimonial } from "@/types/api";

const projectTitle = (testimonial: Testimonial) =>
  typeof testimonial.caseStudy === "string" ? "Case study" : testimonial.caseStudy.title;

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));

export default function DashboardPage() {
  const { success, error, notify } = useNotification();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyAction, setBusyAction] = useState("");

  useEffect(() => {
    let cancelled = false;
    const loadDashboard = async () => {
      try {
        const [userResponse, caseStudyResponse, testimonialResponse] = await Promise.all([
          getCurrentUser(),
          getMyCaseStudies(),
          getPendingTestimonials(),
        ]);
        if (cancelled) return;
        setUser(userResponse.data.user);
        setCaseStudies(caseStudyResponse.data.caseStudies);
        setTestimonials(testimonialResponse.data.testimonials);
      } catch (requestError) {
        if (!cancelled) notify("error", getApiErrorMessage(requestError, "Your dashboard could not be loaded."));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void loadDashboard();
    return () => { cancelled = true; };
  }, [notify]);

  const shareLink = (token: string) => `${window.location.origin}/submit/${token}`;

  const handleCopy = async (caseStudy: CaseStudy) => {
    if (!caseStudy.shareToken) return;
    await navigator.clipboard.writeText(shareLink(caseStudy.shareToken));
    success("Client testimonial link copied.");
  };

  const handleDelete = async (caseStudy: CaseStudy) => {
    if (!window.confirm(`Delete “${caseStudy.title}” and its testimonials?`)) return;
    try {
      setBusyAction(`delete-${caseStudy._id}`);
      await deleteCaseStudy(caseStudy._id);
      setCaseStudies((items) => items.filter((item) => item._id !== caseStudy._id));
      setTestimonials((items) => items.filter((item) =>
        typeof item.caseStudy === "string" ? item.caseStudy !== caseStudy._id : item.caseStudy._id !== caseStudy._id,
      ));
      success("Case study deleted.");
    } catch (requestError) {
      error(getApiErrorMessage(requestError, "The case study could not be deleted."));
    } finally {
      setBusyAction("");
    }
  };

  const handleReview = async (testimonial: Testimonial, action: "approve" | "reject") => {
    try {
      setBusyAction(`${action}-${testimonial._id}`);
      if (action === "approve") await approveTestimonial(testimonial._id);
      else await rejectTestimonial(testimonial._id);
      setTestimonials((items) => items.filter((item) => item._id !== testimonial._id));
      success(action === "approve" ? "Testimonial is now live." : "Testimonial rejected.");
    } catch (requestError) {
      error(getApiErrorMessage(requestError, `The testimonial could not be ${action}d.`));
    } finally {
      setBusyAction("");
    }
  };

  const handleHighlight = async (testimonial: Testimonial) => {
    try {
      setBusyAction(`ai-${testimonial._id}`);
      const response = await generateAiHighlight(testimonial._id);
      setTestimonials((items) => items.map((item) =>
        item._id === testimonial._id ? response.data.testimonial : item,
      ));
      success("AI highlight generated.");
    } catch (requestError) {
      error(getApiErrorMessage(requestError, "The highlight could not be generated."));
    } finally {
      setBusyAction("");
    }
  };

  if (loading) {
    return <main className="flex flex-1 items-center justify-center bg-[#0a0d18] px-5 py-20"><RefreshCw className="h-7 w-7 animate-spin text-lime-300" /><span className="ml-3 text-sm text-slate-400">Loading your proof space…</span></main>;
  }

  return (
    <main className="flex-1 bg-[#0a0d18] px-5 py-10 sm:px-8 sm:py-14">
      <section className="mx-auto w-full max-w-6xl">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.18em] text-lime-300">Your workspace</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-.06em] text-white sm:text-5xl">Welcome back, {user?.name || user?.username || "creator"}.</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400">Build case studies, share client links, and curate every word before it reaches your profile.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {user && <Link href={`/profile/${user.profileSlug}`} className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/12 px-4 text-sm font-semibold text-slate-200 transition hover:border-white/30 hover:bg-white/5">View profile <ExternalLink className="h-4 w-4" /></Link>}
            <Link href="/case-studies/new" className="inline-flex h-11 items-center gap-2 rounded-xl bg-lime-300 px-4 text-sm font-bold text-[#101424] transition hover:bg-lime-200"><Plus className="h-4 w-4" /> New case study</Link>
          </div>
        </div>

        <div className="mt-9 grid gap-3 sm:grid-cols-3">
          <Stat icon={BriefcaseBusiness} label="Case studies" value={caseStudies.length} tone="lime" />
          <Stat icon={MessageSquareQuote} label="Awaiting review" value={testimonials.length} tone="pink" />
          <Stat icon={Sparkles} label="Profile address" value={user ? `/${user.profileSlug}` : "—"} tone="blue" />
        </div>

        <div className="mt-12 flex items-end justify-between gap-4">
          <div><p className="text-xs font-bold uppercase tracking-[.18em] text-fuchsia-300">Your work</p><h2 className="mt-2 text-2xl font-semibold tracking-[-.045em] text-white">Case studies</h2></div>
          <span className="text-sm text-slate-500">{caseStudies.length} total</span>
        </div>

        {caseStudies.length === 0 ? (
          <EmptyState icon={BriefcaseBusiness} title="Your first proof starts here." copy="Add a completed project and we’ll create its secure client-feedback link." href="/case-studies/new" action="Create case study" />
        ) : (
          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            {caseStudies.map((caseStudy) => (
              <article key={caseStudy._id} className="overflow-hidden rounded-3xl border border-white/8 bg-[#111728]">
                {caseStudy.screenshots[0] ? (
                  // Cloudinary hosts user-uploaded images, so the native element avoids coupling the UI to one account hostname.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={caseStudy.screenshots[0]} alt={`${caseStudy.title} screenshot`} className="h-52 w-full bg-[#0b1020] object-cover" />
                ) : <div className="grid h-40 place-items-center bg-[#0b1020]"><BriefcaseBusiness className="h-8 w-8 text-slate-700" /></div>}
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div><h3 className="text-xl font-semibold tracking-[-.035em] text-white">{caseStudy.title}</h3><p className="mt-1 text-xs text-slate-500">Created {formatDate(caseStudy.createdAt)}</p></div>
                    <div className="flex gap-1">
                      <Link href={`/case-studies/${caseStudy._id}/edit`} aria-label={`Edit ${caseStudy.title}`} className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white"><Pencil className="h-4 w-4" /></Link>
                      <button onClick={() => void handleDelete(caseStudy)} disabled={busyAction === `delete-${caseStudy._id}`} aria-label={`Delete ${caseStudy.title}`} className="rounded-lg p-2 text-slate-400 hover:bg-rose-400/10 hover:text-rose-300 disabled:opacity-50"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>
                  <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-400">{caseStudy.description}</p>
                  {caseStudy.shareToken && <div className="mt-5 flex gap-2"><button onClick={() => void handleCopy(caseStudy)} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-lime-300 px-3 py-3 text-sm font-bold text-[#101424] hover:bg-lime-200"><Copy className="h-4 w-4" /> Copy client link</button><Link href={`/submit/${caseStudy.shareToken}`} target="_blank" aria-label="Open client submission page" className="grid w-11 place-items-center rounded-xl border border-white/12 text-slate-300 hover:bg-white/5"><ExternalLink className="h-4 w-4" /></Link></div>}
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="mt-14 flex items-end justify-between gap-4">
          <div><p className="text-xs font-bold uppercase tracking-[.18em] text-lime-300">Moderation</p><h2 className="mt-2 text-2xl font-semibold tracking-[-.045em] text-white">Pending testimonials</h2></div>
          <span className="rounded-full bg-amber-300/10 px-3 py-1.5 text-xs font-bold text-amber-200">{testimonials.length} pending</span>
        </div>

        {testimonials.length === 0 ? (
          <div className="mt-5 rounded-3xl border border-dashed border-white/10 bg-white/[.02] p-10 text-center"><Check className="mx-auto h-7 w-7 text-lime-300" /><h3 className="mt-4 font-semibold text-white">You’re all caught up.</h3><p className="mt-2 text-sm text-slate-500">New client feedback will appear here for review.</p></div>
        ) : (
          <div className="mt-5 space-y-4">
            {testimonials.map((testimonial) => (
              <article key={testimonial._id} className="rounded-3xl border border-white/8 bg-[#111728] p-6 sm:p-7">
                <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
                  <div className="max-w-3xl">
                    <div className="flex flex-wrap items-center gap-2 text-xs"><span className="rounded-full bg-fuchsia-300/10 px-2.5 py-1 font-bold text-fuchsia-200">{projectTitle(testimonial)}</span><span className="text-slate-500">{formatDate(testimonial.submittedAt)}</span></div>
                    {testimonial.aiHighlight && <p className="mt-5 text-lg font-semibold text-lime-200">“{testimonial.aiHighlight}”</p>}
                    <p className="mt-4 text-base leading-7 text-slate-200">“{testimonial.message}”</p>
                    <p className="mt-4 text-sm font-semibold text-white">{testimonial.clientName}{testimonial.clientCompany ? <span className="font-normal text-slate-500"> · {testimonial.clientCompany}</span> : null}</p>
                    {testimonial.clientEmail && <p className="mt-1 text-xs text-slate-500">{testimonial.clientEmail}</p>}
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    <button onClick={() => void handleHighlight(testimonial)} disabled={Boolean(busyAction)} className="inline-flex h-10 items-center gap-2 rounded-xl border border-fuchsia-300/20 px-3.5 text-xs font-bold text-fuchsia-200 hover:bg-fuchsia-300/10 disabled:opacity-40"><Sparkles className={`h-3.5 w-3.5 ${busyAction === `ai-${testimonial._id}` ? "animate-spin" : ""}`} /> {testimonial.aiHighlight ? "Regenerate" : "AI highlight"}</button>
                    <button onClick={() => void handleReview(testimonial, "reject")} disabled={Boolean(busyAction)} className="inline-flex h-10 items-center gap-2 rounded-xl border border-rose-300/20 px-3.5 text-xs font-bold text-rose-200 hover:bg-rose-300/10 disabled:opacity-40"><X className="h-3.5 w-3.5" /> Reject</button>
                    <button onClick={() => void handleReview(testimonial, "approve")} disabled={Boolean(busyAction)} className="inline-flex h-10 items-center gap-2 rounded-xl bg-lime-300 px-3.5 text-xs font-bold text-[#101424] hover:bg-lime-200 disabled:opacity-40"><Check className="h-3.5 w-3.5" /> Approve</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function Stat({ icon: Icon, label, value, tone }: { icon: typeof Sparkles; label: string; value: string | number; tone: "lime" | "pink" | "blue" }) {
  const colors = { lime: "bg-lime-300/10 text-lime-300", pink: "bg-fuchsia-300/10 text-fuchsia-300", blue: "bg-sky-300/10 text-sky-300" };
  return <div className="rounded-2xl border border-white/8 bg-[#111728] p-5"><span className={`grid h-9 w-9 place-items-center rounded-xl ${colors[tone]}`}><Icon className="h-4 w-4" /></span><p className="mt-6 text-2xl font-semibold tracking-[-.04em] text-white">{value}</p><p className="mt-1 text-xs text-slate-500">{label}</p></div>;
}

function EmptyState({ icon: Icon, title, copy, href, action }: { icon: typeof Sparkles; title: string; copy: string; href: string; action: string }) {
  return <div className="mt-5 rounded-3xl border border-dashed border-white/10 bg-white/[.02] p-10 text-center"><Icon className="mx-auto h-8 w-8 text-lime-300" /><h3 className="mt-4 text-lg font-semibold text-white">{title}</h3><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">{copy}</p><Link href={href} className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-lime-300 hover:text-lime-200">{action} <ArrowRight className="h-4 w-4" /></Link></div>;
}
