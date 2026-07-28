export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const { reason } = await searchParams;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-2 p-8 text-center">
      <h1 className="text-xl font-bold">ログインに失敗しました</h1>
      <p className="text-sm text-gray-500">
        時間をおいて再度お試しください。問題が続く場合は設定を見直してください。
      </p>
      {reason && (
        <p className="mt-2 rounded bg-gray-100 px-3 py-2 text-xs text-gray-600">
          詳細: {reason}
        </p>
      )}
    </main>
  );
}
