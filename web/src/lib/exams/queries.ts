import { createClient } from "@/lib/supabase/server";

export type Exam = {
  id: string;
  name: string;
  exam_date: string | null;
  created_at: string;
};

export async function getExams(): Promise<Exam[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("exams")
    .select("id, name, exam_date, created_at")
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data;
}
