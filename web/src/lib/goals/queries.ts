import { createClient } from "@/lib/supabase/server";
import { toDateStr } from "@/lib/dates";

export type Goal = {
  id: string;
  period: "日" | "週" | "月";
  target_minutes: number;
  achievedMinutes: number;
  achievementRate: number;
};

function startOfWeek(d: Date): Date {
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  const monday = new Date(d);
  monday.setDate(d.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export async function getGoals(examId: string): Promise<Goal[]> {
  const supabase = await createClient();
  const { data: goalsRaw, error } = await supabase
    .from("goals")
    .select("id, period, target_minutes")
    .eq("exam_id", examId)
    .order("created_at", { ascending: true });
  if (error) throw error;

  const today = new Date();
  const todayStr = toDateStr(today);
  const weekStartStr = toDateStr(startOfWeek(today));
  const monthStartStr = toDateStr(startOfMonth(today));
  const earliestStr = weekStartStr < monthStartStr ? weekStartStr : monthStartStr;

  const { data: logs, error: logsError } = await supabase
    .from("study_logs")
    .select("study_date, duration_minutes, subject:subjects!inner(exam_id)")
    .eq("subjects.exam_id", examId)
    .gte("study_date", earliestStr)
    .lte("study_date", todayStr);
  if (logsError) throw logsError;

  const rows = logs as unknown as { study_date: string; duration_minutes: number }[];
  const sumFrom = (fromStr: string) =>
    rows
      .filter((r) => r.study_date >= fromStr)
      .reduce((sum, r) => sum + r.duration_minutes, 0);

  const todayMinutes = sumFrom(todayStr);
  const weekMinutes = sumFrom(weekStartStr);
  const monthMinutes = sumFrom(monthStartStr);

  return goalsRaw.map((g) => {
    const achieved =
      g.period === "日" ? todayMinutes : g.period === "週" ? weekMinutes : monthMinutes;
    return {
      id: g.id,
      period: g.period as Goal["period"],
      target_minutes: g.target_minutes,
      achievedMinutes: achieved,
      achievementRate:
        g.target_minutes > 0 ? Math.round((achieved / g.target_minutes) * 100) : 0,
    };
  });
}
