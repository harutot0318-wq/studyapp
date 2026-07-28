import Link from "next/link";
import { getActiveExam } from "@/lib/exams/active";
import { getWords } from "@/lib/words/queries";
import { getMaterials } from "@/lib/materials/queries";
import { getReviews } from "@/lib/reviews/queries";
import { toDateStr } from "@/lib/dates";
import {
  createWordReview,
  createMaterialReview,
  completeReview,
  deleteReview,
} from "./actions";

const LEVELS = ["未理解", "うろ覚え", "理解済み"] as const;

export default async function ReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const showDone = tab === "done";

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

  const [words, materials, reviews] = await Promise.all([
    getWords({ examId: activeExam.id }),
    getMaterials(activeExam.id),
    getReviews({ examId: activeExam.id }),
  ]);

  const filtered = reviews.filter((r) =>
    showDone ? r.status === "実施済み" : r.status === "未実施",
  );
  const today = toDateStr(new Date());

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8">
      <div>
        <h1 className="text-lg font-bold">復習管理</h1>
        <p className="mt-1 text-sm text-gray-500">
          対象資格：{activeExam.name}
        </p>
      </div>

      <div className="flex gap-2 border-b border-gray-200">
        <Link
          href={{ pathname: "/review", query: {} }}
          className={`px-3 py-2 text-sm ${
            !showDone ? "border-b-2 border-gray-900 font-semibold" : "text-gray-500"
          }`}
        >
          未実施
        </Link>
        <Link
          href={{ pathname: "/review", query: { tab: "done" } }}
          className={`px-3 py-2 text-sm ${
            showDone ? "border-b-2 border-gray-900 font-semibold" : "text-gray-500"
          }`}
        >
          実施済み
        </Link>
      </div>

      {!showDone && (
        <div className="grid gap-4 sm:grid-cols-2">
          <form
            action={createWordReview}
            className="flex flex-col gap-2 rounded border border-gray-200 p-4"
          >
            <h2 className="text-sm font-semibold text-gray-700">
              単語の復習を予定
            </h2>
            {words.length === 0 ? (
              <p className="text-xs text-gray-500">
                対象になる単語がありません。
              </p>
            ) : (
              <>
                <select
                  name="word_id"
                  required
                  className="rounded border border-gray-300 px-3 py-2 text-sm"
                >
                  {words.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.term}
                    </option>
                  ))}
                </select>
                <input
                  type="date"
                  name="scheduled_date"
                  required
                  defaultValue={today}
                  className="rounded border border-gray-300 px-3 py-2 text-sm"
                />
                <button
                  type="submit"
                  className="self-start rounded border border-gray-300 px-3 py-1.5 text-xs hover:bg-gray-50"
                >
                  ＋ 追加
                </button>
              </>
            )}
          </form>

          <form
            action={createMaterialReview}
            className="flex flex-col gap-2 rounded border border-gray-200 p-4"
          >
            <h2 className="text-sm font-semibold text-gray-700">
              教材の復習を予定
            </h2>
            {materials.length === 0 ? (
              <p className="text-xs text-gray-500">
                対象になる教材がありません。
              </p>
            ) : (
              <>
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
                <input
                  type="date"
                  name="scheduled_date"
                  required
                  defaultValue={today}
                  className="rounded border border-gray-300 px-3 py-2 text-sm"
                />
                <button
                  type="submit"
                  className="self-start rounded border border-gray-300 px-3 py-1.5 text-xs hover:bg-gray-50"
                >
                  ＋ 追加
                </button>
              </>
            )}
          </form>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {filtered.length === 0 && (
          <p className="text-sm text-gray-500">
            {showDone ? "実施済みの復習はありません。" : "予定されている復習はありません。"}
          </p>
        )}
        {filtered.map((r) => (
          <div key={r.id} className="rounded border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="rounded-full border border-gray-300 px-2 py-0.5 text-xs text-gray-500">
                  {r.targetType === "word" ? "単語帳" : "教材"}
                </span>
                <span className="font-medium">{r.targetLabel}</span>
                <span className="text-xs text-gray-500">
                  予定日：{r.scheduled_date}
                </span>
              </div>
              <form action={deleteReview}>
                <input type="hidden" name="id" value={r.id} />
                <button type="submit" className="text-xs text-red-600 underline">
                  削除
                </button>
              </form>
            </div>

            {!showDone && (
              <form
                action={completeReview}
                className="mt-3 flex flex-wrap items-end gap-2"
              >
                <input type="hidden" name="id" value={r.id} />
                <input type="hidden" name="target_type" value={r.targetType} />
                {r.wordId && (
                  <input type="hidden" name="word_id" value={r.wordId} />
                )}
                {r.materialId && (
                  <input type="hidden" name="material_id" value={r.materialId} />
                )}

                {r.targetType === "word" && (
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-500">理解度を更新</label>
                    <select
                      name="next_understanding_level"
                      defaultValue={r.currentUnderstanding ?? "未理解"}
                      className="rounded border border-gray-300 px-2 py-1 text-xs"
                    >
                      {LEVELS.map((l) => (
                        <option key={l} value={l}>
                          {l}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-500">
                    次回復習予定日（任意）
                  </label>
                  <input
                    type="date"
                    name="next_scheduled_date"
                    className="rounded border border-gray-300 px-2 py-1 text-xs"
                  />
                </div>

                <button
                  type="submit"
                  className="rounded bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-700"
                >
                  実施済みにする
                </button>
              </form>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
