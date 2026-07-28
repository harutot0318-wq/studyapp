import Link from "next/link";
import { getActiveExam } from "@/lib/exams/active";
import { getTasks } from "@/lib/tasks/queries";
import { createTask, toggleTask, deleteTask } from "./actions";
import { Card } from "@/components/ui/card";
import { Badge, type BadgeVariant } from "@/components/ui/badge";

const PRIORITY_VARIANT: Record<string, BadgeVariant> = {
  高: "red",
  中: "amber",
  低: "gray",
};

const inputClass =
  "rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400";

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
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">タスク管理</h1>
        <p className="mt-1 text-sm text-gray-500">
          対象資格：{activeExam.name}
        </p>
      </div>

      <Card>
        <form
          action={createTask}
          className="flex flex-col gap-3 sm:flex-row sm:items-end"
        >
          <input type="hidden" name="exam_id" value={activeExam.id} />
          <div className="flex flex-1 flex-col gap-1">
            <label className="text-xs font-medium text-gray-500">
              タスク内容
            </label>
            <input
              name="title"
              required
              placeholder="例：過去問 第4章 演習"
              className={inputClass}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500">優先度</label>
            <select name="priority" defaultValue="中" className={inputClass}>
              <option value="高">高</option>
              <option value="中">中</option>
              <option value="低">低</option>
            </select>
          </div>
          <button
            type="submit"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
          >
            ＋ 追加
          </button>
        </form>
      </Card>

      <Card className="flex flex-col gap-1.5">
        {tasks.length === 0 && (
          <p className="text-sm text-gray-400">
            まだタスクがありません。上のフォームから追加してください。
          </p>
        )}
        {tasks.map((task) => (
          <div
            key={task.id}
            className="flex items-center justify-between rounded-lg px-2 py-2 hover:bg-gray-50"
          >
            <div className="flex items-center gap-3">
              <form action={toggleTask}>
                <input type="hidden" name="id" value={task.id} />
                <button
                  type="submit"
                  className={`h-5 w-5 rounded-md border-2 transition-colors ${
                    task.is_done
                      ? "border-indigo-600 bg-indigo-600"
                      : "border-gray-300 hover:border-indigo-400"
                  }`}
                  aria-label="完了/未完了を切替"
                />
              </form>
              <span
                className={`text-sm ${
                  task.is_done ? "text-gray-400 line-through" : "text-gray-800"
                }`}
              >
                {task.title}
              </span>
              <Badge variant={PRIORITY_VARIANT[task.priority]}>
                {task.priority}
              </Badge>
            </div>
            <form action={deleteTask}>
              <input type="hidden" name="id" value={task.id} />
              <button
                type="submit"
                className="text-xs text-rose-500 hover:underline"
              >
                削除
              </button>
            </form>
          </div>
        ))}
      </Card>
    </div>
  );
}
