import { getZipReport } from "@/lib/epa/client";
import { generateWaterReport } from "@/lib/report/generate";

export const dynamic = "force-dynamic";

export default async function ReportPage({ params }: { params: Promise<{ zip: string }> }) {
  const { zip } = await params;
  let data: unknown;
  try {
    const report = await getZipReport(zip);
    data = {
      ...report,
      waterSystems: await Promise.all(report.waterSystems.map(async (waterSystem) => ({
        ...waterSystem,
        aiReport: await generateWaterReport(waterSystem),
      }))),
    };
  } catch (error) {
    data = { zip, error: error instanceof Error ? error.message : "Unable to load report." };
  }
  return <pre>{JSON.stringify(data, null, 2)}</pre>;
}
