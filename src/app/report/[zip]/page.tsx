import { getZipReport } from "@/lib/epa/client";

export const dynamic = "force-dynamic";

export default async function ReportPage({ params }: { params: Promise<{ zip: string }> }) {
  const { zip } = await params;
  let data: unknown;
  try {
    data = await getZipReport(zip);
  } catch (error) {
    data = { zip, error: error instanceof Error ? error.message : "Unable to load report." };
  }
  return <pre>{JSON.stringify(data, null, 2)}</pre>;
}
