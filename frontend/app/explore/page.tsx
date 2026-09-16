import type { Metadata } from "next";
import PublicProfilesDirectory from "./public-profiles-directory";

export const metadata: Metadata = {
  title: "Explore portfolios — ProofFolio",
  description: "Discover public ProofFolio profiles, case studies, and verified work.",
};

export default function ExplorePage() {
  return <PublicProfilesDirectory />;
}
