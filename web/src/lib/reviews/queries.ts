import { createClient } from "@/lib/supabase/server";

export type Review = {
  id: string;
  scheduled_date: string;
  status: "未実施" | "実施済み";
  targetType: "word" | "material";
  targetLabel: string;
  wordId: string | null;
  materialId: string | null;
  currentUnderstanding: string | null;
  examId: string | null;
};

type RawReview = {
  id: string;
  scheduled_date: string;
  status: string;
  word: {
    id: string;
    term: string;
    understanding_level: string;
    material: { subject: { exam: { id: string } | null } | null } | null;
  } | null;
  material: {
    id: string;
    name: string;
    subject: { exam: { id: string } | null } | null;
  } | null;
};

export async function getReviews(options?: { examId?: string }): Promise<Review[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reviews")
    .select(
      `id, scheduled_date, status,
       word:words(id, term, understanding_level, material:materials(subject:subjects(exam:exams(id)))),
       material:materials(id, name, subject:subjects(exam:exams(id)))`,
    )
    .order("scheduled_date", { ascending: true });
  if (error) throw error;

  const raw = data as unknown as RawReview[];

  // reviews は word_id か material_id のどちらか一方だけを持つ(DBのCHECK制約)
  const mapped: Review[] = raw.map((r) => {
    if (r.word) {
      return {
        id: r.id,
        scheduled_date: r.scheduled_date,
        status: r.status as Review["status"],
        targetType: "word",
        targetLabel: r.word.term,
        wordId: r.word.id,
        materialId: null,
        currentUnderstanding: r.word.understanding_level,
        examId: r.word.material?.subject?.exam?.id ?? null,
      };
    }
    return {
      id: r.id,
      scheduled_date: r.scheduled_date,
      status: r.status as Review["status"],
      targetType: "material",
      targetLabel: r.material?.name ?? "(削除済み)",
      wordId: null,
      materialId: r.material?.id ?? null,
      currentUnderstanding: null,
      examId: r.material?.subject?.exam?.id ?? null,
    };
  });

  if (options?.examId) {
    return mapped.filter((r) => r.examId === options.examId);
  }
  return mapped;
}
