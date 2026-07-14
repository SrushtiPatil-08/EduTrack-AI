import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, Bell, CalendarCheck, ClipboardList, BarChart3, Sparkles, ScanLine, LogOut, ChevronRight, BookOpen, CalendarDays, CalendarClock, Layers } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  { path: '/subjects', label: 'Subjects', icon: BookOpen },
  { path: '/attendance', label: 'Attendance', icon: CalendarCheck },
  { path: '/calendar', label: 'Calendar', icon: CalendarDays },
  { path: '/timetable', label: 'Timetable', icon: CalendarClock },
  { path: '/semesters', label: 'Semesters', icon: Layers },
  { path: '/assignments', label: 'Assignments', icon: ClipboardList },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/ai', label: 'AI Assistant', icon: Sparkles },
  { path: '/scanner', label: 'Scanner', icon: ScanLine },
];

export default function DashboardLayout({ children, title }: { children: React.ReactNode; title?: string }) {
  const { user, profile, signOut: handleSignOut } = useAuth();
  const navigate = useNavigate();
  const firstName = profile?.full_name?.split(' ')[0] || user?.name?.split(' ')[0] || 'there';

  return (
    <div className="min-h-screen bg-bg flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border flex flex-col fixed inset-y-0 left-0 z-30 glass-strong hidden lg:flex">
        <div className="p-6 flex items-center gap-2.5 border-b border-border">
          <div className="w-9 h-9 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center">
            <GraduationCap className="text-primary" size={18} />
          </div>
          <span className="font-bold text-text">EduTrack</span>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 group',
                'text-text-muted hover:text-text hover:bg-surface-2',
                'border border-transparent hover:border-border-2',
              )}
            >
              <item.icon size={18} className="shrink-0 group-hover:text-primary transition-colors" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t border-border space-y-1">
            <Link
              to="/profile"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-text-muted hover:text-text hover:bg-surface-2 transition-all border border-transparent hover:border-border-2"
            >
              <div className="w-7 h-7 rounded-lg bg-primary/15 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary-light">
                {firstName.charAt(0).toUpperCase()}
              </div>
              <span className="truncate">{firstName}</span>
              <ChevronRight size={16} className="ml-auto text-text-muted" />
            </Link>
            <Link
              to="/settings"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-text-muted hover:text-text hover:bg-surface-2 transition-all border border-transparent hover:border-border-2"
            >
              <span className="text-xs">Settings</span>
            </Link>
            <button
              onClick={async () => { await handleSignOut(); navigate('/'); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-error hover:bg-error/10 transition-all"
            >
              <LogOut size={16} />
              Sign Out
            </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 lg:ml-64">
        {/* Top bar */}
        <header className="sticky top-0 z-20 glass-strong border-b border-border px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-base font-semibold text-text">{title || 'Dashboard'}</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-text-muted hidden sm:block">Hello, {firstName} 👋</span>
            <div className="w-9 h-9 rounded-xl bg-surface-2 border border-border-2 flex items-center justify-center cursor-pointer hover:border-primary/40 transition-colors">
              <Bell size={16} className="text-text-muted" />
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
