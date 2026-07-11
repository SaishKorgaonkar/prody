import { SessionView } from "@/components/SessionView";

export default async function SessionPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ mock?: string }>;
}) {
  const { id } = await params;
  const { mock } = await searchParams;

  return <SessionView sessionId={id} mock={mock === "1"} />;
}
