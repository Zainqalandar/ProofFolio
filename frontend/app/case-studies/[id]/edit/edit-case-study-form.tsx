"use client";

import Link from "next/link";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ImagePlus, LoaderCircle, Save, X } from "lucide-react";
import { getMyCaseStudies, updateCaseStudy } from "@/utils/prooffolio-api";
import { getApiErrorMessage } from "@/utils/api-error";
import { useNotification } from "@/context/notification-context";
import type { CaseStudy } from "@/types/api";

const MAX_FILES = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export default function EditCaseStudyForm({ caseStudyId }: { caseStudyId: string }) {
  const router = useRouter();
  const { success, error, notify } = useNotification();
  const [caseStudy, setCaseStudy] = useState<CaseStudy | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await getMyCaseStudies();
        const found = response.data.caseStudies.find((item) => item._id === caseStudyId);
        if (!found) {
          notify("error", "Case study not found.");
          router.replace("/dashboard");
          return;
        }
        setCaseStudy(found);
        setTitle(found.title);
        setDescription(found.description);
      } catch (requestError) {
        notify("error", getApiErrorMessage(requestError, "The case study could not be loaded."));
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [caseStudyId, notify, router]);

  const handleImages = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files ?? []);
    const valid = selected.filter((file) => file.type.startsWith("image/") && file.size <= MAX_FILE_SIZE).slice(0, MAX_FILES);
    if (valid.length !== selected.length) error("Choose up to 5 images smaller than 5 MB each.");
    previews.forEach((url) => URL.revokeObjectURL(url));
    setImages(valid);
    setPreviews(valid.map((file) => URL.createObjectURL(file)));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title.trim() || !description.trim()) {
      error("Title and project story are required.");
      return;
    }
    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("description", description.trim());
    images.forEach((image) => formData.append("screenshots", image));
    try {
      setSaving(true);
      await updateCaseStudy(caseStudyId, formData);
      success("Case study updated.");
      router.push("/dashboard");
    } catch (requestError) {
      error(getApiErrorMessage(requestError, "The case study could not be updated."));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <main className="grid flex-1 place-items-center bg-[#0a0d18]"><LoaderCircle className="h-7 w-7 animate-spin text-lime-300" /></main>;
  if (!caseStudy) return null;

  return (
    <main className="flex-1 bg-[#0a0d18] px-5 py-12 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white"><ArrowLeft className="h-4 w-4" /> Back to dashboard</Link>
        <p className="mt-8 text-xs font-bold uppercase tracking-[.18em] text-fuchsia-300">Edit proof</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-.06em] text-white">Polish the project story.</h1>
        <form onSubmit={handleSubmit} className="mt-9 space-y-6 rounded-3xl border border-white/8 bg-[#111728] p-6 sm:p-8">
          <label className="block text-sm font-semibold text-slate-200"><span className="mb-2 block">Project title</span><input value={title} onChange={(event) => setTitle(event.target.value)} className="h-12 w-full rounded-xl border border-white/10 bg-[#0b1020] px-4 font-normal text-white outline-none focus:border-lime-300/60 focus:ring-4 focus:ring-lime-300/10" /></label>
          <label className="block text-sm font-semibold text-slate-200"><span className="mb-2 block">Project story</span><textarea value={description} onChange={(event) => setDescription(event.target.value)} className="min-h-44 w-full rounded-xl border border-white/10 bg-[#0b1020] px-4 py-3 font-normal leading-6 text-white outline-none focus:border-lime-300/60 focus:ring-4 focus:ring-lime-300/10" /></label>
          <div>
            <p className="text-sm font-semibold text-slate-200">Screenshots</p>
            {previews.length === 0 && <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">{caseStudy.screenshots.map((screenshot, index) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={screenshot} src={screenshot} alt={`Current screenshot ${index + 1}`} className="h-28 w-full rounded-xl border border-white/10 object-cover" />
            ))}</div>}
            {previews.length > 0 && <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">{previews.map((preview, index) => <div key={preview} className="group relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt={`New screenshot ${index + 1}`} className="h-28 w-full rounded-xl border border-lime-300/30 object-cover" />
              <button type="button" onClick={() => { URL.revokeObjectURL(preview); setImages((items) => items.filter((_, itemIndex) => itemIndex !== index)); setPreviews((items) => items.filter((_, itemIndex) => itemIndex !== index)); }} aria-label={`Remove new screenshot ${index + 1}`} className="absolute right-2 top-2 rounded-lg bg-[#0a0d18]/80 p-1.5 opacity-0 group-hover:opacity-100"><X className="h-4 w-4" /></button>
            </div>)}</div>}
            <label className="mt-4 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 px-4 py-4 text-sm font-semibold text-slate-300 hover:border-lime-300/40 hover:text-white"><ImagePlus className="h-4 w-4 text-lime-300" /> {previews.length ? "Choose different images" : "Replace screenshots"}<input type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={handleImages} className="sr-only" /></label>
            <p className="mt-2 text-xs text-slate-500">Selecting new images replaces the existing screenshot set.</p>
          </div>
          <button disabled={saving} className="inline-flex h-12 items-center gap-2 rounded-xl bg-lime-300 px-5 text-sm font-bold text-[#101424] hover:bg-lime-200 disabled:opacity-50"><Save className="h-4 w-4" /> {saving ? "Saving…" : "Save changes"}</button>
        </form>
      </div>
    </main>
  );
}
