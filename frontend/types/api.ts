export type AuthUser = {
  _id: string;
  name: string;
  username?: string;
  email: string;
  bio: string;
  profileSlug: string;
  profilePicture: string;
};

export type CaseStudy = {
  _id: string;
  title: string;
  description: string;
  screenshots: string[];
  shareToken?: string;
  createdAt: string;
  updatedAt?: string;
};

export type PopulatedCaseStudy = { _id: string; title: string } | string;

export type Testimonial = {
  _id: string;
  caseStudy: PopulatedCaseStudy;
  clientName: string;
  clientEmail?: string;
  clientCompany?: string;
  message: string;
  aiHighlight?: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
  reviewedAt?: string;
};

export type PublicProfileResponse = {
  profile: Pick<AuthUser, "name" | "bio" | "profileSlug" | "profilePicture">;
  caseStudies: CaseStudy[];
  testimonials: Testimonial[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
};
