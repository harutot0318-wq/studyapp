import Link from "next/link";
import { getActiveExam } from "@/lib/exams/active";
import {
  getSubjectTotals,
  getMaterialTotals,
  getDailyTrend,
  getStreakTrend,
} from "@/lib/analytics/queries";
import { SimpleBarChart } from "@/components/charts/bar-chart";
import { SimpleLineChart } from "@/components/charts/line-chart";

export default async function AnalysisPage() {
  const activeExam = await getActiveExam();
  if (!activeExam) {
    return (
      <div className="mx-auto max-w-2xl">
        <p className="text-sm text-gray-600">
          まずは資格を登録してください。
        </p>
        <Link href="/exams" className="mt-2 inline-block text-sm underline">
          資格管理へ
        </Link>
      </div>
    );
  }

  const [subjectTotals, materialTotals, dailyTrend, streakTrend] = await Promise.all([
    getSubjectTotals(activeExam.id),
    getMaterialTotals(activeExam.id),
    getDailyTrend(activeExam.id),
    getStreakTrend(activeExam.id),
  ]);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8">
      <div>
        <h1 className="text-lg font-bold">学習分析</h1>
        <p className="mt-1 text-sm text-gray-500">
          対象資格：{activeExam.name}
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="rounded border border-gray-200 p-4">
          <h2 className="mb-2 text-sm font-semibold text-gray-700">
            科目別 学習時間
          </h2>
          {subjectTotals.length === 0 ? (
            <p className="text-sm text-gray-500">データがありません</p>
          ) : (
            <SimpleBarChart data={subjectTotals} unit="h" />
          )}
        </div>
        <div className="rounded border border-gray-200 p-4">
          <h2 className="mb-2 text-sm font-semibold text-gray-700">
            教材別 学習時間
          </h2>
          {materialTotals.length === 0 ? (
            <p className="text-sm text-gray-500">データがありません</p>
          ) : (
            <SimpleBarChart data={materialTotals} unit="h" />
          )}
        </div>
      </div>

      <div className="rounded border border-gray-200 p-4">
        <h2 className="mb-2 text-sm font-semibold text-gray-700">
          学習時間の推移（直近14日・分）
        </h2>
        <SimpleLineChart data={dailyTrend} dataKey="minutes" />
      </div>

      <div className="rounded border border-gray-200 p-4">
        <h2 className="mb-2 text-sm font-semibold text-gray-700">
          継続学習日数の推移（直近30日）
        </h2>
        <SimpleLineChart data={streakTrend} dataKey="streak" />
      </div>
    </div>
  );
}
