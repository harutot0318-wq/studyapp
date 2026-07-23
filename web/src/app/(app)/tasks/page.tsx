import Link from "next/link";
import { getActiveExam } from "@/lib/exams/active";
import { getTasks } from "@/lib/tasks/queries";
import { createTask, toggleTask, deleteTask } from "./actions";

export default async function TasksPage() {
  const activeExam = await getActiveExam();

  if (!activeExam) {
    return (
      <div className="mx-auto max-w-2xl">
        <p className="text-sm text-gray-600">
          タスクを登録するには、まず資格を登録してください。
        </p>
        <Link href="/exams" className="mt-2 inline-block text-sm underline">
          資格管理へ
        </Link>
      </div>
    );
  }

  const tasks = await getTasks(activeExam.id);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8">
      <div>
        <h1 className="text-lg font-bold">タスク管理</h1>
        <p className="mt-1 text-sm text-gray-500">
          対象資格：{activeExam.name}
        </p>
      </div>

      <form
        action={createTask}
        className="flex flex-col gap-3 rounded border border-gray-200 p-4 sm:flex-row sm:items-end"
      >
        <input type="hidden" name="exam_id" value={activeExam.id} />
        <div className="flex flex-1 flex-col gap-1">
          <label className="text-xs text-gray-500">タスク内容</label>
          <input
            name="title"
            required
            placeholder="例：過去問 第4章 演習"
            className="rounded border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">優先度</label>
          <select
            name="priority"
            defaultValue="中"
            className="rounded border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="高">高</option>
            <option value="中">中</option>
            <option value="低">低</option>
          </select>
        </div>
        <button
          type="submit"
          className="rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
        >
          ＋ 追加
        </button>
      </form>

      <div className="flex flex-col gap-2">
        {tasks.length === 0 && (
          <p className="text-sm text-gray-500">
            まだタスクがありません。上のフォームから追加してください。
          </p>
        )}
        {tasks.map((task) => (
          <div
            key={task.id}
            className="flex items-center justify-between rounded border border-gray-200 p-3"
          >
            <div className="flex items-center gap-3">
              <form action={toggleTask}>
                <input type="hidden" name="id" value={task.id} />
                <button
                  type="submit"
                  className={`h-4 w-4 rounded border ${
                    task.is_done
                      ? "border-gray-900 bg-gray-900"
                      : "border-gray-400"
                  }`}
                  aria-label="完了/未完了を切替"
                />
              </form>
              <span
                className={`text-sm ${
                  task.is_done ? "text-gray-400 line-through" : ""
                }`}
              >
                {task.title}
              </span>
              <span className="rounded-full border border-gray-300 px-2 py-0.5 text-xs text-gray-500">
                優先度：{task.priority}
              </span>
            </div>
            <form action={deleteTask}>
              <input type="hidden" name="id" value={task.id} />
              <button type="submit" className="text-xs text-red-600 underline">
                削除
              </button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
