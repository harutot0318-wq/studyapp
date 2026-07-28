import { createClient } from "@/lib/supabase/server";

export type Material = {
  id: string;
  name: string;
  material_type: string;
  progress_note: string | null;
  progress_percent: number | null;
  subject: { id: string; name: string } | null;
  totalMinutes: number;
};

export async function getMaterials(examId: string): Promise<Material[]> {
  const supabase = await createClient();
  const { data: materials, error } = await supabase
    .from("materials")
    .select(
      "id, name, material_type, progress_note, progress_percent, subject:subjects!inner(id, name, exam_id)",
    )
    .eq("subjects.exam_id", examId)
    .order("created_at", { ascending: true });
  if (error) throw error;

  const materialIds = materials.map((m) => m.id);
  const totals = new Map<string, number>();

  if (materialIds.length > 0) {
    const { data: logs, error: logsError } = await supabase
      .from("study_logs")
      .select("material_id, duration_minutes")
      .in("material_id", materialIds);
    if (logsError) throw logsError;

    for (const log of logs) {
      if (!log.material_id) continue;
      totals.set(
        log.material_id,
        (totals.get(log.material_id) ?? 0) + log.duration_minutes,
      );
    }
  }

  return materials.map((m) => ({
    ...m,
    totalMinutes: totals.get(m.id) ?? 0,
  })) as unknown as Material[];
}
