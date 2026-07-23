// ローカルタイムゾーンの暦日（年月日）をそのまま "YYYY-MM-DD" にする。
// toISOString() はUTCに変換するため、日本時間などUTC以外のタイムゾーンでは
// 日付がずれることがある（例: JST 7/23 0:00 → UTC 7/22 15:00）ので使わない。
export function toDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function daysUntil(dateStr: string | null): string {
  if (!dateStr) return "未設定";
  const [y, m, d] = dateStr.split("-").map(Number);
  const target = new Date(y, m - 1, d);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.round(
    (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (diffDays < 0) return "試験日を過ぎています";
  return `残り${diffDays}日`;
}
