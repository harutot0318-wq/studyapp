import Link from "next/link";
import { getActiveExam } from "@/lib/exams/active";
import { getDashboardStats } from "@/lib/dashboard/queries";
import { getTasks } from "@/lib/tasks/queries";
import { getRecentStudyLogs } from "@/lib/study-logs/queries";
import { getGoals } from "@/lib/goals/queries";
import { daysUntil } from "@/lib/dates";

function formatHours(minutes: number): string {
  return `${(minutes / 60).toFixed(1)}h`;
}

function StatCard({
  label,
  value,
  muted,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="rounded border border-gray-200 p-3 text-center">
      <div className="text-xs text-gray-500">{label}</div>
      <div className={`mt-2 text-lg font-bold ${muted ? "text-gray-400" : ""}`}>
        {value}
      </div>
    </div>
  );
}

export default async function DashboardPage() {
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

  const [stats, tasks, logs, goals] = await Promise.all([
    getDashboardStats(activeExam.id),
    getTasks(activeExam.id),
    getRecentStudyLogs(activeExam.id, 5),
    getGoals(activeExam.id),
  ]);

  const incompleteTasks = tasks.filter((t) => !t.is_done).slice(0, 5);
  const dailyGoal = goals.find((g) => g.period === "日");

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8">
      <div>
        <h1 className="text-lg font-bold">ダッシュボード</h1>
        <p className="mt-1 text-sm text-gray-500">
          対象資格：{activeExam.name}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <StatCard label="今日の学習時間" value={formatHours(stats.todayMinutes)} />
        <StatCard label="今週の学習時間" value={formatHours(stats.weekMinutes)} />
        <StatCard label="連続学習日数" value={`${stats.streakDays}日`} />
        {dailyGoal ? (
          <StatCard
            label="今日の目標達成率"
            value={`${dailyGoal.achievementRate}%`}
          />
        ) : (
          <div className="rounded border border-dashed border-gray-300 p-3 text-center">
            <div className="text-xs text-gray-500">今日の目標達成率</div>
            <div className="mt-2 text-xs text-gray-400">未設定</div>
            <Link href="/goals" className="text-xs text-gray-500 underline">
              → 目標を設定
            </Link>
          </div>
        )}
        <StatCard
          label="試験までの残り日数"
          value={daysUntil(activeExam.exam_date)}
          muted={!activeExam.exam_date}
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="rounded border border-gray-200">
          <div className="border-b border-gray-200 px-4 py-2 text-sm font-semibold">
            今日のタスク
          </div>
          <div className="flex flex-col gap-2 p-4">
            {incompleteTasks.length === 0 && (
              <p className="text-sm text-gray-500">
                未完了のタスクはありません
              </p>
            )}
            {incompleteTasks.map((t) => (
              <div key={t.id} className="text-sm">
                ・{t.title}
              </div>
            ))}
            <Link href="/tasks" className="text-xs underline">
              タスク管理へ
            </Link>
          </div>
        </div>
        <div className="rounded border border-gray-200">
          <div className="border-b border-gray-200 px-4 py-2 text-sm font-semibold">
            最近の学習記録
          </div>
          <div className="flex flex-col gap-2 p-4">
            {logs.length === 0 && (
              <p className="text-sm text-gray-500">まだ記録がありません</p>
            )}
            {logs.map((l) => (
              <div key={l.id} className="flex justify-between text-sm">
                <span>
                  {l.study_date}　{l.subject?.name}
                </span>
                <span>{l.duration_minutes}分</span>
              </div>
            ))}
            <Link href="/study-log" className="text-xs underline">
              学習記録へ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
