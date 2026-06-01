import { useState, type ReactNode } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Bell,
  BookOpen,
  BrainCircuit,
  CalendarDays,
  ChevronDown,
  CircleHelp,
  FileText,
  LayoutDashboard,
  LogOut,
  MapPin,
  Megaphone,
  Menu,
  Search,
  Settings,
  Users
} from "lucide-react";

import { clearToken } from "../api/client";
import type { UserRole } from "../types";

interface AppShellProps {
  role: UserRole;
  title: string;
  children: ReactNode;
  actions?: ReactNode;
}

const roleLabels: Record<UserRole, string> = {
  student: "Student",
  parent: "Parent",
  teacher: "Teacher",
  administrator: "Administrator"
};

const navByRole: Record<UserRole, Array<{ label: string; to: string; icon: ReactNode }>> = {
  student: [
    { label: "Dashboard", to: "/student", icon: <LayoutDashboard size={18} /> },
    { label: "Applications", to: "/student", icon: <FileText size={18} /> },
    { label: "Schedule", to: "/student", icon: <CalendarDays size={18} /> },
    { label: "Materials", to: "/student", icon: <BookOpen size={18} /> }
  ],
  parent: [
    { label: "Dashboard", to: "/student", icon: <LayoutDashboard size={18} /> },
    { label: "Applications", to: "/student", icon: <FileText size={18} /> },
    { label: "Schedule", to: "/student", icon: <CalendarDays size={18} /> },
    { label: "Materials", to: "/student", icon: <BookOpen size={18} /> }
  ],
  teacher: [
    { label: "Dashboard", to: "/teacher", icon: <LayoutDashboard size={18} /> },
    { label: "Students", to: "/teacher", icon: <Users size={18} /> },
    { label: "Materials", to: "/teacher", icon: <BookOpen size={18} /> },
    { label: "Announcements", to: "/teacher", icon: <Megaphone size={18} /> }
  ],
  administrator: [
    { label: "Dashboard", to: "/admin", icon: <LayoutDashboard size={18} /> },
    { label: "Users", to: "/admin?section=users", icon: <Users size={18} /> },
    { label: "Clubs", to: "/admin?section=clubs", icon: <CalendarDays size={18} /> },
    { label: "Applications", to: "/admin?section=applications", icon: <FileText size={18} /> },
    { label: "Materials", to: "/admin?section=content", icon: <BookOpen size={18} /> },
    { label: "Announcements", to: "/admin?section=announcements", icon: <Megaphone size={18} /> },
    { label: "AI Recommendation", to: "/admin?section=ai", icon: <BrainCircuit size={18} /> },
    { label: "Settings", to: "/admin?section=settings", icon: <Settings size={18} /> }
  ]
};

export function AppShell({ role, title, children, actions }: AppShellProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const navItems = navByRole[role];

  function isCurrent(to: string) {
    const [pathname, search = ""] = to.split("?");
    const normalizedSearch = search ? `?${search}` : "";
    return location.pathname === pathname && location.search === normalizedSearch;
  }

  function handleSignOut() {
    clearToken();
    navigate("/login", { replace: true });
  }

  return (
    <div className="min-h-screen bg-[#f6f8fb] text-ink">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-slate-200 bg-white px-4 py-4 lg:flex lg:flex-col">
        <Link to="/" className="flex items-center gap-3 px-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-base font-black text-white shadow-[0_10px_24px_rgba(15,159,143,0.25)]">
            DU
          </div>
          <div>
            <p className="text-lg font-bold text-primaryDark">Digital Urpaq</p>
            <p className="text-xs font-semibold text-muted">{roleLabels[role]} portal</p>
          </div>
        </Link>

        <nav className="mt-7 grid gap-1">
          {navItems.map((item) => {
            const active = isCurrent(item.to);
            return (
              <NavLink
                key={item.label}
                to={item.to}
                className={`flex h-10 items-center gap-3 rounded-md px-3 text-sm font-semibold transition ${
                  active ? "bg-primary text-white shadow-[0_12px_24px_rgba(15,159,143,0.22)]" : "text-slate-600 hover:bg-slate-50 hover:text-ink"
                }`}
              >
                {item.icon}
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-slate-200 pt-4">
          <button
            type="button"
            className="mb-2 flex h-10 w-full items-center justify-between rounded-md px-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-ink"
          >
            <span className="inline-flex items-center gap-3">
              <CircleHelp size={18} aria-hidden="true" />
              Help center
            </span>
            <ChevronDown size={16} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={handleSignOut}
            className="flex h-10 w-full items-center gap-3 rounded-md px-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-ink"
          >
            <LogOut size={18} aria-hidden="true" />
            Sign out
          </button>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex min-h-16 items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
            <button
              className="flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 lg:hidden"
              type="button"
              aria-label={mobileNavOpen ? "Close navigation" : "Open navigation"}
              onClick={() => setMobileNavOpen((current) => !current)}
            >
              <Menu size={18} aria-hidden="true" />
            </button>

            <div className="hidden min-w-0 flex-1 items-center gap-3 md:flex">
              <label className="relative w-full max-w-[520px]">
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} aria-hidden="true" />
                <input
                  className="h-10 w-full rounded-md border border-slate-200 bg-white pl-10 pr-20 text-sm font-medium text-ink shadow-sm outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-teal-100"
                  placeholder="Search students, clubs, materials..."
                  type="search"
                />
                <span className="absolute right-2 top-1/2 hidden -translate-y-1/2 rounded border border-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-400 xl:inline">
                  Ctrl K
                </span>
              </label>
            </div>

            <div className="min-w-0 flex-1 md:hidden">
              <p className="text-xs font-semibold uppercase tracking-normal text-primaryDark">{roleLabels[role]}</p>
              <h1 className="truncate text-lg font-bold text-ink">{title}</h1>
            </div>

            <div className="ml-auto flex items-center gap-2">
              <button
                className="hidden h-10 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 xl:inline-flex"
                type="button"
              >
                <MapPin size={16} aria-hidden="true" />
                Astana Education Center
                <ChevronDown size={16} aria-hidden="true" />
              </button>
              {actions}
              <button className="relative flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-slate-50 hover:text-ink" type="button">
                <Bell size={18} aria-label="Notifications" />
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
              </button>
              <button className="hidden h-10 items-center gap-3 border-l border-slate-200 pl-4 text-left md:flex" type="button">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-sky-500 text-sm font-bold text-white">
                  AS
                </span>
                <span className="hidden xl:block">
                  <span className="block text-sm font-bold text-ink">Aigerim S.</span>
                  <span className="block text-xs font-semibold text-muted">{roleLabels[role]}</span>
                </span>
                <ChevronDown className="hidden text-slate-400 xl:block" size={16} aria-hidden="true" />
              </button>
            </div>
          </div>

          <nav className={`${mobileNavOpen ? "flex" : "hidden"} gap-2 overflow-x-auto border-t border-slate-100 px-4 py-2 sm:px-6 lg:hidden`}>
            {navItems.map((item) => {
              const active = isCurrent(item.to);
              return (
                <NavLink
                  key={item.label}
                  to={item.to}
                  className={`inline-flex h-9 shrink-0 items-center gap-2 rounded-md px-3 text-sm font-semibold transition ${
                    active ? "bg-primary text-white" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
        </header>
        <main className="px-4 py-5 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
