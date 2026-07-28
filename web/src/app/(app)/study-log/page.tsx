import Link from "next/link";
import { getActiveExam } from "@/lib/exams/active";
import { getSubjects } from "@/lib/subjects/queries";
import { getMaterials } from "@/lib/materials/queries";
import { getRecentStudyLogs } from "@/lib/study-logs/queries";
import { toDateStr } from "@/lib/dates";
import { createSubject, createStudyLog } from "./actions";
import { Card } from "@/components/ui/card";

const inputClass =
  "rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400";
const labelClass = "text-xs font-medium text-gray-500";

export default async function StudyLogPage() {
  const activeExam = await getActiveExam();

  if (!activeExam) {
    return (
      <div className="mx-auto max-w-2xl">
        <p className="text-sm text-gray-600">
          学習記録をつけるには、まず資格を登録してください。
        </p>
        <Link href="/exams" className="mt-2 inline-block text-sm underline">
          資格管理へ
        </Link>
      </div>
    );
  }

  const [subjects, materials, studyLogs] = await Promise.all([
    getSubjects(activeExam.id),
    getMaterials(activeExam.id),
    getRecentStudyLogs(activeExam.id),
  ]);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">学習記録</h1>
        <p className="mt-1 text-sm text-gray-500">
          対象資格：{activeExam.name}
        </p>
      </div>

      <Card>
        <h2 className="mb-3 text-sm font-bold text-gray-800">科目</h2>
        {subjects.length > 0 && (
          <ul className="mb-3 flex flex-wrap gap-2">
            {subjects.map((s) => (
              <li
                key={s.id}
                className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700"
              >
                {s.name}
              </li>
            ))}
          </ul>
        )}
        <form action={createSubject} className="flex gap-2">
          <input type="hidden" name="exam_id" value={activeExam.id} />
          <input
            name="name"
            required
            placeholder="例：簿記論"
            className={`flex-1 ${inputClass}`}
          />
          <button
            type="submit"
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            ＋ 科目を追加
          </button>
        </form>
      </Card>

      {subjects.length === 0 ? (
        <p className="text-sm text-gray-500">
          学習記録をつけるには、先に科目を1つ追加してください。
        </p>
      ) : (
        <Card>
          <h2 className="mb-3 text-sm font-bold text-gray-800">新規記録</h2>
          <form action={createStudyLog} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className={labelClass}>科目</label>
              <select name="subject_id" required className={inputClass}>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            {materials.length > 0 && (
              <div className="flex flex-col gap-1">
                <label className={labelClass}>教材（任意）</label>
                <select
                  name="material_id"
                  defaultValue=""
                  className={inputClass}
                >
                  <option value="">選択しない</option>
                  {materials.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="flex gap-3">
              <div className="flex flex-1 flex-col gap-1">
                <label className={labelClass}>学習日</label>
                <input
                  type="date"
                  name="study_date"
                  required
                  defaultValue={toDateStr(new Date())}
                  className={inputClass}
                />
              </div>
              <div className="flex flex-1 flex-col gap-1">
                <label className={labelClass}>学習時間（分）</label>
                <input
                  type="number"
                  name="duration_minutes"
                  required
                  min={1}
                  placeholder="例：60"
                  className={inputClass}
                />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelClass}>メモ（任意）</label>
              <textarea name="memo" rows={2} className={inputClass} />
            </div>
            <button
              type="submit"
              className="self-start rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
            >
              記録する
            </button>
          </form>
        </Card>
      )}

      <Card className="p-0">
        <div className="px-5 pt-5 text-sm font-bold text-gray-800">
          最近の学習記録
        </div>
        {studyLogs.length === 0 ? (
          <p className="px-5 py-6 text-sm text-gray-400">
            まだ記録がありません。
          </p>
        ) : (
          <table className="mt-3 w-full text-sm">
            <thead>
              <tr className="border-t border-gray-100 text-left text-xs font-semibold text-gray-500">
                <th className="px-5 py-2">日付</th>
                <th className="px-5 py-2">科目</th>
                <th className="px-5 py-2">教材</th>
                <th className="px-5 py-2">時間</th>
                <th className="px-5 py-2">メモ</th>
              </tr>
            </thead>
            <tbody>
              {studyLogs.map((log) => (
                <tr key={log.id} className="border-t border-gray-100">
                  <td className="px-5 py-3 text-gray-600">
                    {log.study_date}
                  </td>
                  <td className="px-5 py-3 font-semibold text-gray-900">
                    {log.subject?.name}
                  </td>
                  <td className="px-5 py-3 text-gray-600">
                    {log.material?.name ?? "―"}
                  </td>
                  <td className="px-5 py-3 font-semibold text-gray-900">
                    {log.duration_minutes / 60 >= 1
                      ? `${(log.duration_minutes / 60).toFixed(1)}h`
                      : `${log.duration_minutes}分`}
                  </td>
                  <td className="max-w-[220px] truncate px-5 py-3 text-gray-500">
                    {log.memo}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div className="h-2" />
      </Card>
    </div>
  );
}
