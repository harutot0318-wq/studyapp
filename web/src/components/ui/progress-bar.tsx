export function ProgressBar({ percent }: { percent: number }) {
  const clamped = Math.min(100, Math.max(0, percent));
  const color = clamped >= 100 ? "bg-emerald-500" : "bg-indigo-500";
  return (
    <div className="h-2 w-full rounded-full bg-gray-100">
      <div
        className={`h-2 rounded-full ${color} transition-all`}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
