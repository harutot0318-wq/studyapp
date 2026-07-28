import Link from "next/link";
import { getActiveExam } from "@/lib/exams/active";
import { getGoals } from "@/lib/goals/queries";
import { createGoal, deleteGoal } from "./actions";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";

const PERIODS = ["日", "週", "月"] as const;

const inputClass =
  "rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400";
const labelClass = "text-xs font-medium text-gray-500";

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
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">目標管理</h1>
        <p className="mt-1 text-sm text-gray-500">
          対象資格：{activeExam.name}
        </p>
      </div>

      <Card>
        <form
          action={createGoal}
          className="flex flex-col gap-3 sm:flex-row sm:items-end"
        >
          <input type="hidden" name="exam_id" value={activeExam.id} />
          <div className="flex flex-col gap-1">
            <label className={labelClass}>期間</label>
            <select name="period" defaultValue="日" className={inputClass}>
              {PERIODS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-1 flex-col gap-1">
            <label className={labelClass}>目標学習時間（分）</label>
            <input
              type="number"
              name="target_minutes"
              required
              min={1}
              placeholder="例：120"
              className={inputClass}
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
          >
            ＋ 目標を追加
          </button>
        </form>
      </Card>

      <div className="flex flex-col gap-4">
        {goals.length === 0 && (
          <p className="text-sm text-gray-500">
            まだ目標が登録されていません。
          </p>
        )}
        {goals.map((g) => (
          <Card key={g.id}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-gray-900">
                {g.period}次目標　{formatHours(g.target_minutes)}
              </span>
              <div className="flex items-center gap-3">
                <Badge variant={g.achievementRate >= 100 ? "green" : "indigo"}>
                  達成率 {g.achievementRate}%
                </Badge>
                <form action={deleteGoal}>
                  <input type="hidden" name="id" value={g.id} />
                  <button
                    type="submit"
                    className="text-xs text-rose-500 hover:underline"
                  >
                    削除
                  </button>
                </form>
              </div>
            </div>
            <div className="mt-3">
              <ProgressBar percent={g.achievementRate} />
            </div>
            <p className="mt-2 text-xs text-gray-500">
              実績：{formatHours(g.achievedMinutes)} / 目標：
              {formatHours(g.target_minutes)}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}
