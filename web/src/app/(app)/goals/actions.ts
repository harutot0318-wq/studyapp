"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createGoal(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const examId = formData.get("exam_id") as string;
  const period = formData.get("period") as string;
  const targetMinutes = Number(formData.get("target_minutes"));

  if (!examId || !period || !targetMinutes) return;

  const { error } = await supabase.from("goals").insert({
    user_id: user.id,
    exam_id: examId,
    period,
    target_minutes: targetMinutes,
  });
  if (error) throw error;

  revalidatePath("/goals");
  revalidatePath("/");
}

export async function deleteGoal(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;

  const { error } = await supabase.from("goals").delete().eq("id", id);
  if (error) throw error;

  revalidatePath("/goals");
  revalidatePath("/");
}
