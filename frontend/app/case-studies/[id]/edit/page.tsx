import EditCaseStudyForm from "./edit-case-study-form";

export default async function EditCaseStudyPage({ params }: PageProps<"/case-studies/[id]/edit">) {
  const { id } = await params;
  return <EditCaseStudyForm caseStudyId={id} />;
}
