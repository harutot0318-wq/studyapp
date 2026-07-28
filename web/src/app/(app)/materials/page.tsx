import Link from "next/link";
import { getActiveExam } from "@/lib/exams/active";
import { getSubjects } from "@/lib/subjects/queries";
import { getMaterials } from "@/lib/materials/queries";
import { createMaterial, updateMaterialProgress, deleteMaterial } from "./actions";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";

const MATERIAL_TYPES = ["参考書", "問題集", "動画", "その他"] as const;

const inputClass =
  "rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400";
const labelClass = "text-xs font-medium text-gray-500";

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
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">教材管理</h1>
        <p className="mt-1 text-sm text-gray-500">
          対象資格：{activeExam.name}
        </p>
      </div>

      <Card>
        <h2 className="mb-3 text-sm font-bold text-gray-800">教材を追加</h2>
        <form action={createMaterial} className="flex flex-col gap-3">
          <div className="flex gap-3">
            <div className="flex flex-1 flex-col gap-1">
              <label className={labelClass}>科目</label>
              <select name="subject_id" required className={inputClass}>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-1 flex-col gap-1">
              <label className={labelClass}>教材種別</label>
              <select name="material_type" required className={inputClass}>
                {MATERIAL_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelClass}>教材名</label>
            <input
              name="name"
              required
              placeholder="例：総合問題集"
              className={inputClass}
            />
          </div>
          <div className="flex gap-3">
            <div className="flex flex-1 flex-col gap-1">
              <label className={labelClass}>進捗（任意・自由記述）</label>
              <input
                name="progress_note"
                placeholder="例：第7章まで完了"
                className={inputClass}
              />
            </div>
            <div className="flex w-32 flex-col gap-1">
              <label className={labelClass}>進捗率（%）</label>
              <input
                type="number"
                name="progress_percent"
                min={0}
                max={100}
                className={inputClass}
              />
            </div>
          </div>
          <button
            type="submit"
            className="self-start rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
          >
            ＋ 教材を追加
          </button>
        </form>
      </Card>

      <div className="flex flex-col gap-4">
        {materials.length === 0 && (
          <p className="text-sm text-gray-500">
            まだ教材が登録されていません。
          </p>
        )}
        {materials.map((m) => (
          <Card key={m.id}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-900">{m.name}</span>
                <Badge variant="blue">{m.material_type}</Badge>
                <Badge variant="gray">{m.subject?.name}</Badge>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-gray-500">
                  累計 {formatHours(m.totalMinutes)}
                </span>
                <form action={deleteMaterial}>
                  <input type="hidden" name="id" value={m.id} />
                  <button
                    type="submit"
                    className="text-xs text-rose-500 hover:underline"
                  >
                    削除
                  </button>
                </form>
              </div>
            </div>

            {m.progress_percent != null && (
              <div className="mt-3 flex items-center gap-3">
                <div className="flex-1">
                  <ProgressBar percent={m.progress_percent} />
                </div>
                <span className="text-xs font-semibold text-gray-500">
                  {m.progress_percent}%
                </span>
              </div>
            )}

            <form
              action={updateMaterialProgress}
              className="mt-4 flex items-end gap-2 border-t border-gray-100 pt-3"
            >
              <input type="hidden" name="id" value={m.id} />
              <div className="flex flex-1 flex-col gap-1">
                <label className={labelClass}>進捗</label>
                <input
                  name="progress_note"
                  defaultValue={m.progress_note ?? ""}
                  className={`${inputClass} py-1.5`}
                />
              </div>
              <div className="flex w-24 flex-col gap-1">
                <label className={labelClass}>進捗率（%）</label>
                <input
                  type="number"
                  name="progress_percent"
                  min={0}
                  max={100}
                  defaultValue={m.progress_percent ?? ""}
                  className={`${inputClass} py-1.5`}
                />
              </div>
              <button
                type="submit"
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                更新
              </button>
            </form>
          </Card>
        ))}
      </div>
    </div>
  );
}
