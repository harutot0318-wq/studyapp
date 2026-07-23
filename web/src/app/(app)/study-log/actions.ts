"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createSubject(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const name = (formData.get("name") as string)?.trim();
  const examId = formData.get("exam_id") as string;
  if (!name || !examId) return;

  const { error } = await supabase
    .from("subjects")
    .insert({ user_id: user.id, exam_id: examId, name });
  if (error) throw error;

  revalidatePath("/study-log");
}

export async function createStudyLog(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const subjectId = formData.get("subject_id") as string;
  const studyDate = formData.get("study_date") as string;
  const durationMinutes = Number(formData.get("duration_minutes"));
  const memo = (formData.get("memo") as string)?.trim() || null;

  if (!subjectId || !studyDate || !durationMinutes) return;

  const { error } = await supabase.from("study_logs").insert({
    user_id: user.id,
    subject_id: subjectId,
    study_date: studyDate,
    duration_minutes: durationMinutes,
    memo,
  });
  if (error) throw error;

  revalidatePath("/study-log");
}
