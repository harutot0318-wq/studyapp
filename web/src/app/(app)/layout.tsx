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
        <Link href="/exams" className="font-bold">
          資格勉強アプリ
        </Link>
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
