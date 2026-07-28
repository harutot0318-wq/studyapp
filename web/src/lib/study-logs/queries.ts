import { createClient } from "@/lib/supabase/server";

export type StudyLog = {
  id: string;
  study_date: string;
  duration_minutes: number;
  memo: string | null;
  subject: { name: string } | null;
  material: { name: string } | null;
};

export async function getRecentStudyLogs(
  examId: string,
  limit = 10,
): Promise<StudyLog[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("study_logs")
    .select(
      "id, study_date, duration_minutes, memo, subject:subjects!inner(name, exam_id), material:materials(name)",
    )
    .eq("subjects.exam_id", examId)
    .order("study_date", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data as unknown as StudyLog[];
}
