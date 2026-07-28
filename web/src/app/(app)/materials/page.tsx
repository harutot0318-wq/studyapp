import Link from "next/link";
import { getActiveExam } from "@/lib/exams/active";
import { getSubjects } from "@/lib/subjects/queries";
import { getMaterials } from "@/lib/materials/queries";
import { createMaterial, updateMaterialProgress, deleteMaterial } from "./actions";

const MATERIAL_TYPES = ["参考書", "問題集", "動画", "その他"] as const;

function formatHours(minutes: number): string {
  return `${(minutes / 60).toFixed(1)}h`;
}

export default async function MaterialsPage() {
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

  const subjects = await getSubjects(activeExam.id);

  if (subjects.length === 0) {
    return (
      <div className="mx-auto max-w-2xl">
        <p className="text-sm text-gray-600">
          教材を登録するには、先に科目を1つ追加してください。
        </p>
        <Link href="/study-log" className="mt-2 inline-block text-sm underline">
          学習記録へ（科目の追加はこちら）
        </Link>
      </div>
    );
  }

  const materials = await getMaterials(activeExam.id);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8">
      <div>
        <h1 className="text-lg font-bold">教材管理</h1>
        <p className="mt-1 text-sm text-gray-500">
          対象資格：{activeExam.name}
        </p>
      </div>

      <form
        action={createMaterial}
        className="flex flex-col gap-3 rounded border border-gray-200 p-4"
      >
        <div className="flex gap-3">
          <div className="flex flex-1 flex-col gap-1">
            <label className="text-xs text-gray-500">科目</label>
            <select
              name="subject_id"
              required
              className="rounded border border-gray-300 px-3 py-2 text-sm"
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-1 flex-col gap-1">
            <label className="text-xs text-gray-500">教材種別</label>
            <select
              name="material_type"
              required
              className="rounded border border-gray-300 px-3 py-2 text-sm"
            >
              {MATERIAL_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">教材名</label>
          <input
            name="name"
            required
            placeholder="例：総合問題集"
            className="rounded border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div className="flex gap-3">
          <div className="flex flex-1 flex-col gap-1">
            <label className="text-xs text-gray-500">進捗（任意・自由記述）</label>
            <input
              name="progress_note"
              placeholder="例：第7章まで完了"
              className="rounded border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="flex w-32 flex-col gap-1">
            <label className="text-xs text-gray-500">進捗率（%）</label>
            <input
              type="number"
              name="progress_percent"
              min={0}
              max={100}
              className="rounded border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
        </div>
        <button
          type="submit"
          className="self-start rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
        >
          ＋ 教材を追加
        </button>
      </form>

      <div className="flex flex-col gap-3">
        {materials.length === 0 && (
          <p className="text-sm text-gray-500">
            まだ教材が登録されていません。
          </p>
        )}
        {materials.map((m) => (
          <div key={m.id} className="rounded border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-medium">{m.name}</span>
                <span className="rounded-full border border-gray-300 px-2 py-0.5 text-xs text-gray-500">
                  {m.material_type}
                </span>
                <span className="rounded-full border border-gray-300 px-2 py-0.5 text-xs text-gray-500">
                  {m.subject?.name}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500">
                  累計学習時間：{formatHours(m.totalMinutes)}
                </span>
                <form action={deleteMaterial}>
                  <input type="hidden" name="id" value={m.id} />
                  <button
                    type="submit"
                    className="text-xs text-red-600 underline"
                  >
                    削除
                  </button>
                </form>
              </div>
            </div>

            {m.progress_percent != null && (
              <div className="mt-3 h-2 w-full rounded bg-gray-200">
                <div
                  className="h-2 rounded bg-gray-900"
                  style={{ width: `${Math.min(100, Math.max(0, m.progress_percent))}%` }}
                />
              </div>
            )}

            <form
              action={updateMaterialProgress}
              className="mt-3 flex items-end gap-2"
            >
              <input type="hidden" name="id" value={m.id} />
              <div className="flex flex-1 flex-col gap-1">
                <label className="text-xs text-gray-500">進捗</label>
                <input
                  name="progress_note"
                  defaultValue={m.progress_note ?? ""}
                  className="rounded border border-gray-300 px-3 py-1.5 text-sm"
                />
              </div>
              <div className="flex w-24 flex-col gap-1">
                <label className="text-xs text-gray-500">進捗率（%）</label>
                <input
                  type="number"
                  name="progress_percent"
                  min={0}
                  max={100}
                  defaultValue={m.progress_percent ?? ""}
                  className="rounded border border-gray-300 px-3 py-1.5 text-sm"
                />
              </div>
              <button
                type="submit"
                className="rounded border border-gray-300 px-3 py-1.5 text-xs hover:bg-gray-50"
              >
                更新
              </button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
