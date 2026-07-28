import Link from "next/link";
import { getActiveExam } from "@/lib/exams/active";
import { getMaterials } from "@/lib/materials/queries";
import { getWords } from "@/lib/words/queries";
import {
  createWord,
  updateUnderstanding,
  toggleResolved,
  deleteWord,
} from "./actions";

const LEVELS = ["未理解", "うろ覚え", "理解済み"] as const;

export default async function WordsPage({
  searchParams,
}: {
  searchParams: Promise<{ scope?: string }>;
}) {
  const { scope } = await searchParams;
  const showAll = scope === "all";

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

  const materials = await getMaterials(activeExam.id);
  const words = await getWords(showAll ? undefined : { examId: activeExam.id });

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8">
      <div>
        <h1 className="text-lg font-bold">わからなかった単語帳</h1>
        <p className="mt-1 text-sm text-gray-500">
          新規登録は対象資格「{activeExam.name}」に対して行われます。
        </p>
      </div>

      <div className="flex gap-2 border-b border-gray-200">
        <Link
          href="/words"
          className={`px-3 py-2 text-sm ${
            !showAll ? "border-b-2 border-gray-900 font-semibold" : "text-gray-500"
          }`}
        >
          対象資格のみ
        </Link>
        <Link
          href="/words?scope=all"
          className={`px-3 py-2 text-sm ${
            showAll ? "border-b-2 border-gray-900 font-semibold" : "text-gray-500"
          }`}
        >
          すべての資格
        </Link>
      </div>

      {materials.length === 0 ? (
        <p className="text-sm text-gray-500">
          単語を登録するには、先に教材を追加してください。{" "}
          <Link href="/materials" className="underline">
            教材管理へ
          </Link>
        </p>
      ) : (
        <form
          action={createWord}
          className="flex flex-col gap-3 rounded border border-gray-200 p-4"
        >
          <div className="flex gap-3">
            <div className="flex flex-1 flex-col gap-1">
              <label className="text-xs text-gray-500">単語</label>
              <input
                name="term"
                required
                placeholder="例：繰延税金資産"
                className="rounded border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <div className="flex flex-1 flex-col gap-1">
              <label className="text-xs text-gray-500">教材</label>
              <select
                name="material_id"
                required
                className="rounded border border-gray-300 px-3 py-2 text-sm"
              >
                {materials.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">意味・解説・メモ</label>
            <textarea
              name="meaning"
              rows={2}
              className="rounded border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="flex gap-3">
            <div className="flex flex-1 flex-col gap-1">
              <label className="text-xs text-gray-500">
                タグ（カンマ区切り・任意）
              </label>
              <input
                name="tags"
                placeholder="例：税効果会計, 仕訳"
                className="rounded border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <div className="flex w-32 flex-col gap-1">
              <label className="text-xs text-gray-500">理解度</label>
              <select
                name="understanding_level"
                defaultValue="未理解"
                className="rounded border border-gray-300 px-3 py-2 text-sm"
              >
                {LEVELS.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button
            type="submit"
            className="self-start rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
          >
            ＋ 単語を追加
          </button>
        </form>
      )}

      <div className="flex flex-col gap-3">
        {words.length === 0 && (
          <p className="text-sm text-gray-500">まだ単語が登録されていません。</p>
        )}
        {words.map((w) => (
          <div key={w.id} className="rounded border border-gray-200 p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{w.term}</span>
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
                  教材：{w.material?.name}
                  {showAll && w.exam && `　資格：${w.exam.name}`}
                </p>
              </div>
              <form action={deleteWord}>
                <input type="hidden" name="id" value={w.id} />
                <button type="submit" className="text-xs text-red-600 underline">
                  削除
                </button>
              </form>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-3">
              <form action={updateUnderstanding} className="flex items-center gap-2">
                <input type="hidden" name="id" value={w.id} />
                <select
                  name="understanding_level"
                  defaultValue={w.understanding_level}
                  className="rounded border border-gray-300 px-2 py-1 text-xs"
                >
                  {LEVELS.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="rounded border border-gray-300 px-2 py-1 text-xs hover:bg-gray-50"
                >
                  更新
                </button>
              </form>

              <form action={toggleResolved}>
                <input type="hidden" name="id" value={w.id} />
                <button
                  type="submit"
                  className="rounded border border-gray-300 px-2 py-1 text-xs hover:bg-gray-50"
                >
                  {w.is_resolved ? "未解決に戻す" : "解決済みにする"}
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
