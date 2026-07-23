import { createClient } from "@/lib/supabase/server";
import { toDateStr } from "@/lib/dates";

export type DashboardStats = {
  todayMinutes: number;
  weekMinutes: number;
  streakDays: number;
};

function startOfWeek(d: Date): Date {
  // 月曜始まり
  const day = d.getDay(); // 0 = 日曜
  const diff = (day === 0 ? -6 : 1) - day;
  const monday = new Date(d);
  monday.setDate(d.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

export async function getDashboardStats(examId: string): Promise<DashboardStats> {
  const supabase = await createClient();
  const today = new Date();
  const todayStr = toDateStr(today);
  const weekStartStr = toDateStr(startOfWeek(today));

  // 今日・今週の合計学習時間（この期間の記録を取得してJS側で合計する）
  const { data: weekLogs, error: weekError } = await supabase
    .from("study_logs")
    .select("study_date, duration_minutes, subjects!inner(exam_id)")
    .eq("subjects.exam_id", examId)
    .gte("study_date", weekStartStr)
    .lte("study_date", todayStr);
  if (weekError) throw weekError;

  const todayMinutes = weekLogs
    .filter((r) => r.study_date === todayStr)
    .reduce((sum, r) => sum + r.duration_minutes, 0);
  const weekMinutes = weekLogs.reduce((sum, r) => sum + r.duration_minutes, 0);

  // 連続学習日数（直近60日分の記録がある日付から計算）
  const sinceStr = toDateStr(new Date(today.getTime() - 60 * 24 * 60 * 60 * 1000));
  const { data: recentLogs, error: recentError } = await supabase
    .from("study_logs")
    .select("study_date, subjects!inner(exam_id)")
    .eq("subjects.exam_id", examId)
    .gte("study_date", sinceStr);
  if (recentError) throw recentError;

  const studiedDates = new Set(recentLogs.map((r) => r.study_date));
  let streakDays = 0;
  const cursor = new Date(today);
  cursor.setHours(0, 0, 0, 0);
  // 今日はまだ記録していなくても、昨日まで連続していればストリークは継続中とみなす
  if (!studiedDates.has(toDateStr(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }
  while (studiedDates.has(toDateStr(cursor))) {
    streakDays++;
    cursor.setDate(cursor.getDate() - 1);
  }

  return { todayMinutes, weekMinutes, streakDays };
}
