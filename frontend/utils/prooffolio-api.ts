import api from "./axiosInstance";
import type { AuthUser, CaseStudy, PublicProfileResponse, PublicProfilesResponse, Testimonial } from "@/types/api";

export const getMyCaseStudies = () => api.get<{ caseStudies: CaseStudy[] }>("/case-studies/my");

export const createCaseStudy = (payload: FormData) =>
  api.post<{ caseStudy: CaseStudy }>("/case-studies", payload);

export const enhanceDescription = (description: string) =>
  api.post<{ message: string; data: { enhancedDescription: string } }>("/case-studies/enhance-description", { description });

export const updateCaseStudy = (id: string, payload: FormData) =>
  api.put<{ caseStudy: CaseStudy }>(`/case-studies/${id}`, payload);

export const deleteCaseStudy = (id: string) =>
  api.delete<{ message: string }>(`/case-studies/${id}`);

export const getPendingTestimonials = () =>
  api.get<{ testimonials: Testimonial[] }>("/testimonials/pending");

export const approveTestimonial = (id: string) =>
  api.patch<{ testimonial: Testimonial }>(`/testimonials/${id}/approve`);

export const rejectTestimonial = (id: string) =>
  api.patch<{ testimonial: Testimonial }>(`/testimonials/${id}/reject`);

export const generateAiHighlight = (id: string) =>
  api.post<{ testimonial: Testimonial }>(`/testimonials/${id}/ai-highlight`);

export const getPublicCaseStudy = (token: string) =>
  api.get<{ caseStudy: Pick<CaseStudy, "_id" | "title" | "description"> }>(`/public/case-study/${token}`);

export type PublicTestimonialPayload = {
  clientName: string;
  clientEmail?: string;
  clientCompany?: string;
  message: string;
};

export const submitPublicTestimonial = (token: string, payload: PublicTestimonialPayload) =>
  api.post<{ message: string }>(`/public/testimonial/${token}`, payload);

export const getPublicProfile = (
  slug: string,
  options: { page: number; limit?: number; sort?: "newest" | "oldest"; caseStudy?: string },
) => api.get<PublicProfileResponse>(`/public/profile/${slug}`, { params: options });

export const updatePublicProfile = (slug: string, payload: { name?: string; bio?: string }) =>
  api.put<{ message: string; profile: Pick<AuthUser, "name" | "bio" | "profileSlug" | "profilePicture"> }>(`/public/profile/${slug}`, payload);

export const getPublicProfiles = (options: { page: number; limit?: number }) =>
  api.get<PublicProfilesResponse>("/public/profiles", { params: options });

export const updateProfilePicture = (file: File) => {
  const payload = new FormData();
  payload.append("profilePicture", file);
  return api.put<{ message: string; user: AuthUser }>("/auth/profile-picture", payload);
};
