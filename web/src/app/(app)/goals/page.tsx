import Link from "next/link";
import { getActiveExam } from "@/lib/exams/active";
import { getGoals } from "@/lib/goals/queries";
import { createGoal, deleteGoal } from "./actions";

const PERIODS = ["日", "週", "月"] as const;

function formatHours(minutes: number): string {
  return `${(minutes / 60).toFixed(1)}h`;
}

export default async function GoalsPage() {
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

  const goals = await getGoals(activeExam.id);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8">
      <div>
        <h1 className="text-lg font-bold">目標管理</h1>
        <p className="mt-1 text-sm text-gray-500">
          対象資格：{activeExam.name}
        </p>
      </div>

      <form
        action={createGoal}
        className="flex flex-col gap-3 rounded border border-gray-200 p-4 sm:flex-row sm:items-end"
      >
        <input type="hidden" name="exam_id" value={activeExam.id} />
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">期間</label>
          <select
            name="period"
            defaultValue="日"
            className="rounded border border-gray-300 px-3 py-2 text-sm"
          >
            {PERIODS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-1 flex-col gap-1">
          <label className="text-xs text-gray-500">目標学習時間（分）</label>
          <input
            type="number"
            name="target_minutes"
            required
            min={1}
            placeholder="例：120"
            className="rounded border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <button
          type="submit"
          className="rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
        >
          ＋ 目標を追加
        </button>
      </form>

      <div className="flex flex-col gap-3">
        {goals.length === 0 && (
          <p className="text-sm text-gray-500">
            まだ目標が登録されていません。
          </p>
        )}
        {goals.map((g) => (
          <div key={g.id} className="rounded border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">
                {g.period}次目標　{formatHours(g.target_minutes)}
              </span>
              <div className="flex items-center gap-3">
                <span className="rounded-full border border-gray-300 px-2 py-0.5 text-xs text-gray-500">
                  達成率 {g.achievementRate}%
                </span>
                <form action={deleteGoal}>
                  <input type="hidden" name="id" value={g.id} />
                  <button type="submit" className="text-xs text-red-600 underline">
                    削除
                  </button>
                </form>
              </div>
            </div>
            <div className="mt-2 h-2 w-full rounded bg-gray-200">
              <div
                className="h-2 rounded bg-gray-900"
                style={{ width: `${Math.min(100, g.achievementRate)}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              実績：{formatHours(g.achievedMinutes)} / 目標：
              {formatHours(g.target_minutes)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
