import { createClient } from "@/lib/supabase/server";

export type Task = {
  id: string;
  title: string;
  priority: "高" | "中" | "低";
  is_done: boolean;
};

export async function getTasks(examId: string): Promise<Task[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tasks")
    .select("id, title, priority, is_done")
    .eq("exam_id", examId)
    .order("is_done", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}
