import { createClient } from "@/lib/supabase/server";

export type Subject = {
  id: string;
  name: string;
};

export async function getSubjects(examId: string): Promise<Subject[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("subjects")
    .select("id, name")
    .eq("exam_id", examId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data;
}
