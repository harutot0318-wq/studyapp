"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";

async function upsertTagsAndLink(
  supabase: SupabaseClient,
  userId: string,
  wordId: string,
  tagNames: string[],
) {
  for (const rawName of tagNames) {
    const name = rawName.trim();
    if (!name) continue;

    const { data: tag, error: tagError } = await supabase
      .from("tags")
      .upsert({ user_id: userId, name }, { onConflict: "user_id,name" })
      .select("id")
      .single();
    if (tagError) throw tagError;

    const { error: linkError } = await supabase
      .from("word_tags")
      .insert({ word_id: wordId, tag_id: tag.id });
    if (linkError) throw linkError;
  }
}

export async function createWord(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const materialId = formData.get("material_id") as string;
  const term = (formData.get("term") as string)?.trim();
  const meaning = (formData.get("meaning") as string)?.trim() || null;
  const understandingLevel =
    (formData.get("understanding_level") as string) || "未理解";
  const tagsRaw = (formData.get("tags") as string) || "";

  if (!materialId || !term) return;

  const { data: word, error } = await supabase
    .from("words")
    .insert({
      user_id: user.id,
      material_id: materialId,
      term,
      meaning,
      understanding_level: understandingLevel,
    })
    .select("id")
    .single();
  if (error) throw error;

  const tagNames = tagsRaw
    .split(/[,、]/)
    .map((t) => t.trim())
    .filter(Boolean);
  if (tagNames.length > 0) {
    await upsertTagsAndLink(supabase, user.id, word.id, tagNames);
  }

  revalidatePath("/words");
}

export async function updateUnderstanding(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;
  const understandingLevel = formData.get("understanding_level") as string;

  const { error } = await supabase
    .from("words")
    .update({ understanding_level: understandingLevel })
    .eq("id", id);
  if (error) throw error;

  revalidatePath("/words");
}

export async function toggleResolved(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;

  const { data: word, error: fetchError } = await supabase
    .from("words")
    .select("is_resolved")
    .eq("id", id)
    .single();
  if (fetchError || !word) return;

  const { error } = await supabase
    .from("words")
    .update({ is_resolved: !word.is_resolved })
    .eq("id", id);
  if (error) throw error;

  revalidatePath("/words");
}

export async function deleteWord(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;

  const { error } = await supabase.from("words").delete().eq("id", id);
  if (error) throw error;

  revalidatePath("/words");
}
