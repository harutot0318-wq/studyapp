"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function createExam(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const name = (formData.get("name") as string)?.trim();
  const examDate = formData.get("exam_date") as string;
  if (!name) return;

  const { error } = await supabase.from("exams").insert({
    user_id: user.id,
    name,
    exam_date: examDate || null,
  });
  if (error) throw error;

  revalidatePath("/exams");
}

export async function deleteExam(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;

  const { error } = await supabase.from("exams").delete().eq("id", id);
  if (error) throw error;

  revalidatePath("/exams");
}

export async function setActiveExam(formData: FormData) {
  const id = formData.get("id") as string;
  const cookieStore = await cookies();
  cookieStore.set("active_exam_id", id, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  revalidatePath("/exams");
}
