import { createClient } from "@/lib/supabase/server";

export type Word = {
  id: string;
  term: string;
  meaning: string | null;
  understanding_level: "未理解" | "うろ覚え" | "理解済み";
  is_resolved: boolean;
  material: { id: string; name: string } | null;
  subject: { name: string } | null;
  exam: { id: string; name: string } | null;
  tags: string[];
};

type RawWord = {
  id: string;
  term: string;
  meaning: string | null;
  understanding_level: string;
  is_resolved: boolean;
  material: {
    id: string;
    name: string;
    subject: {
      name: string;
      exam: { id: string; name: string } | null;
    } | null;
  } | null;
  word_tags: { tag: { name: string } | null }[];
};

export async function getWords(options?: { examId?: string }): Promise<Word[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("words")
    .select(
      `id, term, meaning, understanding_level, is_resolved,
       material:materials(id, name, subject:subjects(name, exam:exams(id, name))),
       word_tags(tag:tags(name))`,
    )
    .order("created_at", { ascending: false });
  if (error) throw error;

  const raw = data as unknown as RawWord[];

  const mapped: Word[] = raw.map((w) => ({
    id: w.id,
    term: w.term,
    meaning: w.meaning,
    understanding_level: w.understanding_level as Word["understanding_level"],
    is_resolved: w.is_resolved,
    material: w.material ? { id: w.material.id, name: w.material.name } : null,
    subject: w.material?.subject ? { name: w.material.subject.name } : null,
    exam: w.material?.subject?.exam ?? null,
    tags: w.word_tags
      .map((wt) => wt.tag?.name)
      .filter((t): t is string => Boolean(t)),
  }));

  // 資格による絞り込みはJS側で行う(材料→科目→資格のチェーンをPostgRESTのネスト
  // フィルタで直接書くより、この規模ではシンプルで確実なため)
  if (options?.examId) {
    return mapped.filter((w) => w.exam?.id === options.examId);
  }
  return mapped;
}
