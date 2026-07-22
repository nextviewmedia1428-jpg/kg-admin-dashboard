import BusinessDetail from "@/components/BusinessDetail";

export default async function BusinessDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <BusinessDetail id={id} />;
}
