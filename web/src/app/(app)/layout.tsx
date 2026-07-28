import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/auth/actions";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between border-b border-gray-200 px-6 py-3">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-bold">
            資格勉強アプリ
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/" className="hover:underline">
              ダッシュボード
            </Link>
            <Link href="/exams" className="hover:underline">
              資格管理
            </Link>
            <Link href="/study-log" className="hover:underline">
              学習記録
            </Link>
            <Link href="/tasks" className="hover:underline">
              タスク管理
            </Link>
            <Link href="/materials" className="hover:underline">
              教材管理
            </Link>
            <Link href="/words" className="hover:underline">
              単語帳
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <span>{user.email}</span>
          <form action={signOut}>
            <button type="submit" className="hover:underline">
              ログアウト
            </button>
          </form>
        </div>
      </header>
      <main className="p-6">{children}</main>
    </div>
  );
}
