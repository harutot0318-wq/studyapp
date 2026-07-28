import { signInWithGoogle } from "@/app/auth/actions";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gray-50 p-8">
      <div className="flex flex-col items-center gap-2">
        <span className="text-3xl">🎓</span>
        <h1 className="text-xl font-bold text-gray-900">資格勉強アプリ</h1>
        <p className="text-sm text-gray-500">学習を記録・分析して合格へ</p>
      </div>
      <form action={signInWithGoogle}>
        <button
          type="submit"
          className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
        >
          Googleでログイン
        </button>
      </form>
    </main>
  );
}
