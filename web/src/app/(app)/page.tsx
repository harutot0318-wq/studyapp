import Link from "next/link";
import { getActiveExam } from "@/lib/exams/active";
import { getDashboardStats } from "@/lib/dashboard/queries";
import { getTasks } from "@/lib/tasks/queries";
import { getRecentStudyLogs } from "@/lib/study-logs/queries";
import { getGoals } from "@/lib/goals/queries";
import { daysUntil } from "@/lib/dates";
import { Card } from "@/components/ui/card";
import { Badge, type BadgeVariant } from "@/components/ui/badge";

function formatHours(minutes: number): string {
  return `${(minutes / 60).toFixed(1)}h`;
}

function StatCard({
  label,
  value,
  muted,
  href,
}: {
  label: string;
  value: string;
  muted?: boolean;
  href?: string;
}) {
  return (
    <Card className="text-center">
      <div className="text-xs font-semibold text-gray-500">{label}</div>
      <div
        className={`mt-2 text-2xl font-extrabold ${muted ? "text-gray-300" : "text-gray-900"}`}
      >
        {value}
      </div>
      {href && (
        <Link
          href={href}
          className="mt-1 block text-xs font-medium text-indigo-600 hover:underline"
        >
          → 設定する
        </Link>
      )}
    </Card>
  );
}

const PRIORITY_VARIANT: Record<string, BadgeVariant> = {
  高: "red",
  中: "amber",
  低: "gray",
};

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
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">ダッシュボード</h1>
        <p className="mt-1 text-sm text-gray-500">
          対象資格：{activeExam.name}
        </p>
      </div>

      {stats.streakDays > 0 && (
        <div className="flex items-center gap-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-500 px-6 py-5 text-white shadow-sm">
          <span className="text-3xl">🔥</span>
          <div>
            <p className="text-lg font-extrabold">
              {stats.streakDays}日連続で学習中！
            </p>
            <p className="text-sm text-indigo-100">
              今日の調子で続けましょう
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        <StatCard label="今日の学習時間" value={formatHours(stats.todayMinutes)} />
        <StatCard label="今週の学習時間" value={formatHours(stats.weekMinutes)} />
        <StatCard label="連続学習日数" value={`🔥 ${stats.streakDays}日`} />
        {dailyGoal ? (
          <StatCard
            label="今日の目標達成率"
            value={`${dailyGoal.achievementRate}%`}
          />
        ) : (
          <StatCard label="今日の目標達成率" value="未設定" muted href="/goals" />
        )}
        <StatCard
          label="試験までの残り日数"
          value={daysUntil(activeExam.exam_date)}
          muted={!activeExam.exam_date}
          href={!activeExam.exam_date ? "/exams" : undefined}
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-800">今日のタスク</h2>
            <span className="text-xs text-gray-400">タスク管理と連動</span>
          </div>
          <div className="flex flex-col gap-1.5">
            {incompleteTasks.length === 0 && (
              <p className="text-sm text-gray-400">
                未完了のタスクはありません
              </p>
            )}
            {incompleteTasks.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between rounded-lg px-2 py-1.5 hover:bg-gray-50"
              >
                <span className="text-sm text-gray-700">{t.title}</span>
                <Badge variant={PRIORITY_VARIANT[t.priority]}>
                  {t.priority}
                </Badge>
              </div>
            ))}
            <Link
              href="/tasks"
              className="mt-1 text-xs font-semibold text-indigo-600 hover:underline"
            >
              ＋ タスクを追加
            </Link>
          </div>
        </Card>
        <Card>
          <h2 className="mb-3 text-sm font-bold text-gray-800">
            最近の学習記録
          </h2>
          <div className="flex flex-col gap-1.5">
            {logs.length === 0 && (
              <p className="text-sm text-gray-400">まだ記録がありません</p>
            )}
            {logs.map((l) => (
              <div
                key={l.id}
                className="flex justify-between rounded-lg px-2 py-1.5 text-sm hover:bg-gray-50"
              >
                <span className="text-gray-700">
                  {l.study_date}　{l.subject?.name}
                </span>
                <span className="font-semibold text-gray-900">
                  {l.duration_minutes}分
                </span>
              </div>
            ))}
            <Link
              href="/study-log"
              className="mt-1 text-xs font-semibold text-indigo-600 hover:underline"
            >
              ＋ 学習を記録する
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
