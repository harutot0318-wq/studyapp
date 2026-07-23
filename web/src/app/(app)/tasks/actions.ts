"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createTask(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const examId = formData.get("exam_id") as string;
  const title = (formData.get("title") as string)?.trim();
  const priority = (formData.get("priority") as string) || "中";
  if (!examId || !title) return;

  const { error } = await supabase
    .from("tasks")
    .insert({ user_id: user.id, exam_id: examId, title, priority });
  if (error) throw error;

  revalidatePath("/tasks");
}

export async function toggleTask(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;

  const { data: task, error: fetchError } = await supabase
    .from("tasks")
    .select("is_done")
    .eq("id", id)
    .single();
  if (fetchError || !task) return;

  const { error } = await supabase
    .from("tasks")
    .update({ is_done: !task.is_done })
    .eq("id", id);
  if (error) throw error;

  revalidatePath("/tasks");
}

export async function deleteTask(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;

  const { error } = await supabase.from("tasks").delete().eq("id", id);
  if (error) throw error;

  revalidatePath("/tasks");
}
