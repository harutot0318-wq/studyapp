"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createWordReview(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const wordId = formData.get("word_id") as string;
  const scheduledDate = formData.get("scheduled_date") as string;
  if (!wordId || !scheduledDate) return;

  const { error } = await supabase.from("reviews").insert({
    user_id: user.id,
    word_id: wordId,
    scheduled_date: scheduledDate,
  });
  if (error) throw error;

  revalidatePath("/review");
}

export async function createMaterialReview(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const materialId = formData.get("material_id") as string;
  const scheduledDate = formData.get("scheduled_date") as string;
  if (!materialId || !scheduledDate) return;

  const { error } = await supabase.from("reviews").insert({
    user_id: user.id,
    material_id: materialId,
    scheduled_date: scheduledDate,
  });
  if (error) throw error;

  revalidatePath("/review");
}

export async function completeReview(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const id = formData.get("id") as string;
  const targetType = formData.get("target_type") as "word" | "material";
  const wordId = (formData.get("word_id") as string) || null;
  const materialId = (formData.get("material_id") as string) || null;
  const nextUnderstanding = (formData.get("next_understanding_level") as string) || null;
  const nextScheduledDate = (formData.get("next_scheduled_date") as string) || null;

  const { error } = await supabase
    .from("reviews")
    .update({ status: "実施済み", completed_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;

  if (targetType === "word" && wordId && nextUnderstanding) {
    const { error: updError } = await supabase
      .from("words")
      .update({ understanding_level: nextUnderstanding })
      .eq("id", wordId);
    if (updError) throw updError;
  }

  // 次回の復習予定日が指定されていれば、新しい復習予定として登録する
  // (実施済みの記録はそのまま履歴として残す)
  if (nextScheduledDate) {
    const insertPayload: {
      user_id: string;
      scheduled_date: string;
      word_id?: string;
      material_id?: string;
    } = {
      user_id: user.id,
      scheduled_date: nextScheduledDate,
    };
    if (targetType === "word" && wordId) insertPayload.word_id = wordId;
    if (targetType === "material" && materialId) insertPayload.material_id = materialId;

    const { error: insError } = await supabase.from("reviews").insert(insertPayload);
    if (insError) throw insError;
  }

  revalidatePath("/review");
}

export async function deleteReview(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;

  const { error } = await supabase.from("reviews").delete().eq("id", id);
  if (error) throw error;

  revalidatePath("/review");
}
