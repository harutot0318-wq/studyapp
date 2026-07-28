import Link from "next/link";
import { getActiveExam } from "@/lib/exams/active";
import { getWords } from "@/lib/words/queries";
import { Card } from "@/components/ui/card";
import { Badge, type BadgeVariant } from "@/components/ui/badge";

type SearchParams = {
  scope?: string;
  keyword?: string;
  tag?: string;
  material_id?: string;
  subject?: string;
  unresolved?: string;
};

const LEVEL_VARIANT: Record<string, BadgeVariant> = {
  未理解: "red",
  うろ覚え: "amber",
  理解済み: "green",
};

const inputClass =
  "rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400";
const labelClass = "text-xs font-medium text-gray-500";

export default async function WordSearchPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const showAll = params.scope === "all";

  const activeExam = await getActiveExam();
  if (!activeExam) {
    return (
      <div className="mx-auto max-w-2xl">
        <p className="text-sm text-gray-600">
          まずは資格を登録してください。
        </p>
        <Link href="/exams" className="mt-2 inline-block text-sm underline">
          資格管理へ
        </Link>
      </div>
    );
  }

  const words = await getWords(showAll ? undefined : { examId: activeExam.id });

  const materialOptions = Array.from(
    new Map(
      words
        .filter((w) => w.material)
        .map((w) => [w.material!.id, w.material!.name]),
    ).entries(),
  );
  const subjectOptions = Array.from(
    new Set(words.map((w) => w.subject?.name).filter(Boolean)),
  ) as string[];
  const tagOptions = Array.from(new Set(words.flatMap((w) => w.tags)));

  let results = words;
  if (params.keyword) {
    const kw = params.keyword.toLowerCase();
    results = results.filter((w) => w.term.toLowerCase().includes(kw));
  }
  if (params.tag) {
    results = results.filter((w) => w.tags.includes(params.tag!));
  }
  if (params.material_id) {
    results = results.filter((w) => w.material?.id === params.material_id);
  }
  if (params.subject) {
    results = results.filter((w) => w.subject?.name === params.subject);
  }
  if (params.unresolved === "1") {
    results = results.filter((w) => !w.is_resolved);
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">単語検索</h1>
        <p className="mt-1 text-sm text-gray-500">
          対象資格：{activeExam.name}
        </p>
      </div>

      <div className="flex gap-2">
        <Link
          href={{ pathname: "/word-search", query: {} }}
          className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
            !showAll
              ? "bg-indigo-600 text-white shadow-sm"
              : "bg-white text-gray-500 ring-1 ring-gray-200 hover:bg-gray-50"
          }`}
        >
          対象資格のみ
        </Link>
        <Link
          href={{ pathname: "/word-search", query: { scope: "all" } }}
          className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
            showAll
              ? "bg-indigo-600 text-white shadow-sm"
              : "bg-white text-gray-500 ring-1 ring-gray-200 hover:bg-gray-50"
          }`}
        >
          すべての資格
        </Link>
      </div>

      <Card>
        <form method="get" className="flex flex-col gap-3">
          {showAll && <input type="hidden" name="scope" value="all" />}

          <div className="flex flex-col gap-1">
            <label className={labelClass}>キーワード検索（単語名）</label>
            <input
              name="keyword"
              defaultValue={params.keyword ?? ""}
              placeholder="🔍 単語名を入力…"
              className={inputClass}
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="flex flex-1 flex-col gap-1">
              <label className={labelClass}>タグで絞込</label>
              <select
                name="tag"
                defaultValue={params.tag ?? ""}
                className={inputClass}
              >
                <option value="">すべて</option>
                {tagOptions.map((t) => (
                  <option key={t} value={t}>
                    #{t}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-1 flex-col gap-1">
              <label className={labelClass}>教材で絞込</label>
              <select
                name="material_id"
                defaultValue={params.material_id ?? ""}
                className={inputClass}
              >
                <option value="">すべて</option>
                {materialOptions.map(([id, name]) => (
                  <option key={id} value={id}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-1 flex-col gap-1">
              <label className={labelClass}>科目で絞込</label>
              <select
                name="subject"
                defaultValue={params.subject ?? ""}
                className={inputClass}
              >
                <option value="">すべて</option>
                {subjectOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              name="unresolved"
              value="1"
              defaultChecked={params.unresolved === "1"}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600"
            />
            未解決の単語のみ表示
          </label>

          <button
            type="submit"
            className="self-start rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
          >
            検索
          </button>
        </form>
      </Card>

      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-bold text-gray-700">
          検索結果（{results.length}件）
        </h2>
        {results.length === 0 && (
          <p className="text-sm text-gray-500">該当する単語がありません。</p>
        )}
        {results.map((w) => (
          <Card key={w.id}>
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-900">{w.term}</span>
              <Badge variant={LEVEL_VARIANT[w.understanding_level]}>
                {w.understanding_level}
              </Badge>
              {w.is_resolved && <Badge variant="green">解決済み</Badge>}
            </div>
            {w.meaning && (
              <p className="mt-1 text-sm text-gray-600">{w.meaning}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              {w.tags.map((t) => `#${t}`).join(" ")}
              {w.tags.length > 0 && "　"}
              教材：{w.material?.name}　科目：{w.subject?.name}
              {showAll && w.exam && `　資格：${w.exam.name}`}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}
