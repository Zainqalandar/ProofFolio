"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { ArrowRight, BadgeCheck, Building2, CheckCircle2, LoaderCircle, Mail, MessageSquareQuote, UserRound } from "lucide-react";
import { getPublicCaseStudy, submitPublicTestimonial } from "@/utils/prooffolio-api";
import { getApiErrorMessage } from "@/utils/api-error";
import type { CaseStudy } from "@/types/api";

export default function TestimonialSubmissionForm({ token }: { token: string }) {
  const [caseStudy, setCaseStudy] = useState<Pick<CaseStudy, "_id" | "title" | "description"> | null>(null);
  const [loadError, setLoadError] = useState("");
  const [formError, setFormError] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientCompany, setClientCompany] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await getPublicCaseStudy(token);
        setCaseStudy(response.data.caseStudy);
      } catch (requestError) {
        setLoadError(getApiErrorMessage(requestError, "This testimonial link is unavailable."));
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [token]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");
    if (!clientName.trim() || !message.trim()) {
      setFormError("Your name and feedback are required.");
      return;
    }
    try {
      setSubmitting(true);
      await submitPublicTestimonial(token, {
        clientName: clientName.trim(),
        ...(clientEmail.trim() ? { clientEmail: clientEmail.trim() } : {}),
        ...(clientCompany.trim() ? { clientCompany: clientCompany.trim() } : {}),
        message: message.trim(),
      });
      setSubmitted(true);
    } catch (requestError) {
      setFormError(getApiErrorMessage(requestError, "Your testimonial could not be submitted."));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <main className="grid flex-1 place-items-center bg-[#0a0d18]"><LoaderCircle className="h-7 w-7 animate-spin text-lime-300" /></main>;

  if (loadError || !caseStudy) return <main className="grid flex-1 place-items-center bg-[#0a0d18] px-5"><div className="max-w-md text-center"><MessageSquareQuote className="mx-auto h-9 w-9 text-rose-300" /><h1 className="mt-5 text-3xl font-semibold tracking-[-.05em] text-white">Link not found</h1><p className="mt-3 text-sm leading-6 text-slate-400">{loadError || "This client link is no longer available."}</p><Link href="/" className="mt-6 inline-flex text-sm font-bold text-lime-300">Visit ProofFolio</Link></div></main>;

  if (submitted) return <main className="grid flex-1 place-items-center bg-[#0a0d18] px-5 py-16"><div className="max-w-lg rounded-3xl border border-lime-300/20 bg-[#111728] p-9 text-center shadow-2xl shadow-black/30 sm:p-12"><span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-lime-300/10"><CheckCircle2 className="h-8 w-8 text-lime-300" /></span><p className="mt-7 text-xs font-bold uppercase tracking-[.18em] text-lime-300">Feedback received</p><h1 className="mt-3 text-3xl font-semibold tracking-[-.05em] text-white">Thank you, {clientName.trim()}.</h1><p className="mt-4 text-sm leading-6 text-slate-400">Your testimonial was sent for review. It will appear on the freelancer’s public profile after approval.</p><Link href="/" className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-lime-300">Discover ProofFolio <ArrowRight className="h-4 w-4" /></Link></div></main>;

  const fieldClass = "h-12 w-full rounded-xl border border-white/10 bg-[#0b1020] pl-11 pr-4 text-sm font-normal text-white outline-none placeholder:text-slate-600 focus:border-lime-300/60 focus:ring-4 focus:ring-lime-300/10";
  return (
    <main className="flex-1 bg-[#0a0d18] px-5 py-10 sm:px-8 sm:py-14">
      <section className="mx-auto grid max-w-5xl overflow-hidden rounded-[2rem] border border-white/10 bg-[#111728] shadow-2xl shadow-black/40 lg:grid-cols-[.82fr_1.18fr]">
        <aside className="relative overflow-hidden bg-gradient-to-br from-[#352865] via-[#203d59] to-[#17604e] p-8 sm:p-10">
          <div className="absolute -right-16 -top-14 h-48 w-48 rounded-full bg-fuchsia-300/20 blur-3xl" />
          <div className="relative"><div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.18em] text-lime-200"><BadgeCheck className="h-4 w-4" /> Verified client link</div><h1 className="mt-8 text-4xl font-semibold leading-[1.02] tracking-[-.06em] text-white">{caseStudy.title}</h1><p className="mt-5 text-sm leading-7 text-white/65">{caseStudy.description}</p></div>
          <div className="relative mt-16 border-t border-white/15 pt-6"><MessageSquareQuote className="h-6 w-6 text-fuchsia-200" /><p className="mt-3 text-sm leading-6 text-white/70">Your honest words help turn completed work into credible proof.</p></div>
        </aside>
        <div className="p-7 sm:p-10 lg:p-12">
          <p className="text-xs font-bold uppercase tracking-[.18em] text-fuchsia-300">Share your experience</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-.055em] text-white">What was it like working together?</h2>
          <p className="mt-3 text-sm leading-6 text-slate-400">No account needed. Your feedback remains private until the freelancer approves it.</p>
          <form onSubmit={handleSubmit} className="mt-8 space-y-4" noValidate>
            <label className="block text-sm font-semibold text-slate-200">Your name *<div className="relative mt-2"><UserRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" /><input value={clientName} onChange={(event) => setClientName(event.target.value)} className={fieldClass} placeholder="Nadia Rahman" autoComplete="name" /></div></label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-semibold text-slate-200">Email <span className="font-normal text-slate-500">(optional)</span><div className="relative mt-2"><Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" /><input value={clientEmail} onChange={(event) => setClientEmail(event.target.value)} type="email" className={fieldClass} placeholder="you@company.com" autoComplete="email" /></div></label>
              <label className="block text-sm font-semibold text-slate-200">Company <span className="font-normal text-slate-500">(optional)</span><div className="relative mt-2"><Building2 className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" /><input value={clientCompany} onChange={(event) => setClientCompany(event.target.value)} className={fieldClass} placeholder="Studio name" autoComplete="organization" /></div></label>
            </div>
            <label className="block text-sm font-semibold text-slate-200">Your testimonial *<textarea value={message} onChange={(event) => setMessage(event.target.value)} className="mt-2 min-h-40 w-full rounded-xl border border-white/10 bg-[#0b1020] px-4 py-3 text-sm font-normal leading-6 text-white outline-none placeholder:text-slate-600 focus:border-lime-300/60 focus:ring-4 focus:ring-lime-300/10" placeholder="What stood out? What changed because of the work?" maxLength={5000} /><span className="mt-1.5 block text-right text-xs font-normal text-slate-600">{message.length}/5000</span></label>
            {formError && <p role="alert" className="rounded-xl border border-rose-300/20 bg-rose-300/8 px-4 py-3 text-sm text-rose-200">{formError}</p>}
            <button disabled={submitting} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-lime-300 text-sm font-bold text-[#101424] hover:bg-lime-200 disabled:opacity-50">{submitting ? "Sending your feedback…" : <>Submit testimonial <ArrowRight className="h-4 w-4" /></>}</button>
          </form>
        </div>
      </section>
    </main>
  );
}
