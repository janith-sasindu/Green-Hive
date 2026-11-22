import { useState, useEffect } from "react";
import { Moon, Sun, LogOut } from "lucide-react";

interface HeaderProps {
  title?: string;
  onLogout?: () => void;
}

export default function Header({ title = 'Admin Dashboard', onLogout }: HeaderProps) {
  // Check if dark mode is already active
  const [isDark, setIsDark] = useState<boolean>(() => {
    return localStorage.getItem('theme') === 'dark' ||
      document.documentElement.classList.contains('dark');
  });

  // Apply dark mode to <html> tag when toggled
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  return (
    <header className="w-full h-16 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-8 flex items-center justify-between select-none transition-colors duration-200">
      {/* Title */}
      <h1 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">
        {title}
      </h1>

      <div className="flex items-center gap-3">
        {/* Working Theme Toggle Button */}
        <button
          onClick={() => setIsDark((prev) => !prev)}
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
        >
          {isDark ? (
            <Sun className="w-5 h-5 text-amber-400" />
          ) : (
            <Moon className="w-5 h-5 text-slate-600" />
          )}
        </button>

        {/* Admin Avatar */}
        <div className="w-9 h-9 rounded-full bg-emerald-900 text-white font-bold text-sm flex items-center justify-center shadow-sm">
          A
        </div>

        {/* Sign Out Button */}
        {onLogout && (
          <button
            onClick={onLogout}
            title="Sign out"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200/60 dark:border-rose-900/40 rounded-lg transition-all ml-1 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log out</span>
          </button>
        )}
      </div>
    </header>
  );
}