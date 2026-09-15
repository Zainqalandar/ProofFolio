import TestimonialSubmissionForm from "./testimonial-submission-form";

export default async function TestimonialSubmissionPage({ params }: PageProps<"/submit/[token]">) {
  const { token } = await params;
  return <TestimonialSubmissionForm token={token} />;
}
