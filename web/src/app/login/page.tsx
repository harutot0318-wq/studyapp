import { signInWithGoogle } from "@/app/auth/actions";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-xl font-bold">資格勉強アプリ ログイン</h1>
      <form action={signInWithGoogle}>
        <button
          type="submit"
          className="rounded border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50"
        >
          Googleでログイン
        </button>
      </form>
    </main>
  );
}
