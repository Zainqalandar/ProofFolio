import type { Metadata } from "next";
import PublicProfileView from "./public-profile-view";

export const metadata: Metadata = {
  title: "Freelancer profile — ProofFolio",
  description: "Verified work and client testimonials on ProofFolio.",
};

export default async function PublicProfilePage({ params }: PageProps<"/profile/[slug]">) {
  const { slug } = await params;
  return <PublicProfileView slug={slug} />;
}
