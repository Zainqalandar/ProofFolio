'use client';

import { ChangeEvent, FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ImagePlus, X } from 'lucide-react';
import { createCaseStudy } from '@/utils/prooffolio-api';
import { getApiErrorMessage } from '@/utils/api-error';
import { useNotification } from '@/context/notification-context';

const MAX_FILES = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export default function NewCaseStudyPage() {
  const router = useRouter();
  const { success, error: notifyError } = useNotification();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImagesChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedImages = Array.from(event.target.files || []);
    const validImages = selectedImages.filter(
      (image) => image.type.startsWith('image/') && image.size <= MAX_FILE_SIZE,
    );

    if (selectedImages.length !== validImages.length || selectedImages.length > MAX_FILES) {
      notifyError('Choose up to 5 PNG, JPG, or WEBP images smaller than 5 MB each.');
    }

    const nextImages = validImages.slice(0, MAX_FILES);
    previews.forEach((url) => URL.revokeObjectURL(url));
    setImages(nextImages);
    setPreviews(nextImages.map((image) => URL.createObjectURL(image)));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title.trim() || !description.trim() || images.length === 0) {
      notifyError('Add a title, project story, and at least one screenshot.');
      return;
    }

    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('description', description.trim());

    // Is field ka naam backend ke upload.array('screenshots', 5) se same hai.
    images.forEach((image) => formData.append('screenshots', image));

    try {
      setIsSubmitting(true);

      await createCaseStudy(formData);
      success('Your case study is live and ready for a client link.');
      router.push('/dashboard');
    } catch (error) {
      notifyError(getApiErrorMessage(error, 'Your case study could not be created.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex-1 bg-[#0a0d18] px-5 py-12 sm:px-8">
      <div className="mx-auto w-full max-w-3xl">
      <Link href="/dashboard" className="mb-7 inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white"><ArrowLeft className="h-4 w-4" /> Back to dashboard</Link>
      <p className="text-xs font-bold uppercase tracking-[.18em] text-lime-300">New proof</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-[-.06em] text-white">Tell the story behind<br />a great result.</h1>
      <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400">Give your client enough context to leave feedback that feels specific and meaningful.</p>

      <form onSubmit={handleSubmit} className="mt-9 space-y-6 rounded-3xl border border-white/8 bg-[#111728] p-6 sm:p-8">
        <label className="block text-sm font-semibold text-slate-200">
          <span className="mb-2 block">Project title</span>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="h-12 w-full rounded-xl border border-white/10 bg-[#0b1020] px-4 text-sm font-normal text-white outline-none placeholder:text-slate-600 focus:border-lime-300/60 focus:ring-4 focus:ring-lime-300/10"
            placeholder="A calmer way to manage money"
          />
        </label>

        <label className="block text-sm font-semibold text-slate-200">
          <span className="mb-2 block">Project story</span>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="min-h-40 w-full rounded-xl border border-white/10 bg-[#0b1020] px-4 py-3 text-sm font-normal text-white outline-none placeholder:text-slate-600 focus:border-lime-300/60 focus:ring-4 focus:ring-lime-300/10"
            placeholder="What did you make, what challenge did it solve, and what changed?"
          />
        </label>

        <label className="block text-sm font-semibold text-slate-200">
          <span className="mb-2 block">Screenshots</span>
          <span className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/[.02] px-5 py-8 text-center transition hover:border-lime-300/40 hover:bg-lime-300/[.03]">
          <ImagePlus className="h-6 w-6 text-lime-300" />
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={handleImagesChange}
            className="sr-only"
          />
          <span className="mt-3 text-sm font-medium text-slate-200">Select up to {MAX_FILES} images</span>
          <span className="mt-1 text-xs font-normal text-slate-500">PNG, JPG, or WEBP · 5 MB each</span></span>
        </label>

        {previews.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {previews.map((preview, index) => (
              <div key={preview} className="group relative">
                {/* Preview URLs are browser blobs and should not pass through Next Image optimization. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview} alt={`Screenshot ${index + 1}`} className="h-32 w-full rounded-xl border border-white/10 object-cover" />
                <button type="button" aria-label={`Remove screenshot ${index + 1}`} onClick={() => { URL.revokeObjectURL(preview); setImages((items) => items.filter((_, itemIndex) => itemIndex !== index)); setPreviews((items) => items.filter((_, itemIndex) => itemIndex !== index)); }} className="absolute right-2 top-2 rounded-lg bg-[#0a0d18]/80 p-1.5 text-white opacity-0 transition group-hover:opacity-100"><X className="h-4 w-4" /></button>
              </div>
            ))}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="h-12 rounded-xl bg-lime-300 px-5 text-sm font-bold text-[#101424] transition hover:bg-lime-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? 'Creating your proof…' : 'Create case study'}
        </button>
      </form>
      </div>
    </main>
  );
}
