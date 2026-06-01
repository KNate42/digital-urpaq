import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { useSearchParams } from "react-router-dom";
import {
  ArrowUpRight,
  BarChart3,
  BookOpen,
  CalendarDays,
  CalendarPlus,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Download,
  FileCheck2,
  GraduationCap,
  Mail,
  Megaphone,
  MoreVertical,
  PieChart,
  Plus,
  Search,
  Sparkles,
  UserPlus,
  Users,
  XCircle
} from "lucide-react";

import { AiRecommendationPanel } from "../components/AiRecommendationPanel";
import { MetricCard } from "../components/MetricCard";
import { StatusBadge } from "../components/StatusBadge";
import { api, isApiUnavailableError } from "../api/client";
import {
  announcements as initialAnnouncements,
  applications as initialApplications,
  clubs as initialClubs,
  materials as initialMaterials
} from "../data/sampleData";
import { AppShell } from "../layouts/AppShell";
import type {
  Announcement,
  AnnouncementType,
  Application,
  ApplicationStatus,
  Club,
  ContentType,
  EnrollmentStatus,
  ManagedUser,
  ManagedUserStatus,
  Material,
  UserRole
} from "../types";

type AdminSection = "dashboard" | "users" | "clubs" | "applications" | "content" | "announcements" | "ai" | "settings";
type AdminUserRole = Extract<UserRole, "student" | "parent" | "teacher" | "administrator">;

const validSections = new Set<AdminSection>(["dashboard", "users", "clubs", "applications", "content", "announcements", "ai", "settings"]);

const sectionTitles: Record<AdminSection, string> = {
  dashboard: "Dashboard",
  users: "Users",
  clubs: "Clubs",
  applications: "Applications",
  content: "Materials",
  announcements: "Announcements",
  ai: "AI Recommendation",
  settings: "Settings"
};

const applicationFilters: Array<"all" | ApplicationStatus> = ["all", "new", "pending", "approved", "rejected"];
const userRoleFilters: Array<"all" | AdminUserRole> = ["all", "student", "parent", "teacher", "administrator"];
const clubStatusOrder: EnrollmentStatus[] = ["open", "waitlist", "closed"];

const initialUsers: ManagedUser[] = [
  {
    id: 1,
    fullName: "Aigerim Sadykova",
    role: "administrator",
    email: "aigerim@digitalurpaq.kz",
    phone: "+7 700 110 0001",
    joinedAt: "2026-02-10",
    status: "active",
    group: "Operations"
  },
  {
    id: 2,
    fullName: "Daniyar Omarov",
    role: "teacher",
    email: "daniyar@digitalurpaq.kz",
    phone: "+7 701 223 1871",
    joinedAt: "2026-03-18",
    status: "active",
    group: "Digital Design Studio"
  },
  {
    id: 3,
    fullName: "Madina Ilyasova",
    role: "teacher",
    email: "madina@digitalurpaq.kz",
    phone: "+7 705 441 7710",
    joinedAt: "2026-04-01",
    status: "active",
    group: "Math Olympiad Prep"
  },
  {
    id: 4,
    fullName: "Arman Tulegen",
    role: "student",
    email: "arman.tulegen@mail.kz",
    phone: "+7 700 111 2211",
    joinedAt: "2026-05-28",
    status: "active",
    group: "Robotics Lab"
  },
  {
    id: 5,
    fullName: "Amina Rakhim",
    role: "student",
    email: "amina.rakhim@mail.kz",
    phone: "+7 701 444 1199",
    joinedAt: "2026-05-27",
    status: "invited",
    group: "Python Foundations"
  },
  {
    id: 6,
    fullName: "Laura Rakhim",
    role: "parent",
    email: "laura.rakhim@mail.kz",
    phone: "+7 777 901 1144",
    joinedAt: "2026-05-27",
    status: "active",
    group: "Amina Rakhim"
  },
  {
    id: 7,
    fullName: "Miras Nurlan",
    role: "student",
    email: "miras.nurlan@mail.kz",
    phone: "+7 705 902 6511",
    joinedAt: "2026-05-18",
    status: "paused",
    group: "Math Olympiad Prep"
  }
];

const contentTypes: ContentType[] = ["article", "video", "presentation", "attachment", "homework"];
const announcementTypes: AnnouncementType[] = ["announcement", "event", "banner", "success_story"];

function parseSection(value: string | null): AdminSection {
  if (!value) {
    return "dashboard";
  }
  return validSections.has(value as AdminSection) ? (value as AdminSection) : "dashboard";
}

function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function prettyLabel(value: string): string {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function roleLabel(role: AdminUserRole): string {
  return role === "administrator" ? "Admin" : prettyLabel(role);
}

function Panel({
  title,
  description,
  action,
  children,
  className = ""
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`min-w-0 rounded-lg border border-slate-200 bg-white shadow-sm ${className}`}>
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 px-5 py-4">
        <div>
          <h2 className="text-lg font-bold text-ink">{title}</h2>
          {description ? <p className="mt-1 text-sm font-medium text-muted">{description}</p> : null}
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function Avatar({ name }: { name: string }) {
  return <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-50 text-xs font-bold text-primaryDark ring-1 ring-teal-100">{initials(name)}</span>;
}

function UserStatusPill({ status }: { status: ManagedUserStatus }) {
  const classes: Record<ManagedUserStatus, string> = {
    active: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    invited: "bg-blue-50 text-blue-700 ring-blue-200",
    paused: "bg-slate-100 text-slate-600 ring-slate-200"
  };

  return <span className={`inline-flex min-w-20 justify-center rounded-md px-2.5 py-1 text-xs font-bold ring-1 ${classes[status]}`}>{prettyLabel(status)}</span>;
}

function SegmentedButton({
  active,
  children,
  onClick
}: {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      className={`h-9 rounded-md px-3 text-sm font-bold transition ${
        active ? "bg-primary text-white shadow-[0_10px_20px_rgba(15,159,143,0.18)]" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
      }`}
      type="button"
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function SearchBox({
  value,
  onChange,
  placeholder
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label className="relative block min-w-0">
      <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} aria-hidden="true" />
      <input
        className="h-10 w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 text-sm font-medium text-ink outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-teal-100 sm:w-72"
        placeholder={placeholder}
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function ApplicationsTable({
  applications,
  onStatusChange,
  compact = false
}: {
  applications: Application[];
  onStatusChange: (id: number, status: ApplicationStatus) => void;
  compact?: boolean;
}) {
  if (!applications.length) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center">
        <p className="text-sm font-bold text-ink">No applications found</p>
        <p className="mt-1 text-sm text-muted">Try another search or status filter.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-3 md:hidden">
        {applications.map((application) => (
          <article key={application.id} className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <Avatar name={application.studentFullName} />
                <div className="min-w-0">
                  <p className="truncate font-bold text-ink">{application.studentFullName}</p>
                  <p className="text-xs font-medium text-muted">
                    Age {application.age} · {application.contacts}
                  </p>
                </div>
              </div>
              <StatusBadge status={application.status} />
            </div>
            <div className="mt-4 rounded-md bg-slate-50 px-3 py-3">
              <p className="font-bold text-ink">{application.selectedClub}</p>
              <p className="mt-1 text-sm leading-6 text-muted">{application.comment}</p>
              {!compact ? <p className="mt-2 text-xs font-bold text-slate-500">{application.submittedAt}</p> : null}
            </div>
            <div className="mt-4 grid grid-cols-[1fr_auto_auto] gap-2">
              <button
                className="h-9 rounded-md border border-primary px-3 text-xs font-bold text-primaryDark transition hover:bg-teal-50"
                type="button"
                onClick={() => onStatusChange(application.id, "pending")}
              >
                Review
              </button>
              <button
                className="flex h-9 w-9 items-center justify-center rounded-md bg-emerald-600 text-white transition hover:bg-emerald-700"
                type="button"
                aria-label={`Approve ${application.studentFullName}`}
                onClick={() => onStatusChange(application.id, "approved")}
              >
                <CheckCircle2 size={16} aria-hidden="true" />
              </button>
              <button
                className="flex h-9 w-9 items-center justify-center rounded-md bg-rose-600 text-white transition hover:bg-rose-700"
                type="button"
                aria-label={`Reject ${application.studentFullName}`}
                onClick={() => onStatusChange(application.id, "rejected")}
              >
                <XCircle size={16} aria-hidden="true" />
              </button>
            </div>
          </article>
        ))}
      </div>

      <div className="hidden overflow-x-auto md:block">
      <table className={`${compact ? "min-w-[640px]" : "min-w-[760px]"} table-fixed text-left text-sm`}>
        <thead className="bg-slate-50 text-xs font-bold uppercase tracking-normal text-slate-500">
          <tr>
            <th className="w-[28%] px-4 py-3">Student</th>
            <th className="w-[22%] px-4 py-3">Club</th>
            {!compact ? <th className="w-[15%] px-4 py-3">Applied on</th> : null}
            <th className="w-[14%] px-4 py-3">Status</th>
            <th className="w-[21%] px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {applications.map((application) => (
            <tr key={application.id} className="align-middle transition hover:bg-slate-50">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <Avatar name={application.studentFullName} />
                  <div className="min-w-0">
                    <p className="truncate font-bold text-ink">{application.studentFullName}</p>
                    <p className="truncate text-xs font-medium text-muted">
                      Age {application.age} · {application.contacts}
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3">
                <p className="font-semibold text-ink">{application.selectedClub}</p>
                <p className="text-xs font-medium text-muted">{application.comment}</p>
              </td>
              {!compact ? <td className="px-4 py-3 font-semibold text-slate-600">{application.submittedAt}</td> : null}
              <td className="px-4 py-3">
                <StatusBadge status={application.status} />
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    className="h-8 rounded-md border border-primary px-3 text-xs font-bold text-primaryDark transition hover:bg-teal-50"
                    type="button"
                    onClick={() => onStatusChange(application.id, "pending")}
                  >
                    Review
                  </button>
                  <button
                    className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-600 text-white transition hover:bg-emerald-700"
                    type="button"
                    aria-label={`Approve ${application.studentFullName}`}
                    onClick={() => onStatusChange(application.id, "approved")}
                  >
                    <CheckCircle2 size={16} aria-hidden="true" />
                  </button>
                  <button
                    className="flex h-8 w-8 items-center justify-center rounded-md bg-rose-600 text-white transition hover:bg-rose-700"
                    type="button"
                    aria-label={`Reject ${application.studentFullName}`}
                    onClick={() => onStatusChange(application.id, "rejected")}
                  >
                    <XCircle size={16} aria-hidden="true" />
                  </button>
                  <button className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-ink" type="button" aria-label="More actions">
                    <MoreVertical size={16} aria-hidden="true" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </>
  );
}

function MiniBar({ label, value, max }: { label: string; value: number; max: number }) {
  const width = Math.max(8, Math.min(100, (value / max) * 100));

  return (
    <div className="grid grid-cols-[140px_1fr_36px] items-center gap-3 text-sm">
      <span className="truncate font-semibold text-slate-600">{label}</span>
      <span className="h-2 rounded-full bg-slate-100">
        <span className="block h-2 rounded-full bg-primary" style={{ width: `${width}%` }} />
      </span>
      <span className="text-right font-bold text-ink">{value}</span>
    </div>
  );
}

export function AdminDashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeSection = parseSection(searchParams.get("section"));

  const [applications, setApplications] = useState<Application[]>(initialApplications);
  const [managedClubs, setManagedClubs] = useState<Club[]>(initialClubs);
  const [managedMaterials, setManagedMaterials] = useState<Material[]>(initialMaterials);
  const [managedAnnouncements, setManagedAnnouncements] = useState<Announcement[]>(initialAnnouncements);
  const [users, setUsers] = useState<ManagedUser[]>(initialUsers);
  const [dataSource, setDataSource] = useState<"api" | "demo">("demo");
  const [dataNotice, setDataNotice] = useState("");
  const [isSyncing, setIsSyncing] = useState(true);

  const [applicationFilter, setApplicationFilter] = useState<"all" | ApplicationStatus>("all");
  const [applicationSearch, setApplicationSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState<"all" | AdminUserRole>("all");
  const [userSearch, setUserSearch] = useState("");

  const [clubFormOpen, setClubFormOpen] = useState(false);
  const [clubName, setClubName] = useState("");
  const [clubCategory, setClubCategory] = useState("Robotics");
  const [clubTeacher, setClubTeacher] = useState("Aigerim Sadykova");

  const [materialTitle, setMaterialTitle] = useState("");
  const [materialType, setMaterialType] = useState<ContentType>("article");
  const [materialClub, setMaterialClub] = useState(initialClubs[0]?.name ?? "Robotics Lab");

  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementBody, setAnnouncementBody] = useState("");
  const [announcementType, setAnnouncementType] = useState<AnnouncementType>("announcement");

  const [settingsState, setSettingsState] = useState({
    weeklyReports: true,
    applicationAlerts: true,
    autoCloseFullClubs: false
  });

  useEffect(() => {
    let cancelled = false;

    async function loadAdminData() {
      setIsSyncing(true);
      const [usersResult, clubsResult, applicationsResult, materialsResult, announcementsResult] = await Promise.allSettled([
        api.listUsers(),
        api.listClubs(),
        api.listApplications(),
        api.listMaterials(),
        api.listAnnouncements()
      ]);

      if (cancelled) {
        return;
      }

      let apiBackedCount = 0;
      if (usersResult.status === "fulfilled") {
        setUsers(usersResult.value);
        apiBackedCount += 1;
      }
      if (clubsResult.status === "fulfilled") {
        setManagedClubs(clubsResult.value);
        setMaterialClub(clubsResult.value[0]?.name ?? "Robotics Lab");
        apiBackedCount += 1;
      }
      if (applicationsResult.status === "fulfilled") {
        setApplications(applicationsResult.value);
        apiBackedCount += 1;
      }
      if (materialsResult.status === "fulfilled") {
        setManagedMaterials(materialsResult.value);
        apiBackedCount += 1;
      }
      if (announcementsResult.status === "fulfilled") {
        setManagedAnnouncements(announcementsResult.value);
        apiBackedCount += 1;
      }

      const rejectedReasons = [usersResult, clubsResult, applicationsResult, materialsResult, announcementsResult]
        .filter((result): result is PromiseRejectedResult => result.status === "rejected")
        .map((result) => result.reason);
      const apiUnavailable = rejectedReasons.some(isApiUnavailableError);

      setDataSource(apiBackedCount > 0 ? "api" : "demo");
      setDataNotice(
        apiBackedCount === 5
          ? "Live API connected. Dashboard data is synced from backend."
          : apiUnavailable
            ? "Backend is offline. Using local demo data until the API is available."
            : "Some protected API data is unavailable. Showing synced public data with local demo fallback."
      );
      setIsSyncing(false);
    }

    loadAdminData();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredApplications = useMemo(() => {
    const term = applicationSearch.trim().toLowerCase();
    return applications.filter((application) => {
      const matchesStatus = applicationFilter === "all" || application.status === applicationFilter;
      const matchesSearch =
        !term ||
        application.studentFullName.toLowerCase().includes(term) ||
        application.selectedClub.toLowerCase().includes(term) ||
        application.contacts.toLowerCase().includes(term);

      return matchesStatus && matchesSearch;
    });
  }, [applications, applicationFilter, applicationSearch]);

  const filteredUsers = useMemo(() => {
    const term = userSearch.trim().toLowerCase();
    return users.filter((user) => {
      const matchesRole = userRoleFilter === "all" || user.role === userRoleFilter;
      const matchesSearch =
        !term ||
        user.fullName.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        user.group.toLowerCase().includes(term);

      return matchesRole && matchesSearch;
    });
  }, [users, userRoleFilter, userSearch]);

  const statusCounts = useMemo(
    () =>
      applicationFilters.reduce<Record<ApplicationStatus, number>>(
        (accumulator, status) => {
          if (status !== "all") {
            accumulator[status] = applications.filter((application) => application.status === status).length;
          }
          return accumulator;
        },
        { new: 0, pending: 0, approved: 0, rejected: 0 }
      ),
    [applications]
  );

  function setSection(section: AdminSection) {
    setSearchParams(section === "dashboard" ? {} : { section });
  }

  async function updateStatus(id: number, status: ApplicationStatus) {
    setApplications((current) => current.map((application) => (application.id === id ? { ...application, status } : application)));

    try {
      const updatedApplication = await api.updateApplicationStatus(id, status);
      setApplications((current) => current.map((application) => (application.id === id ? updatedApplication : application)));
      setDataSource("api");
    } catch (error) {
      setDataNotice(isApiUnavailableError(error) ? "Backend is offline. Application status changed locally." : "Application status changed locally; API save needs a valid admin session.");
    }
  }

  function openClubCreator() {
    setSection("clubs");
    setClubFormOpen(true);
  }

  async function handleCreateClub(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!clubName.trim()) {
      return;
    }

    const localClub: Club = {
      id: Math.max(0, ...managedClubs.map((club) => club.id)) + 1,
      name: clubName.trim(),
      description: `${clubCategory} program prepared for the next enrollment window.`,
      category: clubCategory.trim() || "General",
      ageGroup: "10-16",
      teacher: clubTeacher.trim() || "Unassigned",
      schedule: "Tue, Thu 16:00-17:30",
      classroom: "TBD",
      availableSeats: 10,
      enrollmentStatus: "open"
    };

    setManagedClubs((current) => [localClub, ...current]);
    setClubName("");
    setClubCategory("Robotics");
    setClubTeacher("Aigerim Sadykova");
    setClubFormOpen(false);

    try {
      const createdClub = await api.createClub({
        name: localClub.name,
        description: localClub.description,
        category: localClub.category,
        ageMin: 10,
        ageMax: 16,
        teacherId: null,
        schedule: localClub.schedule,
        classroom: localClub.classroom,
        availableSeats: localClub.availableSeats,
        enrollmentStatus: localClub.enrollmentStatus
      });
      setManagedClubs((current) => current.map((club) => (club.id === localClub.id ? createdClub : club)));
      setDataSource("api");
    } catch (error) {
      setDataNotice(isApiUnavailableError(error) ? "Backend is offline. New club was added locally." : "New club was added locally; API save needs a valid admin session.");
    }
  }

  async function cycleClubStatus(id: number) {
    let nextClub: Club | undefined;
    setManagedClubs((current) =>
      current.map((club) => {
        if (club.id !== id) {
          return club;
        }
        const currentIndex = clubStatusOrder.indexOf(club.enrollmentStatus);
        nextClub = { ...club, enrollmentStatus: clubStatusOrder[(currentIndex + 1) % clubStatusOrder.length] };
        return nextClub;
      })
    );

    if (!nextClub) {
      return;
    }

    try {
      const updatedClub = await api.updateClub(id, {
        name: nextClub.name,
        description: nextClub.description,
        category: nextClub.category,
        ageMin: Number(nextClub.ageGroup.split("-")[0] ?? 10),
        ageMax: Number(nextClub.ageGroup.split("-")[1] ?? 16),
        teacherId: null,
        schedule: nextClub.schedule,
        classroom: nextClub.classroom,
        availableSeats: nextClub.availableSeats,
        enrollmentStatus: nextClub.enrollmentStatus
      });
      setManagedClubs((current) => current.map((club) => (club.id === id ? updatedClub : club)));
      setDataSource("api");
    } catch (error) {
      setDataNotice(isApiUnavailableError(error) ? "Backend is offline. Club status changed locally." : "Club status changed locally; API save needs a valid admin session.");
    }
  }

  async function increaseClubSeats(id: number) {
    let nextClub: Club | undefined;
    setManagedClubs((current) =>
      current.map((club) => {
        if (club.id !== id) {
          return club;
        }
        nextClub = { ...club, availableSeats: club.availableSeats + 1 };
        return nextClub;
      })
    );

    if (!nextClub) {
      return;
    }

    try {
      const updatedClub = await api.updateClub(id, {
        name: nextClub.name,
        description: nextClub.description,
        category: nextClub.category,
        ageMin: Number(nextClub.ageGroup.split("-")[0] ?? 10),
        ageMax: Number(nextClub.ageGroup.split("-")[1] ?? 16),
        teacherId: null,
        schedule: nextClub.schedule,
        classroom: nextClub.classroom,
        availableSeats: nextClub.availableSeats,
        enrollmentStatus: nextClub.enrollmentStatus
      });
      setManagedClubs((current) => current.map((club) => (club.id === id ? updatedClub : club)));
      setDataSource("api");
    } catch (error) {
      setDataNotice(isApiUnavailableError(error) ? "Backend is offline. Seat count changed locally." : "Seat count changed locally; API save needs a valid admin session.");
    }
  }

  async function handleAddMaterial(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!materialTitle.trim()) {
      return;
    }

    const selectedClub = managedClubs.find((club) => club.name === materialClub);
    const localMaterial: Material = {
      id: Math.max(0, ...managedMaterials.map((material) => material.id)) + 1,
      title: materialTitle.trim(),
      description: "New material prepared from the admin workspace.",
      type: materialType,
      club: materialClub,
      visibility: "Assigned",
      updatedAt: new Date().toISOString().slice(0, 10)
    };

    setManagedMaterials((current) => [localMaterial, ...current]);
    setMaterialTitle("");

    try {
      const createdMaterial = await api.createMaterial({
        title: localMaterial.title,
        description: localMaterial.description,
        type: localMaterial.type,
        clubId: selectedClub?.id ?? null,
        isPublic: false
      });
      setManagedMaterials((current) => current.map((material) => (material.id === localMaterial.id ? createdMaterial : material)));
      setDataSource("api");
    } catch (error) {
      setDataNotice(isApiUnavailableError(error) ? "Backend is offline. Material was added locally." : "Material was added locally; API save needs a teacher or admin session.");
    }
  }

  async function toggleMaterialVisibility(id: number) {
    let nextMaterial: Material | undefined;
    setManagedMaterials((current) =>
      current.map((material) => {
        if (material.id !== id) {
          return material;
        }
        nextMaterial = { ...material, visibility: material.visibility === "Public" ? "Assigned" : "Public" };
        return nextMaterial;
      })
    );

    if (!nextMaterial) {
      return;
    }

    try {
      const updatedMaterial = await api.updateMaterial(id, { isPublic: nextMaterial.visibility === "Public" });
      setManagedMaterials((current) => current.map((material) => (material.id === id ? updatedMaterial : material)));
      setDataSource("api");
    } catch (error) {
      setDataNotice(isApiUnavailableError(error) ? "Backend is offline. Material visibility changed locally." : "Material visibility changed locally; API save needs a teacher or admin session.");
    }
  }

  async function handlePublishAnnouncement(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!announcementTitle.trim() || !announcementBody.trim()) {
      return;
    }

    const localAnnouncement: Announcement = {
      id: Math.max(0, ...managedAnnouncements.map((announcement) => announcement.id)) + 1,
      title: announcementTitle.trim(),
      body: announcementBody.trim(),
      type: announcementType,
      date: new Date().toISOString().slice(0, 10)
    };

    setManagedAnnouncements((current) => [localAnnouncement, ...current]);
    setAnnouncementTitle("");
    setAnnouncementBody("");
    setAnnouncementType("announcement");

    try {
      const createdAnnouncement = await api.createAnnouncement({
        title: localAnnouncement.title,
        body: localAnnouncement.body,
        type: localAnnouncement.type,
        published: true
      });
      setManagedAnnouncements((current) =>
        current.map((announcement) => (announcement.id === localAnnouncement.id ? createdAnnouncement : announcement))
      );
      setDataSource("api");
    } catch (error) {
      setDataNotice(isApiUnavailableError(error) ? "Backend is offline. Announcement was published locally." : "Announcement was published locally; API save needs a teacher or admin session.");
    }
  }

  async function toggleUserStatus(id: number) {
    let nextUser: ManagedUser | undefined;
    setUsers((current) =>
      current.map((user) => {
        if (user.id !== id) {
          return user;
        }
        const nextStatus: Record<ManagedUserStatus, ManagedUserStatus> = {
          active: "paused",
          paused: "active",
          invited: "active"
        };
        nextUser = { ...user, status: nextStatus[user.status] };
        return nextUser;
      })
    );

    if (!nextUser) {
      return;
    }

    try {
      const updatedUser = await api.updateUser(id, { isActive: nextUser.status === "active" });
      setUsers((current) => current.map((user) => (user.id === id ? { ...updatedUser, group: nextUser?.group ?? updatedUser.group } : user)));
      setDataSource("api");
    } catch (error) {
      setDataNotice(isApiUnavailableError(error) ? "Backend is offline. User status changed locally." : "User status changed locally; API save needs a valid admin session.");
    }
  }

  function exportReport() {
    const rows = [
      ["Metric", "Value"],
      ["Users", String(users.length)],
      ["Clubs", String(managedClubs.length)],
      ["Applications", String(applications.length)],
      ["New applications", String(statusCounts.new)],
      ["Pending applications", String(statusCounts.pending)],
      ["Approved applications", String(statusCounts.approved)],
      ["Rejected applications", String(statusCounts.rejected)],
      ["Materials", String(managedMaterials.length)],
      ["Announcements", String(managedAnnouncements.length)]
    ];
    const csv = rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "digital-urpaq-admin-report.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  function renderDashboard() {
    const topClubs = [...managedClubs].sort((first, second) => second.availableSeats - first.availableSeats).slice(0, 5);

    return (
      <div className="grid gap-5">
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <MetricCard label="Total Students" value="1,248" change="+8.6% vs last month" tone="teal" icon={<Users size={22} aria-hidden="true" />} />
          <MetricCard label="Active Clubs" value={String(managedClubs.filter((club) => club.enrollmentStatus !== "closed").length)} change="Open enrollment live" tone="emerald" icon={<CalendarDays size={22} aria-hidden="true" />} />
          <MetricCard label="New Applications" value={String(statusCounts.new)} change={`${statusCounts.pending} pending review`} tone="amber" icon={<Clock3 size={22} aria-hidden="true" />} />
          <MetricCard label="Approved" value={String(statusCounts.approved)} change="This review cycle" tone="blue" icon={<CheckCircle2 size={22} aria-hidden="true" />} />
          <MetricCard label="Materials" value={String(managedMaterials.length)} change="Updated this week" tone="teal" icon={<BookOpen size={22} aria-hidden="true" />} />
        </section>

        <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_390px]">
          <div className="grid min-w-0 gap-5">
            <Panel
              title="Recent Applications"
              action={
                <button className="inline-flex h-9 items-center gap-2 rounded-md border border-primary px-3 text-sm font-bold text-primaryDark transition hover:bg-teal-50" type="button" onClick={() => setSection("applications")}>
                  Review
                  <ChevronRight size={16} aria-hidden="true" />
                </button>
              }
            >
              <ApplicationsTable applications={applications.slice(0, 5)} onStatusChange={updateStatus} compact />
            </Panel>

            <div className="grid gap-5 xl:grid-cols-2">
              <Panel
                title="Club Overview"
                action={
                  <button className="inline-flex h-9 items-center gap-2 rounded-md border border-primary px-3 text-sm font-bold text-primaryDark transition hover:bg-teal-50" type="button" onClick={openClubCreator}>
                    Create club
                  </button>
                }
              >
                <div className="grid gap-3">
                  {managedClubs.slice(0, 5).map((club) => (
                    <div key={club.id} className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-md border border-slate-200 px-3 py-3">
                      <div className="min-w-0">
                        <p className="truncate font-bold text-ink">{club.name}</p>
                        <p className="truncate text-xs font-semibold text-muted">
                          {club.teacher} · {club.availableSeats} seats
                        </p>
                      </div>
                      <StatusBadge status={club.enrollmentStatus} />
                    </div>
                  ))}
                  <button className="inline-flex w-fit items-center gap-1 text-sm font-bold text-primaryDark hover:text-primary" type="button" onClick={() => setSection("clubs")}>
                    View all clubs
                    <ArrowUpRight size={15} aria-hidden="true" />
                  </button>
                </div>
              </Panel>

              <Panel
                title="Announcements"
                action={
                  <button className="inline-flex h-9 items-center gap-2 rounded-md border border-primary px-3 text-sm font-bold text-primaryDark transition hover:bg-teal-50" type="button" onClick={() => setSection("announcements")}>
                    New
                  </button>
                }
              >
                <div className="grid gap-3">
                  {managedAnnouncements.slice(0, 4).map((announcement) => (
                    <article key={announcement.id} className="flex gap-3 rounded-md border border-slate-200 px-3 py-3">
                      <Megaphone className="mt-0.5 shrink-0 text-primary" size={20} aria-hidden="true" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-bold text-ink">{announcement.title}</p>
                        <p className="line-clamp-2 text-xs font-medium text-muted">{announcement.body}</p>
                      </div>
                      <span className="shrink-0 text-xs font-bold text-slate-500">{announcement.date}</span>
                    </article>
                  ))}
                </div>
              </Panel>
            </div>
          </div>

          <AiRecommendationPanel className="xl:sticky xl:top-24 xl:self-start" />
        </section>

        <Panel title="Analytics Overview" description="Application mix, grade participation, and club capacity at a glance.">
          <div className="grid gap-5 xl:grid-cols-[1.1fr_0.8fr_1fr]">
            <div className="rounded-lg border border-slate-200 p-4">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-ink">Applications by Status</p>
                  <p className="text-xs font-semibold text-muted">Current local dataset</p>
                </div>
                <PieChart className="text-primary" size={20} aria-hidden="true" />
              </div>
              <div className="grid gap-3">
                {applicationFilters
                  .filter((status): status is ApplicationStatus => status !== "all")
                  .map((status) => (
                    <MiniBar key={status} label={prettyLabel(status)} value={statusCounts[status]} max={Math.max(1, applications.length)} />
                  ))}
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 p-4">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-ink">Students by Grade</p>
                  <p className="text-xs font-semibold text-muted">Estimated distribution</p>
                </div>
                <BarChart3 className="text-primary" size={20} aria-hidden="true" />
              </div>
              <div className="flex h-44 items-end gap-3 border-b border-slate-200 px-2">
                {[140, 205, 155, 220, 318, 342, 248, 180].map((value, index) => (
                  <div key={value} className="flex flex-1 flex-col items-center gap-2">
                    <span className="w-full rounded-t-md bg-gradient-to-t from-primary to-teal-300" style={{ height: `${Math.max(20, value / 4)}px` }} />
                    <span className="text-xs font-bold text-slate-500">{index + 5}th</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 p-4">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-ink">Top Clubs by Seats</p>
                  <p className="text-xs font-semibold text-muted">Capacity still available</p>
                </div>
                <GraduationCap className="text-primary" size={20} aria-hidden="true" />
              </div>
              <div className="grid gap-3">
                {topClubs.map((club) => (
                  <MiniBar key={club.id} label={club.name} value={club.availableSeats} max={Math.max(1, topClubs[0]?.availableSeats ?? 1)} />
                ))}
              </div>
            </div>
          </div>
        </Panel>
      </div>
    );
  }

  function renderUsers() {
    return (
      <div className="grid gap-5">
        <Panel
          title="User Directory"
          description="Manage students, parents, teachers, and administrators."
          action={
            <button
              className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-3 text-sm font-bold text-white shadow-[0_10px_20px_rgba(15,159,143,0.18)] transition hover:bg-primaryDark"
              type="button"
              onClick={() =>
                setUsers((current) => [
                  {
                    id: Math.max(0, ...current.map((user) => user.id)) + 1,
                    fullName: "New invited user",
                    role: "student",
                    email: `invite-${Date.now()}@digitalurpaq.kz`,
                    phone: "+7 700 000 0000",
                    joinedAt: new Date().toISOString().slice(0, 10),
                    status: "invited",
                    group: "Pending assignment"
                  },
                  ...current
                ])
              }
            >
              <UserPlus size={16} aria-hidden="true" />
              Invite user
            </button>
          }
        >
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {userRoleFilters.map((role) => (
                <SegmentedButton key={role} active={userRoleFilter === role} onClick={() => setUserRoleFilter(role)}>
                  {role === "all" ? "All roles" : roleLabel(role)}
                </SegmentedButton>
              ))}
            </div>
            <SearchBox value={userSearch} onChange={setUserSearch} placeholder="Search users" />
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="min-w-full table-fixed text-left text-sm">
              <thead className="bg-slate-50 text-xs font-bold uppercase tracking-normal text-slate-500">
                <tr>
                  <th className="w-[28%] px-4 py-3">User</th>
                  <th className="w-[16%] px-4 py-3">Role</th>
                  <th className="w-[22%] px-4 py-3">Group</th>
                  <th className="w-[16%] px-4 py-3">Status</th>
                  <th className="w-[18%] px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="transition hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={user.fullName} />
                        <div className="min-w-0">
                          <p className="truncate font-bold text-ink">{user.fullName}</p>
                          <p className="truncate text-xs font-medium text-muted">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-600">{roleLabel(user.role)}</td>
                    <td className="px-4 py-3 font-semibold text-slate-600">{user.group}</td>
                    <td className="px-4 py-3">
                      <UserStatusPill status={user.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <button className="h-8 rounded-md border border-slate-200 px-3 text-xs font-bold text-slate-700 transition hover:bg-slate-50" type="button" onClick={() => toggleUserStatus(user.id)}>
                          {user.status === "paused" ? "Activate" : "Pause"}
                        </button>
                        <a className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-ink" href={`mailto:${user.email}`} aria-label={`Email ${user.fullName}`}>
                          <Mail size={15} aria-hidden="true" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    );
  }

  function renderClubs() {
    return (
      <div className="grid gap-5 xl:grid-cols-[0.75fr_1.25fr]">
        <Panel title="Create Club" description="Add a program and publish it to enrollment." className={clubFormOpen ? "" : "xl:order-2"}>
          <form className="grid gap-3" onSubmit={handleCreateClub}>
            <label className="grid gap-1.5 text-sm font-bold text-ink">
              Club name
              <input className="h-10 rounded-md border border-slate-200 px-3 text-sm font-medium outline-none transition focus:border-primary focus:ring-4 focus:ring-teal-100" value={clubName} onChange={(event) => setClubName(event.target.value)} placeholder="STEM Lab" />
            </label>
            <label className="grid gap-1.5 text-sm font-bold text-ink">
              Category
              <input className="h-10 rounded-md border border-slate-200 px-3 text-sm font-medium outline-none transition focus:border-primary focus:ring-4 focus:ring-teal-100" value={clubCategory} onChange={(event) => setClubCategory(event.target.value)} placeholder="Robotics" />
            </label>
            <label className="grid gap-1.5 text-sm font-bold text-ink">
              Teacher
              <input className="h-10 rounded-md border border-slate-200 px-3 text-sm font-medium outline-none transition focus:border-primary focus:ring-4 focus:ring-teal-100" value={clubTeacher} onChange={(event) => setClubTeacher(event.target.value)} placeholder="Teacher name" />
            </label>
            <button className="mt-2 inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-bold text-white shadow-[0_10px_20px_rgba(15,159,143,0.18)] transition hover:bg-primaryDark" type="submit">
              <Plus size={16} aria-hidden="true" />
              Create club
            </button>
          </form>
        </Panel>

        <Panel title="Club Management" description="Capacity, rooms, teachers, and enrollment status.">
          <div className="grid gap-3">
            {managedClubs.map((club) => (
              <article key={club.id} className="rounded-lg border border-slate-200 p-4 transition hover:border-teal-200 hover:bg-teal-50/30">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-base font-bold text-ink">{club.name}</h3>
                    <p className="mt-1 text-sm font-medium text-muted">{club.description}</p>
                  </div>
                  <StatusBadge status={club.enrollmentStatus} />
                </div>
                <dl className="mt-4 grid gap-3 text-sm md:grid-cols-4">
                  <div>
                    <dt className="font-bold text-slate-400">Teacher</dt>
                    <dd className="mt-1 font-semibold text-ink">{club.teacher}</dd>
                  </div>
                  <div>
                    <dt className="font-bold text-slate-400">Schedule</dt>
                    <dd className="mt-1 font-semibold text-ink">{club.schedule}</dd>
                  </div>
                  <div>
                    <dt className="font-bold text-slate-400">Classroom</dt>
                    <dd className="mt-1 font-semibold text-ink">{club.classroom}</dd>
                  </div>
                  <div>
                    <dt className="font-bold text-slate-400">Available seats</dt>
                    <dd className="mt-1 font-semibold text-ink">{club.availableSeats}</dd>
                  </div>
                </dl>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <button className="h-9 rounded-md border border-slate-200 px-3 text-sm font-bold text-slate-700 transition hover:bg-white" type="button" onClick={() => cycleClubStatus(club.id)}>
                    Cycle status
                  </button>
                  <button className="h-9 rounded-md border border-slate-200 px-3 text-sm font-bold text-slate-700 transition hover:bg-white" type="button" onClick={() => increaseClubSeats(club.id)}>
                    Add seat
                  </button>
                </div>
              </article>
            ))}
          </div>
        </Panel>
      </div>
    );
  }

  function renderApplications() {
    return (
      <Panel title="Applications Queue" description="Search registrations and update enrollment decisions.">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {applicationFilters.map((filter) => (
              <SegmentedButton key={filter} active={applicationFilter === filter} onClick={() => setApplicationFilter(filter)}>
                {filter === "all" ? "All statuses" : prettyLabel(filter)}
              </SegmentedButton>
            ))}
          </div>
          <SearchBox value={applicationSearch} onChange={setApplicationSearch} placeholder="Search applications" />
        </div>
        <ApplicationsTable applications={filteredApplications} onStatusChange={updateStatus} />
      </Panel>
    );
  }

  function renderContent() {
    return (
      <div className="grid gap-5 xl:grid-cols-[0.75fr_1.25fr]">
        <Panel title="Add Material" description="Create a content record for a club.">
          <form className="grid gap-3" onSubmit={handleAddMaterial}>
            <label className="grid gap-1.5 text-sm font-bold text-ink">
              Title
              <input className="h-10 rounded-md border border-slate-200 px-3 text-sm font-medium outline-none transition focus:border-primary focus:ring-4 focus:ring-teal-100" value={materialTitle} onChange={(event) => setMaterialTitle(event.target.value)} placeholder="Lesson slides or homework" />
            </label>
            <label className="grid gap-1.5 text-sm font-bold text-ink">
              Club
              <select className="h-10 rounded-md border border-slate-200 px-3 text-sm font-medium outline-none transition focus:border-primary focus:ring-4 focus:ring-teal-100" value={materialClub} onChange={(event) => setMaterialClub(event.target.value)}>
                {managedClubs.map((club) => (
                  <option key={club.id} value={club.name}>
                    {club.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1.5 text-sm font-bold text-ink">
              Type
              <select className="h-10 rounded-md border border-slate-200 px-3 text-sm font-medium outline-none transition focus:border-primary focus:ring-4 focus:ring-teal-100" value={materialType} onChange={(event) => setMaterialType(event.target.value as ContentType)}>
                {contentTypes.map((type) => (
                  <option key={type} value={type}>
                    {prettyLabel(type)}
                  </option>
                ))}
              </select>
            </label>
            <button className="mt-2 inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-bold text-white shadow-[0_10px_20px_rgba(15,159,143,0.18)] transition hover:bg-primaryDark" type="submit">
              <BookOpen size={16} aria-hidden="true" />
              Add material
            </button>
          </form>
        </Panel>

        <Panel title="Materials Library" description="Visibility and updates for educational content.">
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="min-w-full table-fixed text-left text-sm">
              <thead className="bg-slate-50 text-xs font-bold uppercase tracking-normal text-slate-500">
                <tr>
                  <th className="w-[34%] px-4 py-3">Content</th>
                  <th className="w-[18%] px-4 py-3">Type</th>
                  <th className="w-[18%] px-4 py-3">Visibility</th>
                  <th className="w-[18%] px-4 py-3">Updated</th>
                  <th className="w-[12%] px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {managedMaterials.map((material) => (
                  <tr key={material.id} className="transition hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <p className="font-bold text-ink">{material.title}</p>
                      <p className="text-xs font-medium text-muted">{material.club}</p>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-600">{prettyLabel(material.type)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={material.visibility.toLowerCase() as "public" | "assigned"} />
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-600">{material.updatedAt}</td>
                    <td className="px-4 py-3">
                      <button className="h-8 rounded-md border border-slate-200 px-3 text-xs font-bold text-slate-700 transition hover:bg-slate-50" type="button" onClick={() => toggleMaterialVisibility(material.id)}>
                        Toggle
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    );
  }

  function renderAnnouncements() {
    return (
      <div className="grid gap-5 xl:grid-cols-[0.75fr_1.25fr]">
        <Panel title="Publish Announcement" description="Create events, banners, and center updates.">
          <form className="grid gap-3" onSubmit={handlePublishAnnouncement}>
            <label className="grid gap-1.5 text-sm font-bold text-ink">
              Title
              <input className="h-10 rounded-md border border-slate-200 px-3 text-sm font-medium outline-none transition focus:border-primary focus:ring-4 focus:ring-teal-100" value={announcementTitle} onChange={(event) => setAnnouncementTitle(event.target.value)} placeholder="Announcement title" />
            </label>
            <label className="grid gap-1.5 text-sm font-bold text-ink">
              Type
              <select className="h-10 rounded-md border border-slate-200 px-3 text-sm font-medium outline-none transition focus:border-primary focus:ring-4 focus:ring-teal-100" value={announcementType} onChange={(event) => setAnnouncementType(event.target.value as AnnouncementType)}>
                {announcementTypes.map((type) => (
                  <option key={type} value={type}>
                    {prettyLabel(type)}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1.5 text-sm font-bold text-ink">
              Message
              <textarea className="min-h-32 rounded-md border border-slate-200 px-3 py-2 text-sm font-medium outline-none transition focus:border-primary focus:ring-4 focus:ring-teal-100" value={announcementBody} onChange={(event) => setAnnouncementBody(event.target.value)} placeholder="Write the update" />
            </label>
            <button className="mt-2 inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-bold text-white shadow-[0_10px_20px_rgba(15,159,143,0.18)] transition hover:bg-primaryDark" type="submit">
              <Megaphone size={16} aria-hidden="true" />
              Publish
            </button>
          </form>
        </Panel>

        <Panel title="Announcement Feed" description="Published public and internal updates.">
          <div className="grid gap-3">
            {managedAnnouncements.map((announcement) => (
              <article key={announcement.id} className="rounded-lg border border-slate-200 p-4 transition hover:bg-slate-50">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-ink">{announcement.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-muted">{announcement.body}</p>
                  </div>
                  <StatusBadge status={announcement.type} />
                </div>
                <p className="mt-3 text-xs font-bold text-slate-500">{announcement.date}</p>
              </article>
            ))}
          </div>
        </Panel>
      </div>
    );
  }

  function renderAi() {
    return (
      <div className="grid gap-5 xl:grid-cols-[420px_1fr]">
        <AiRecommendationPanel />
        <Panel title="Recommendation Signals" description="How the assistant ranks active clubs.">
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { label: "Age range fit", value: "45 pts", icon: <CalendarDays size={18} aria-hidden="true" /> },
              { label: "Interest overlap", value: "15 pts each", icon: <Sparkles size={18} aria-hidden="true" /> },
              { label: "Open seats", value: "15 pts", icon: <Users size={18} aria-hidden="true" /> }
            ].map((item) => (
              <div key={item.label} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-primary ring-1 ring-slate-200">{item.icon}</div>
                <p className="mt-4 text-sm font-bold text-slate-500">{item.label}</p>
                <p className="mt-1 text-2xl font-bold text-ink">{item.value}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-lg border border-slate-200 p-4">
            <h3 className="font-bold text-ink">Active club pool</h3>
            <div className="mt-3 grid gap-3">
              {managedClubs
                .filter((club) => club.enrollmentStatus !== "closed")
                .map((club) => (
                  <div key={club.id} className="flex flex-wrap items-center justify-between gap-3 rounded-md bg-slate-50 px-3 py-3">
                    <div>
                      <p className="font-bold text-ink">{club.name}</p>
                      <p className="text-xs font-semibold text-muted">
                        {club.category} · {club.ageGroup}
                      </p>
                    </div>
                    <StatusBadge status={club.enrollmentStatus} />
                  </div>
                ))}
            </div>
          </div>
        </Panel>
      </div>
    );
  }

  function renderSettings() {
    return (
      <Panel title="Center Settings" description="Operational switches for the admin workspace.">
        <div className="grid gap-3">
          {[
            { key: "weeklyReports" as const, label: "Weekly report digest", description: "Prepare a report summary for administrators every Monday." },
            { key: "applicationAlerts" as const, label: "Application alerts", description: "Notify staff when new registrations arrive." },
            { key: "autoCloseFullClubs" as const, label: "Auto-close full clubs", description: "Move clubs to closed when no seats are available." }
          ].map((item) => (
            <label key={item.key} className="flex cursor-pointer items-center justify-between gap-4 rounded-lg border border-slate-200 p-4 transition hover:bg-slate-50">
              <span>
                <span className="block font-bold text-ink">{item.label}</span>
                <span className="mt-1 block text-sm font-medium text-muted">{item.description}</span>
              </span>
              <input
                className="h-5 w-5 accent-primary"
                type="checkbox"
                checked={settingsState[item.key]}
                onChange={(event) => setSettingsState((current) => ({ ...current, [item.key]: event.target.checked }))}
              />
            </label>
          ))}
        </div>
      </Panel>
    );
  }

  const sectionContent: Record<AdminSection, ReactNode> = {
    dashboard: renderDashboard(),
    users: renderUsers(),
    clubs: renderClubs(),
    applications: renderApplications(),
    content: renderContent(),
    announcements: renderAnnouncements(),
    ai: renderAi(),
    settings: renderSettings()
  };

  return (
    <AppShell
      role="administrator"
      title={sectionTitles[activeSection]}
      actions={
        <>
          <button className="hidden h-10 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 lg:inline-flex" type="button">
            <CalendarDays size={16} aria-hidden="true" />
            May 25 - May 31, 2026
          </button>
          <button className="hidden h-10 items-center gap-2 rounded-md bg-primary px-3 text-sm font-bold text-white shadow-[0_10px_20px_rgba(15,159,143,0.18)] transition hover:bg-primaryDark sm:inline-flex" type="button" onClick={openClubCreator}>
            <CalendarPlus size={16} aria-hidden="true" />
            Create club
          </button>
          <button className="flex h-10 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50" type="button" onClick={exportReport}>
            <Download size={16} aria-hidden="true" />
            <span className="hidden xl:inline">Export report</span>
          </button>
        </>
      }
    >
      <div className="mb-5 hidden items-center justify-between gap-4 md:flex">
        <div>
          <p className="text-sm font-bold text-primaryDark">Digital Urpaq admin workspace</p>
          <h1 className="mt-1 text-2xl font-bold text-ink">{sectionTitles[activeSection]}</h1>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 shadow-sm">
            <FileCheck2 className="text-primary" size={18} aria-hidden="true" />
            {statusCounts.new + statusCounts.pending} applications need attention
          </div>
          <div
            className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold shadow-sm ${
              dataSource === "api" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-amber-200 bg-amber-50 text-amber-700"
            }`}
          >
            <span className={`h-2 w-2 rounded-full ${isSyncing ? "bg-slate-400" : dataSource === "api" ? "bg-emerald-500" : "bg-amber-500"}`} />
            {isSyncing ? "Syncing data..." : dataSource === "api" ? "Live API" : "Demo data"}
          </div>
        </div>
      </div>

      {dataNotice ? (
        <div className="mb-5 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 shadow-sm">
          {dataNotice}
        </div>
      ) : null}

      {sectionContent[activeSection]}
    </AppShell>
  );
}
