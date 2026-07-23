import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/auth/actions";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-xl font-bold">資格勉強アプリ</h1>

      {user ? (
        <div className="flex flex-col items-center gap-3">
          <p className="text-sm text-gray-600">
            ログイン中：{user.email}
          </p>
          <Link
            href="/exams"
            className="rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
          >
            資格管理へ
          </Link>
          <form action={signOut}>
            <button
              type="submit"
              className="rounded border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50"
            >
              ログアウト
            </button>
          </form>
        </div>
      ) : (
        <Link
          href="/login"
          className="rounded border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50"
        >
          ログインへ
        </Link>
      )}
    </main>
  );
}
