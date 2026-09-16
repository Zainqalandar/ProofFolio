"use client";

import Link from "next/link";
import { type ChangeEvent, type FormEvent, useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, BadgeCheck, BriefcaseBusiness, CalendarDays, LoaderCircle, MessageSquareQuote, Pencil, Sparkles, X } from "lucide-react";
import { getCurrentUser } from "@/utils/auth-api";
import { hasAuthToken, notifyProfileChange } from "@/utils/auth";
import { getPublicProfile, updateProfilePicture, updatePublicProfile } from "@/utils/prooffolio-api";
import { getApiErrorMessage } from "@/utils/api-error";
import { useNotification } from "@/context/notification-context";
import type { AuthUser, PublicProfileResponse, Testimonial } from "@/types/api";

const MAX_PROFILE_PICTURE_SIZE = 5 * 1024 * 1024;

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
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [isProfileEditorOpen, setIsProfileEditorOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const { success, error } = useNotification();

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
        console.log("Public profile data:", response.data);
        setData(response.data);
      } catch (requestError) {
        setLoadError(getApiErrorMessage(requestError, "This profile could not be loaded."));
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [page, selectedCaseStudy, slug, sort]);

  useEffect(() => {
    if (!hasAuthToken()) return;

    let cancelled = false;
    void getCurrentUser()
      .then((response) => {
        if (!cancelled) setCurrentUser(response.data.user);
      })
      .catch(() => {
        if (!cancelled) setCurrentUser(null);
      });

    return () => { cancelled = true; };
  }, [slug]);

  const handleProfilePictureChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      error("Please choose an image file.");
      return;
    }
    if (file.size > MAX_PROFILE_PICTURE_SIZE) {
      error("Profile pictures must be 5 MB or smaller.");
      return;
    }

    try {
      setUploadingPicture(true);
      const response = await updateProfilePicture(file);
      setCurrentUser(response.data.user);
      setData((previous) => previous ? {
        ...previous,
        profile: { ...previous.profile, profilePicture: response.data.user.profilePicture },
      } : previous);
      notifyProfileChange();
      success("Profile picture updated.");
    } catch (requestError) {
      error(getApiErrorMessage(requestError, "The profile picture could not be updated."));
    } finally {
      setUploadingPicture(false);
    }
  };

  const openProfileEditor = () => {
    if (!data) return;
    setEditName(data.profile.name);
    setEditBio(data.profile.bio);
    setIsProfileEditorOpen(true);
  };

  const handleProfileUpdate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (editName.trim().length < 3) {
      error("Name must be at least 3 characters.");
      return;
    }

    try {
      setIsSavingProfile(true);
      const response = await updatePublicProfile(slug, { name: editName.trim(), bio: editBio.trim() });
      setData((previous) => previous ? {
        ...previous,
        profile: { ...previous.profile, ...response.data.profile },
      } : previous);
      notifyProfileChange();
      setIsProfileEditorOpen(false);
      success("Profile updated.");
    } catch (requestError) {
      error(getApiErrorMessage(requestError, "The profile could not be updated."));
    } finally {
      setIsSavingProfile(false);
    }
  };

  if (loading && !data) return <main className="grid flex-1 place-items-center bg-[#0a0d18]"><LoaderCircle className="h-7 w-7 animate-spin text-lime-300" /></main>;
  if (loadError && !data) return <main className="grid flex-1 place-items-center bg-[#0a0d18] px-5"><div className="max-w-md text-center"><MessageSquareQuote className="mx-auto h-9 w-9 text-rose-300" /><h1 className="mt-5 text-3xl font-semibold tracking-[-.05em] text-white">Profile unavailable</h1><p className="mt-3 text-sm leading-6 text-slate-400">{loadError}</p><Link href="/" className="mt-6 inline-flex font-bold text-lime-300">Back to ProofFolio</Link></div></main>;
  if (!data) return null;

  const canEditProfile = currentUser?.profileSlug === data.profile.profileSlug;

  return (
    <main className="flex-1 bg-[#0a0d18]">
      <section className="relative overflow-hidden border-b border-white/8 px-5 py-16 sm:px-8 sm:py-20">
        <div className="grid-glow absolute inset-0 opacity-40 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
        <div className="absolute left-1/2 top-0 h-72 w-[650px] -translate-x-1/2 rounded-full bg-lime-300/8 blur-[110px]" />
        <div className="relative mx-auto max-w-6xl">
          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
            <div className="max-w-3xl">
              <div className="flex items-center gap-3">
                <div className="group relative h-14 w-14 shrink-0">
                  <div className="h-14 w-14 overflow-hidden rounded-2xl bg-fuchsia-300/15 text-xl font-bold text-fuchsia-200">
                    {data.profile.profilePicture ? (
                      // Cloudinary hosts user-uploaded images, so the native element avoids coupling the UI to one account hostname.
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={data.profile.profilePicture} alt={`${data.profile.name} profile`} className="h-full w-full object-cover" />
                    ) : <span className="grid h-full w-full place-items-center">{data.profile.name.charAt(0).toUpperCase()}</span>}
                  </div>
                  {canEditProfile && <label htmlFor="profile-picture-upload" title="Update profile picture" className={`absolute inset-0 grid place-items-center rounded-2xl bg-[#101424]/75 text-white transition ${uploadingPicture ? "cursor-wait opacity-100" : "cursor-pointer opacity-0 group-hover:opacity-100 group-focus-within:opacity-100"}`}>
                    {uploadingPicture ? <LoaderCircle className="h-5 w-5 animate-spin" /> : <Pencil className="h-5 w-5" />}
                    <input id="profile-picture-upload" type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={handleProfilePictureChange} disabled={uploadingPicture} />
                  </label>}
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-lime-300/20 bg-lime-300/8 px-3 py-1.5 text-xs font-bold text-lime-200"><BadgeCheck className="h-3.5 w-3.5" /> ProofFolio profile</span>
                {canEditProfile && <button type="button" onClick={openProfileEditor} aria-label="Edit profile" title="Edit profile" className="grid h-8 w-8 place-items-center rounded-xl border border-white/10 text-slate-400 transition hover:border-lime-300/40 hover:bg-lime-300/10 hover:text-lime-200"><Pencil className="h-3.5 w-3.5" /></button>}
              </div>
              <h1 className="mt-7 text-5xl font-semibold tracking-[-.065em] text-white sm:text-7xl">{data.profile.name}</h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-400">{data.profile.bio || "Independent professional sharing real work and verified client experiences."}</p>
            </div>
            <div className="flex gap-7 rounded-2xl border border-white/8 bg-[#111728]/80 px-6 py-5 backdrop-blur"><div><p className="text-2xl font-semibold text-white">{data.caseStudies.length}</p><p className="mt-1 text-xs text-slate-500">Case studies</p></div><div className="w-px bg-white/8" /><div><p className="text-2xl font-semibold text-white">{data.pagination.total}</p><p className="mt-1 text-xs text-slate-500">Testimonials</p></div></div>
          </div>
        </div>
      </section>

      {isProfileEditorOpen && <div className="fixed inset-0 z-[60] grid place-items-center bg-[#050711]/75 px-5 py-8 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="edit-profile-title">
        <form onSubmit={handleProfileUpdate} className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#111728] p-6 shadow-2xl shadow-black/50 sm:p-7">
          <div className="flex items-start justify-between gap-5"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-lime-300">Your public profile</p><h2 id="edit-profile-title" className="mt-2 text-2xl font-semibold tracking-[-.05em] text-white">Edit profile</h2></div><button type="button" onClick={() => setIsProfileEditorOpen(false)} disabled={isSavingProfile} aria-label="Close profile editor" className="grid h-9 w-9 place-items-center rounded-xl text-slate-400 transition hover:bg-white/5 hover:text-white disabled:opacity-40"><X className="h-5 w-5" /></button></div>
          <label className="mt-7 block text-sm font-semibold text-slate-200"><span className="mb-2 block">Name</span><input value={editName} onChange={(event) => setEditName(event.target.value)} maxLength={80} required disabled={isSavingProfile} className="h-12 w-full rounded-xl border border-white/10 bg-[#0b1020] px-4 text-sm font-normal text-white outline-none placeholder:text-slate-600 focus:border-lime-300/60 focus:ring-4 focus:ring-lime-300/10 disabled:opacity-60" /></label>
          <label className="mt-5 block text-sm font-semibold text-slate-200"><span className="mb-2 flex items-center justify-between gap-3"><span>Bio</span><span className="text-xs font-normal text-slate-500">{editBio.length}/1000</span></span><textarea value={editBio} onChange={(event) => setEditBio(event.target.value)} maxLength={1000} rows={5} disabled={isSavingProfile} className="w-full resize-y rounded-xl border border-white/10 bg-[#0b1020] px-4 py-3 text-sm font-normal leading-6 text-white outline-none placeholder:text-slate-600 focus:border-lime-300/60 focus:ring-4 focus:ring-lime-300/10 disabled:opacity-60" placeholder="Tell visitors a little about your work." /></label>
          <div className="mt-7 flex justify-end gap-3"><button type="button" onClick={() => setIsProfileEditorOpen(false)} disabled={isSavingProfile} className="h-11 rounded-xl px-4 text-sm font-semibold text-slate-300 transition hover:bg-white/5 hover:text-white disabled:opacity-40">Cancel</button><button type="submit" disabled={isSavingProfile || editName.trim().length < 3} className="inline-flex h-11 items-center gap-2 rounded-xl bg-lime-300 px-4 text-sm font-bold text-[#101424] transition hover:bg-lime-200 disabled:cursor-not-allowed disabled:opacity-45">{isSavingProfile && <LoaderCircle className="h-4 w-4 animate-spin" />}{isSavingProfile ? "Saving…" : "Save changes"}</button></div>
        </form>
      </div>}

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
