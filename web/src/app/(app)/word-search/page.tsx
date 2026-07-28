import Link from "next/link";
import { getActiveExam } from "@/lib/exams/active";
import { getWords } from "@/lib/words/queries";

type SearchParams = {
  scope?: string;
  keyword?: string;
  tag?: string;
  material_id?: string;
  subject?: string;
  unresolved?: string;
};

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
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-lg font-bold">単語検索</h1>
        <p className="mt-1 text-sm text-gray-500">
          対象資格：{activeExam.name}
        </p>
      </div>

      <div className="flex gap-2 border-b border-gray-200">
        <Link
          href={{ pathname: "/word-search", query: {} }}
          className={`px-3 py-2 text-sm ${
            !showAll ? "border-b-2 border-gray-900 font-semibold" : "text-gray-500"
          }`}
        >
          対象資格のみ
        </Link>
        <Link
          href={{ pathname: "/word-search", query: { scope: "all" } }}
          className={`px-3 py-2 text-sm ${
            showAll ? "border-b-2 border-gray-900 font-semibold" : "text-gray-500"
          }`}
        >
          すべての資格
        </Link>
      </div>

      <form
        method="get"
        className="flex flex-col gap-3 rounded border border-gray-200 p-4"
      >
        {showAll && <input type="hidden" name="scope" value="all" />}

        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">キーワード検索（単語名）</label>
          <input
            name="keyword"
            defaultValue={params.keyword ?? ""}
            placeholder="🔍 単語名を入力…"
            className="rounded border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="flex flex-1 flex-col gap-1">
            <label className="text-xs text-gray-500">タグで絞込</label>
            <select
              name="tag"
              defaultValue={params.tag ?? ""}
              className="rounded border border-gray-300 px-3 py-2 text-sm"
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
            <label className="text-xs text-gray-500">教材で絞込</label>
            <select
              name="material_id"
              defaultValue={params.material_id ?? ""}
              className="rounded border border-gray-300 px-3 py-2 text-sm"
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
            <label className="text-xs text-gray-500">科目で絞込</label>
            <select
              name="subject"
              defaultValue={params.subject ?? ""}
              className="rounded border border-gray-300 px-3 py-2 text-sm"
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

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="unresolved"
            value="1"
            defaultChecked={params.unresolved === "1"}
          />
          未解決の単語のみ表示
        </label>

        <button
          type="submit"
          className="self-start rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
        >
          検索
        </button>
      </form>

      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-gray-700">
          検索結果（{results.length}件）
        </h2>
        {results.length === 0 && (
          <p className="text-sm text-gray-500">該当する単語がありません。</p>
        )}
        {results.map((w) => (
          <div key={w.id} className="rounded border border-gray-200 p-4">
            <div className="flex items-center gap-2">
              <span className="font-medium">{w.term}</span>
              <span className="rounded-full border border-gray-300 px-2 py-0.5 text-xs text-gray-500">
                {w.understanding_level}
              </span>
              {w.is_resolved && (
                <span className="rounded-full border border-gray-300 px-2 py-0.5 text-xs text-gray-500">
                  解決済み
                </span>
              )}
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
          </div>
        ))}
      </div>
    </div>
  );
}
