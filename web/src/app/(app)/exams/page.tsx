import { cookies } from "next/headers";
import { getExams } from "@/lib/exams/queries";
import { createExam, deleteExam, setActiveExam } from "./actions";

function daysUntil(dateStr: string | null): string {
  if (!dateStr) return "未設定";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  const diffMs = target.getTime() - today.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return "試験日を過ぎています";
  return `残り${diffDays}日`;
}

export default async function ExamsPage() {
  const exams = await getExams();
  const cookieStore = await cookies();
  const cookieExamId = cookieStore.get("active_exam_id")?.value;
  // Cookieが指す資格が削除済みなら、先頭の資格にフォールバックする
  const activeExamId = exams.some((e) => e.id === cookieExamId)
    ? cookieExamId
    : exams[0]?.id;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8">
      <div>
        <h1 className="text-lg font-bold">資格管理</h1>
        <p className="mt-1 text-sm text-gray-500">
          ここで登録した資格を切り替えながら、科目・教材・単語帳などを管理します。
        </p>
      </div>

      <form
        action={createExam}
        className="flex flex-col gap-3 rounded border border-gray-200 p-4"
      >
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">資格名</label>
          <input
            name="name"
            required
            placeholder="例：日商簿記1級"
            className="rounded border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">試験日（任意）</label>
          <input
            type="date"
            name="exam_date"
            className="rounded border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <button
          type="submit"
          className="self-start rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
        >
          ＋ 資格を追加
        </button>
      </form>

      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-gray-700">
          登録済みの資格
        </h2>
        {exams.length === 0 && (
          <p className="text-sm text-gray-500">
            まだ資格が登録されていません。上のフォームから追加してください。
          </p>
        )}
        {exams.map((exam) => {
          const isActive = exam.id === activeExamId;
          return (
            <div
              key={exam.id}
              className={`flex items-center justify-between rounded border p-3 ${
                isActive ? "border-gray-900" : "border-gray-200"
              }`}
            >
              <div>
                <div className="font-medium">{exam.name}</div>
                <div className="text-xs text-gray-500">
                  {exam.exam_date ?? "試験日未設定"}・{daysUntil(exam.exam_date)}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isActive ? (
                  <span className="rounded-full bg-gray-900 px-3 py-1 text-xs text-white">
                    対象資格（切替中）
                  </span>
                ) : (
                  <form action={setActiveExam}>
                    <input type="hidden" name="id" value={exam.id} />
                    <button type="submit" className="text-xs underline">
                      この資格に切替
                    </button>
                  </form>
                )}
                <form action={deleteExam}>
                  <input type="hidden" name="id" value={exam.id} />
                  <button
                    type="submit"
                    className="text-xs text-red-600 underline"
                  >
                    削除
                  </button>
                </form>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
