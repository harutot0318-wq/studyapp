"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createMaterial(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const subjectId = formData.get("subject_id") as string;
  const name = (formData.get("name") as string)?.trim();
  const materialType = formData.get("material_type") as string;
  const progressNote = (formData.get("progress_note") as string)?.trim() || null;
  const progressPercentRaw = formData.get("progress_percent") as string;
  const progressPercent = progressPercentRaw ? Number(progressPercentRaw) : null;

  if (!subjectId || !name || !materialType) return;

  const { error } = await supabase.from("materials").insert({
    user_id: user.id,
    subject_id: subjectId,
    name,
    material_type: materialType,
    progress_note: progressNote,
    progress_percent: progressPercent,
  });
  if (error) throw error;

  revalidatePath("/materials");
}

export async function updateMaterialProgress(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;
  const progressNote = (formData.get("progress_note") as string)?.trim() || null;
  const progressPercentRaw = formData.get("progress_percent") as string;
  const progressPercent = progressPercentRaw ? Number(progressPercentRaw) : null;

  const { error } = await supabase
    .from("materials")
    .update({ progress_note: progressNote, progress_percent: progressPercent })
    .eq("id", id);
  if (error) throw error;

  revalidatePath("/materials");
}

export async function deleteMaterial(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;

  const { error } = await supabase.from("materials").delete().eq("id", id);
  if (error) throw error;

  revalidatePath("/materials");
}
