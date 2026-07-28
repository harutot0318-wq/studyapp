import { cookies } from "next/headers";
import { getExams } from "@/lib/exams/queries";
import { daysUntil } from "@/lib/dates";
import { createExam, deleteExam, setActiveExam } from "./actions";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function ExamsPage() {
  const exams = await getExams();
  const cookieStore = await cookies();
  const cookieExamId = cookieStore.get("active_exam_id")?.value;
  // Cookieが指す資格が削除済みなら、先頭の資格にフォールバックする
  const activeExamId = exams.some((e) => e.id === cookieExamId)
    ? cookieExamId
    : exams[0]?.id;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">資格管理</h1>
        <p className="mt-1 text-sm text-gray-500">
          ここで登録した資格が、対象資格の切替に表示されます。
        </p>
      </div>

      <Card>
        <form action={createExam} className="flex flex-wrap items-end gap-3">
          <div className="flex flex-1 flex-col gap-1">
            <label className="text-xs font-medium text-gray-500">資格名</label>
            <input
              name="name"
              required
              placeholder="例：日商簿記1級"
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500">
              試験日（任意）
            </label>
            <input
              type="date"
              name="exam_date"
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
          >
            ＋ 資格を追加
          </button>
        </form>
      </Card>

      <Card className="p-0">
        <div className="px-5 pt-5 text-sm font-bold text-gray-800">
          登録済みの資格（複数並行管理・切替可能）
        </div>
        {exams.length === 0 ? (
          <p className="px-5 py-6 text-sm text-gray-400">
            まだ資格が登録されていません。上のフォームから追加してください。
          </p>
        ) : (
          <table className="mt-3 w-full text-sm">
            <thead>
              <tr className="border-t border-gray-100 text-left text-xs font-semibold text-gray-500">
                <th className="px-5 py-2">資格名</th>
                <th className="px-5 py-2">試験日</th>
                <th className="px-5 py-2">残り日数</th>
                <th className="px-5 py-2">状態</th>
                <th className="px-5 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {exams.map((exam) => {
                const isActive = exam.id === activeExamId;
                return (
                  <tr key={exam.id} className="border-t border-gray-100">
                    <td className="px-5 py-3 font-semibold text-gray-900">
                      {exam.name}
                    </td>
                    <td className="px-5 py-3 text-gray-600">
                      {exam.exam_date ?? "未設定"}
                    </td>
                    <td className="px-5 py-3 text-gray-600">
                      {daysUntil(exam.exam_date)}
                    </td>
                    <td className="px-5 py-3">
                      {isActive ? (
                        <Badge variant="indigo">対象資格（切替中）</Badge>
                      ) : (
                        <form action={setActiveExam}>
                          <input type="hidden" name="id" value={exam.id} />
                          <button
                            type="submit"
                            className="text-xs font-semibold text-indigo-600 hover:underline"
                          >
                            この資格に切替 →
                          </button>
                        </form>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <form action={deleteExam}>
                        <input type="hidden" name="id" value={exam.id} />
                        <button
                          type="submit"
                          className="text-xs text-rose-500 hover:underline"
                        >
                          削除
                        </button>
                      </form>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        <div className="h-2" />
      </Card>
    </div>
  );
}
