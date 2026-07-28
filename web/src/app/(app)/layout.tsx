import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/auth/actions";
import { NavSidebar } from "@/components/nav-sidebar";

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
    <div className="flex min-h-screen bg-gray-50">
      <aside className="flex w-60 flex-shrink-0 flex-col border-r border-gray-100 bg-white">
        <Link href="/" className="px-5 py-6 text-lg font-bold text-gray-900">
          資格勉強アプリ
        </Link>
        <NavSidebar />
        <div className="mt-auto border-t border-gray-100 px-5 py-4">
          <p className="mb-2 truncate text-xs text-gray-500">{user.email}</p>
          <form action={signOut}>
            <button
              type="submit"
              className="text-xs font-medium text-gray-500 hover:text-gray-800"
            >
              ログアウト
            </button>
          </form>
        </div>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
