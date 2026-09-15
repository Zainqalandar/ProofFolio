"use client";

import Link from "next/link";
import { FormEvent, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Eye, EyeOff, LoaderCircle, LockKeyhole, Mail, Quote } from "lucide-react";
import { login } from "@/utils/auth-api";
import { getApiErrorMessage } from "@/utils/api-error";
import { setAuthToken } from "@/utils/auth";
import { useNotification } from "@/context/notification-context";

export default function SignInPage() {
  return <Suspense fallback={<main className="grid flex-1 place-items-center bg-[#0a0d18]"><LoaderCircle className="h-7 w-7 animate-spin text-lime-300" /></main>}><SignInForm /></Suspense>;
}

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { success, error } = useNotification();
  const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false); const [showPassword, setShowPassword] = useState(false); const [loading, setLoading] = useState(false);
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim() || !password) return error("Enter your email and password to continue.");
    try { setLoading(true); const response = await login({ email: email.trim(), password }); setAuthToken(response.data.token, remember); success("Welcome back — your proof space is ready."); router.push(searchParams.get("from") || "/dashboard"); }
    catch (err) { error(getApiErrorMessage(err, "We could not sign you in.")); } finally { setLoading(false); }
  };
  return <main className="flex flex-1 bg-[#0a0d18] px-5 py-10 sm:px-8 lg:items-center lg:py-14"><section className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/10 bg-[#111728] shadow-2xl shadow-black/40 lg:grid-cols-[.9fr_1.1fr]"><aside className="relative hidden overflow-hidden bg-[#cfff55] p-10 text-[#101424] lg:flex lg:flex-col lg:justify-between"><div className="absolute inset-0 opacity-30 [background-image:radial-gradient(#111827_1px,transparent_1px)] [background-size:15px_15px]" /><div className="relative"><p className="text-xs font-bold uppercase tracking-[.18em]">Your proof vault</p><h1 className="mt-5 max-w-sm text-5xl font-semibold leading-[.94] tracking-[-.07em]">Good work has a memory.</h1></div><div className="relative rounded-2xl border border-[#101424]/15 bg-[#e1ff94]/70 p-5"><Quote className="h-7 w-7" fill="currentColor" /><p className="mt-4 text-lg font-medium leading-7">“A thoughtful system that made our progress visible.”</p><p className="mt-5 text-sm opacity-70">— Project client, verified</p></div></aside><div className="p-7 sm:p-10 lg:p-14"><div className="mx-auto max-w-md"><p className="text-xs font-bold uppercase tracking-[.18em] text-lime-300">Welcome back</p><h2 className="mt-3 text-3xl font-semibold tracking-[-.055em] text-white">Continue building trust.</h2><p className="mt-2 text-sm leading-6 text-slate-400">Sign in to manage your case studies and client feedback.</p><form className="mt-8 space-y-4" onSubmit={handleSubmit} noValidate><label className="block text-sm font-semibold text-slate-200">Email address<div className="relative mt-2"><Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" /><input value={email} onChange={(event) => setEmail(event.target.value)} type="email" autoComplete="email" placeholder="you@studio.com" className="h-12 w-full rounded-xl border border-white/10 bg-[#0b1020] pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-lime-300/60 focus:ring-4 focus:ring-lime-300/10" /></div></label><label className="block text-sm font-semibold text-slate-200">Password<div className="relative mt-2"><LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" /><input value={password} onChange={(event) => setPassword(event.target.value)} type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="Your password" className="h-12 w-full rounded-xl border border-white/10 bg-[#0b1020] pl-11 pr-12 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-lime-300/60 focus:ring-4 focus:ring-lime-300/10" /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-500 hover:text-white" aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></label><label className="flex items-center gap-2 pt-1 text-sm text-slate-400"><input checked={remember} onChange={(event) => setRemember(event.target.checked)} type="checkbox" className="h-4 w-4 rounded border-white/20 accent-lime-300" /> Keep me signed in</label><button disabled={loading} className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-lime-300 text-sm font-bold text-[#101424] transition hover:bg-lime-200 disabled:cursor-not-allowed disabled:opacity-60">{loading ? "Signing in…" : <>Enter ProofFolio <ArrowRight className="h-4 w-4" /></>}</button></form><p className="mt-7 text-center text-sm text-slate-400">New here? <Link href="/signup" className="font-bold text-lime-300 hover:text-lime-200">Create your proof space</Link></p></div></div></section></main>;
}
