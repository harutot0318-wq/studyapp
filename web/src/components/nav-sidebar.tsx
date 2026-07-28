"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/exams", label: "資格管理", icon: "🎓" },
  { href: "/", label: "ダッシュボード", icon: "🏠" },
  { href: "/study-log", label: "学習記録", icon: "📝" },
  { href: "/tasks", label: "タスク管理", icon: "✅" },
  { href: "/materials", label: "教材管理", icon: "📚" },
  { href: "/words", label: "単語帳", icon: "🗂️" },
  { href: "/word-search", label: "単語検索", icon: "🔍" },
  { href: "/review", label: "復習管理", icon: "🔄" },
  { href: "/goals", label: "目標管理", icon: "🎯" },
  { href: "/analysis", label: "学習分析", icon: "📊" },
];

export function NavSidebar() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1 px-3">
      {NAV_ITEMS.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-colors ${
              active
                ? "bg-indigo-50 font-bold text-indigo-800"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
