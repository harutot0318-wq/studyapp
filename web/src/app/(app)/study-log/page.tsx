import Link from "next/link";
import { getActiveExam } from "@/lib/exams/active";
import { getSubjects } from "@/lib/subjects/queries";
import { getMaterials } from "@/lib/materials/queries";
import { getRecentStudyLogs } from "@/lib/study-logs/queries";
import { toDateStr } from "@/lib/dates";
import { createSubject, createStudyLog } from "./actions";

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
    <div className="mx-auto flex max-w-2xl flex-col gap-8">
      <div>
        <h1 className="text-lg font-bold">学習記録</h1>
        <p className="mt-1 text-sm text-gray-500">
          対象資格：{activeExam.name}
        </p>
      </div>

      {/* 科目のクイック登録 */}
      <div className="rounded border border-gray-200 p-4">
        <h2 className="mb-2 text-sm font-semibold text-gray-700">科目</h2>
        {subjects.length > 0 && (
          <ul className="mb-3 flex flex-wrap gap-2">
            {subjects.map((s) => (
              <li
                key={s.id}
                className="rounded-full border border-gray-300 px-3 py-1 text-xs"
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
            className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="rounded border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50"
          >
            ＋ 科目を追加
          </button>
        </form>
      </div>

      {/* 学習記録フォーム */}
      {subjects.length === 0 ? (
        <p className="text-sm text-gray-500">
          学習記録をつけるには、先に科目を1つ追加してください。
        </p>
      ) : (
        <form
          action={createStudyLog}
          className="flex flex-col gap-3 rounded border border-gray-200 p-4"
        >
          <div className="flex flex-col gap-1">
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
          {materials.length > 0 && (
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500">教材（任意）</label>
              <select
                name="material_id"
                defaultValue=""
                className="rounded border border-gray-300 px-3 py-2 text-sm"
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
              <label className="text-xs text-gray-500">学習日</label>
              <input
                type="date"
                name="study_date"
                required
                defaultValue={toDateStr(new Date())}
                className="rounded border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <div className="flex flex-1 flex-col gap-1">
              <label className="text-xs text-gray-500">学習時間（分）</label>
              <input
                type="number"
                name="duration_minutes"
                required
                min={1}
                placeholder="例：60"
                className="rounded border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">メモ（任意）</label>
            <textarea
              name="memo"
              rows={2}
              className="rounded border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <button
            type="submit"
            className="self-start rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
          >
            記録する
          </button>
        </form>
      )}

      {/* 最近の学習記録 */}
      <div className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-gray-700">
          最近の学習記録
        </h2>
        {studyLogs.length === 0 && (
          <p className="text-sm text-gray-500">まだ記録がありません。</p>
        )}
        {studyLogs.map((log) => (
          <div
            key={log.id}
            className="rounded border border-gray-200 p-3 text-sm"
          >
            <div className="flex justify-between">
              <span>
                {log.study_date}　{log.subject?.name}
                {log.material?.name && `（${log.material.name}）`}
              </span>
              <span>{log.duration_minutes}分</span>
            </div>
            {log.memo && (
              <p className="mt-1 text-xs text-gray-500">{log.memo}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
