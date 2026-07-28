import { createClient } from "@/lib/supabase/server";
import { toDateStr } from "@/lib/dates";

export type NamedTotal = { name: string; hours: number };
export type DailyPoint = { date: string; minutes: number };
export type StreakPoint = { date: string; streak: number };

export async function getSubjectTotals(examId: string): Promise<NamedTotal[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("study_logs")
    .select("duration_minutes, subject:subjects!inner(name, exam_id)")
    .eq("subjects.exam_id", examId);
  if (error) throw error;

  const rows = data as unknown as {
    duration_minutes: number;
    subject: { name: string };
  }[];

  const totals = new Map<string, number>();
  for (const row of rows) {
    totals.set(row.subject.name, (totals.get(row.subject.name) ?? 0) + row.duration_minutes);
  }
  return Array.from(totals.entries()).map(([name, minutes]) => ({
    name,
    hours: Math.round((minutes / 60) * 10) / 10,
  }));
}

export async function getMaterialTotals(examId: string): Promise<NamedTotal[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("study_logs")
    .select("duration_minutes, material:materials(name), subject:subjects!inner(exam_id)")
    .eq("subjects.exam_id", examId)
    .not("material_id", "is", null);
  if (error) throw error;

  const rows = data as unknown as {
    duration_minutes: number;
    material: { name: string } | null;
  }[];

  const totals = new Map<string, number>();
  for (const row of rows) {
    if (!row.material) continue;
    totals.set(row.material.name, (totals.get(row.material.name) ?? 0) + row.duration_minutes);
  }
  return Array.from(totals.entries()).map(([name, minutes]) => ({
    name,
    hours: Math.round((minutes / 60) * 10) / 10,
  }));
}

export async function getDailyTrend(examId: string, days = 14): Promise<DailyPoint[]> {
  const supabase = await createClient();
  const today = new Date();
  const start = new Date(today);
  start.setDate(start.getDate() - (days - 1));
  const startStr = toDateStr(start);
  const todayStr = toDateStr(today);

  const { data, error } = await supabase
    .from("study_logs")
    .select("study_date, duration_minutes, subject:subjects!inner(exam_id)")
    .eq("subjects.exam_id", examId)
    .gte("study_date", startStr)
    .lte("study_date", todayStr);
  if (error) throw error;

  const rows = data as unknown as { study_date: string; duration_minutes: number }[];
  const totalsByDate = new Map<string, number>();
  for (const row of rows) {
    totalsByDate.set(row.study_date, (totalsByDate.get(row.study_date) ?? 0) + row.duration_minutes);
  }

  const points: DailyPoint[] = [];
  const cursor = new Date(start);
  for (let i = 0; i < days; i++) {
    const dStr = toDateStr(cursor);
    points.push({
      date: `${cursor.getMonth() + 1}/${cursor.getDate()}`,
      minutes: totalsByDate.get(dStr) ?? 0,
    });
    cursor.setDate(cursor.getDate() + 1);
  }
  return points;
}

export async function getStreakTrend(examId: string, days = 30): Promise<StreakPoint[]> {
  const supabase = await createClient();
  const today = new Date();
  const start = new Date(today);
  start.setDate(start.getDate() - (days - 1));
  const startStr = toDateStr(start);
  const todayStr = toDateStr(today);

  const { data, error } = await supabase
    .from("study_logs")
    .select("study_date, subject:subjects!inner(exam_id)")
    .eq("subjects.exam_id", examId)
    .gte("study_date", startStr)
    .lte("study_date", todayStr);
  if (error) throw error;

  const rows = data as unknown as { study_date: string }[];
  const studiedDates = new Set(rows.map((r) => r.study_date));

  const points: StreakPoint[] = [];
  let streak = 0;
  const cursor = new Date(start);
  for (let i = 0; i < days; i++) {
    const dStr = toDateStr(cursor);
    streak = studiedDates.has(dStr) ? streak + 1 : 0;
    points.push({ date: `${cursor.getMonth() + 1}/${cursor.getDate()}`, streak });
    cursor.setDate(cursor.getDate() + 1);
  }
  return points;
}
