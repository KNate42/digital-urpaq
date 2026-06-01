import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { useSearchParams } from "react-router-dom";
import {
  BarChart3,
  BookOpen,
  CalendarDays,
  CalendarPlus,
  CheckCircle2,
  Download,
  FileCheck2,
  GraduationCap,
  Mail,
  Megaphone,
  Plus,
  Search,
  Sparkles,
  Users,
  XCircle
} from "lucide-react";

import { api, isApiUnavailableError } from "../api/client";
import { AiRecommendationPanel } from "../components/AiRecommendationPanel";
import { EmptyState } from "../components/EmptyState";
import { MetricCard } from "../components/MetricCard";
import { StatusBadge } from "../components/StatusBadge";
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
const contentTypes: ContentType[] = ["article", "video", "presentation", "attachment", "homework"];
const announcementTypes: AnnouncementType[] = ["announcement", "event", "banner", "success_story"];

function parseSection(value: string | null): AdminSection {
  return value && validSections.has(value as AdminSection) ? (value as AdminSection) : "dashboard";
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

function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
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

function SegmentedButton({ active, children, onClick }: { active: boolean; children: ReactNode; onClick: () => void }) {
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

function SearchBox({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder: string }) {
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

function MiniBar({ label, value, max }: { label: string; value: number; max: number }) {
  const width = max > 0 ? Math.max(8, Math.min(100, (value / max) * 100)) : 0;

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
    return <EmptyState title="No applications yet" description="Student applications will appear here after they are submitted." />;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
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
                <p className="text-xs font-medium text-muted">{application.comment || "No comment"}</p>
              </td>
              {!compact ? <td className="px-4 py-3 font-semibold text-slate-600">{application.submittedAt}</td> : null}
              <td className="px-4 py-3">
                <StatusBadge status={application.status} />
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap items-center gap-2">
                  <button className="h-8 rounded-md border border-primary px-3 text-xs font-bold text-primaryDark transition hover:bg-teal-50" type="button" onClick={() => onStatusChange(application.id, "pending")}>
                    Review
                  </button>
                  <button className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-600 text-white transition hover:bg-emerald-700" type="button" aria-label={`Approve ${application.studentFullName}`} onClick={() => onStatusChange(application.id, "approved")}>
                    <CheckCircle2 size={16} aria-hidden="true" />
                  </button>
                  <button className="flex h-8 w-8 items-center justify-center rounded-md bg-rose-600 text-white transition hover:bg-rose-700" type="button" aria-label={`Reject ${application.studentFullName}`} onClick={() => onStatusChange(application.id, "rejected")}>
                    <XCircle size={16} aria-hidden="true" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function AdminDashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeSection = parseSection(searchParams.get("section"));

  const [applications, setApplications] = useState<Application[]>([]);
  const [managedClubs, setManagedClubs] = useState<Club[]>([]);
  const [managedMaterials, setManagedMaterials] = useState<Material[]>([]);
  const [managedAnnouncements, setManagedAnnouncements] = useState<Announcement[]>([]);
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [dataSource, setDataSource] = useState<"api" | "partial" | "unavailable">("unavailable");
  const [dataNotice, setDataNotice] = useState("");
  const [isSyncing, setIsSyncing] = useState(true);

  const [applicationFilter, setApplicationFilter] = useState<"all" | ApplicationStatus>("all");
  const [applicationSearch, setApplicationSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState<"all" | AdminUserRole>("all");
  const [userSearch, setUserSearch] = useState("");

  const [clubName, setClubName] = useState("");
  const [clubDescription, setClubDescription] = useState("");
  const [clubCategory, setClubCategory] = useState("");
  const [clubAgeMin, setClubAgeMin] = useState(10);
  const [clubAgeMax, setClubAgeMax] = useState(16);
  const [clubSchedule, setClubSchedule] = useState("");
  const [clubClassroom, setClubClassroom] = useState("");
  const [clubSeats, setClubSeats] = useState(0);

  const [materialTitle, setMaterialTitle] = useState("");
  const [materialType, setMaterialType] = useState<ContentType>("article");
  const [materialClubId, setMaterialClubId] = useState("");
  const [materialDescription, setMaterialDescription] = useState("");
  const [materialIsPublic, setMaterialIsPublic] = useState(false);

  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementBody, setAnnouncementBody] = useState("");
  const [announcementType, setAnnouncementType] = useState<AnnouncementType>("announcement");

  async function loadAdminData() {
    setIsSyncing(true);
    const [usersResult, clubsResult, applicationsResult, materialsResult, announcementsResult] = await Promise.allSettled([
      api.listUsers(),
      api.listClubs(),
      api.listApplications(),
      api.listMaterials(),
      api.listAnnouncements()
    ]);

    let syncedCount = 0;
    if (usersResult.status === "fulfilled") {
      setUsers(usersResult.value);
      syncedCount += 1;
    } else {
      setUsers([]);
    }
    if (clubsResult.status === "fulfilled") {
      setManagedClubs(clubsResult.value);
      syncedCount += 1;
    } else {
      setManagedClubs([]);
    }
    if (applicationsResult.status === "fulfilled") {
      setApplications(applicationsResult.value);
      syncedCount += 1;
    } else {
      setApplications([]);
    }
    if (materialsResult.status === "fulfilled") {
      setManagedMaterials(materialsResult.value);
      syncedCount += 1;
    } else {
      setManagedMaterials([]);
    }
    if (announcementsResult.status === "fulfilled") {
      setManagedAnnouncements(announcementsResult.value);
      syncedCount += 1;
    } else {
      setManagedAnnouncements([]);
    }

    const failures = [usersResult, clubsResult, applicationsResult, materialsResult, announcementsResult].filter(
      (result): result is PromiseRejectedResult => result.status === "rejected"
    );
    const apiUnavailable = failures.some((result) => isApiUnavailableError(result.reason));
    setDataSource(syncedCount === 5 ? "api" : syncedCount > 0 ? "partial" : "unavailable");
    setDataNotice(
      syncedCount === 5
        ? "Live API connected. All dashboard sections are synced from backend."
        : apiUnavailable
          ? "Backend is unavailable. No local records are shown."
          : "Some protected data is unavailable. Sign in as administrator to view and manage it."
    );
    setIsSyncing(false);
  }

  useEffect(() => {
    loadAdminData();
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

  function showMutationError(error: unknown) {
    setDataNotice(isApiUnavailableError(error) ? "Backend is unavailable. No local changes were saved." : error instanceof Error ? error.message : "Action failed.");
  }

  async function updateStatus(id: number, status: ApplicationStatus) {
    try {
      const updatedApplication = await api.updateApplicationStatus(id, status);
      setApplications((current) => current.map((application) => (application.id === id ? updatedApplication : application)));
      setDataSource("api");
      setDataNotice("Application status saved.");
    } catch (error) {
      showMutationError(error);
    }
  }

  async function handleCreateClub(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const createdClub = await api.createClub({
        name: clubName.trim(),
        description: clubDescription.trim(),
        category: clubCategory.trim(),
        ageMin: clubAgeMin,
        ageMax: clubAgeMax,
        teacherId: null,
        schedule: clubSchedule.trim(),
        classroom: clubClassroom.trim(),
        availableSeats: clubSeats,
        enrollmentStatus: "open"
      });
      setManagedClubs((current) => [createdClub, ...current]);
      setClubName("");
      setClubDescription("");
      setClubCategory("");
      setClubAgeMin(10);
      setClubAgeMax(16);
      setClubSchedule("");
      setClubClassroom("");
      setClubSeats(0);
      setDataSource("api");
      setDataNotice("Club created.");
    } catch (error) {
      showMutationError(error);
    }
  }

  async function cycleClubStatus(club: Club) {
    const currentIndex = clubStatusOrder.indexOf(club.enrollmentStatus);
    const enrollmentStatus = clubStatusOrder[(currentIndex + 1) % clubStatusOrder.length];
    const [ageMin, ageMax] = club.ageGroup.split("-").map(Number);
    try {
      const updatedClub = await api.updateClub(club.id, {
        name: club.name,
        description: club.description,
        category: club.category,
        ageMin,
        ageMax,
        teacherId: null,
        schedule: club.schedule,
        classroom: club.classroom,
        availableSeats: club.availableSeats,
        enrollmentStatus
      });
      setManagedClubs((current) => current.map((item) => (item.id === club.id ? updatedClub : item)));
      setDataNotice("Club status saved.");
    } catch (error) {
      showMutationError(error);
    }
  }

  async function increaseClubSeats(club: Club) {
    const [ageMin, ageMax] = club.ageGroup.split("-").map(Number);
    try {
      const updatedClub = await api.updateClub(club.id, {
        name: club.name,
        description: club.description,
        category: club.category,
        ageMin,
        ageMax,
        teacherId: null,
        schedule: club.schedule,
        classroom: club.classroom,
        availableSeats: club.availableSeats + 1,
        enrollmentStatus: club.enrollmentStatus
      });
      setManagedClubs((current) => current.map((item) => (item.id === club.id ? updatedClub : item)));
      setDataNotice("Seat count saved.");
    } catch (error) {
      showMutationError(error);
    }
  }

  async function handleAddMaterial(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const createdMaterial = await api.createMaterial({
        title: materialTitle.trim(),
        description: materialDescription.trim() || null,
        type: materialType,
        clubId: materialClubId ? Number(materialClubId) : null,
        isPublic: materialIsPublic
      });
      setManagedMaterials((current) => [createdMaterial, ...current]);
      setMaterialTitle("");
      setMaterialDescription("");
      setMaterialClubId("");
      setMaterialIsPublic(false);
      setDataNotice("Material saved.");
    } catch (error) {
      showMutationError(error);
    }
  }

  async function toggleMaterialVisibility(material: Material) {
    try {
      const updatedMaterial = await api.updateMaterial(material.id, { isPublic: material.visibility !== "Public" });
      setManagedMaterials((current) => current.map((item) => (item.id === material.id ? updatedMaterial : item)));
      setDataNotice("Material visibility saved.");
    } catch (error) {
      showMutationError(error);
    }
  }

  async function handlePublishAnnouncement(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const createdAnnouncement = await api.createAnnouncement({
        title: announcementTitle.trim(),
        body: announcementBody.trim(),
        type: announcementType,
        published: true
      });
      setManagedAnnouncements((current) => [createdAnnouncement, ...current]);
      setAnnouncementTitle("");
      setAnnouncementBody("");
      setAnnouncementType("announcement");
      setDataNotice("Announcement published.");
    } catch (error) {
      showMutationError(error);
    }
  }

  async function toggleUserStatus(user: ManagedUser) {
    try {
      const updatedUser = await api.updateUser(user.id, { isActive: user.status !== "paused" ? false : true });
      setUsers((current) => current.map((item) => (item.id === user.id ? updatedUser : item)));
      setDataNotice("User status saved.");
    } catch (error) {
      showMutationError(error);
    }
  }

  function exportReport() {
    const rows = [
      ["Metric", "Value"],
      ["Users", String(users.length)],
      ["Clubs", String(managedClubs.length)],
      ["Applications", String(applications.length)],
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
          <MetricCard label="Users" value={String(users.length)} change="Synced users" tone="teal" icon={<Users size={22} aria-hidden="true" />} />
          <MetricCard label="Active Clubs" value={String(managedClubs.filter((club) => club.enrollmentStatus !== "closed").length)} change="Open or waitlist" tone="emerald" icon={<CalendarDays size={22} aria-hidden="true" />} />
          <MetricCard label="New Applications" value={String(statusCounts.new)} change={`${statusCounts.pending} pending`} tone="amber" icon={<FileCheck2 size={22} aria-hidden="true" />} />
          <MetricCard label="Approved" value={String(statusCounts.approved)} change="Approved applications" tone="blue" icon={<CheckCircle2 size={22} aria-hidden="true" />} />
          <MetricCard label="Materials" value={String(managedMaterials.length)} change="Content records" tone="teal" icon={<BookOpen size={22} aria-hidden="true" />} />
        </section>

        <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_390px]">
          <div className="grid min-w-0 gap-5">
            <Panel title="Recent Applications" description="Latest application records from backend.">
              <ApplicationsTable applications={applications.slice(0, 5)} onStatusChange={updateStatus} compact />
            </Panel>

            <div className="grid gap-5 xl:grid-cols-2">
              <Panel title="Club Overview" description="Published clubs and enrollment status.">
                {managedClubs.length ? (
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
                  </div>
                ) : (
                  <EmptyState title="No clubs yet" description="Create the first club to open enrollment." />
                )}
              </Panel>

              <Panel title="Announcements" description="Published news and center updates.">
                {managedAnnouncements.length ? (
                  <div className="grid gap-3">
                    {managedAnnouncements.slice(0, 4).map((announcement) => (
                      <article key={announcement.id} className="flex gap-3 rounded-md border border-slate-200 px-3 py-3">
                        <Megaphone className="mt-0.5 shrink-0 text-primary" size={20} aria-hidden="true" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-bold text-ink">{announcement.title}</p>
                          <p className="line-clamp-2 text-xs font-medium text-muted">{announcement.body}</p>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <EmptyState title="No announcements yet" description="Published announcements will appear here." />
                )}
              </Panel>
            </div>
          </div>

          <AiRecommendationPanel className="xl:sticky xl:top-24 xl:self-start" />
        </section>

        <Panel title="Analytics Overview" description="Only real backend records are counted here.">
          <div className="grid gap-5 xl:grid-cols-[1fr_1fr]">
            <div className="rounded-lg border border-slate-200 p-4">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-ink">Applications by Status</p>
                  <p className="text-xs font-semibold text-muted">Current backend records</p>
                </div>
                <BarChart3 className="text-primary" size={20} aria-hidden="true" />
              </div>
              <div className="grid gap-3">
                {applicationFilters
                  .filter((status): status is ApplicationStatus => status !== "all")
                  .map((status) => (
                    <MiniBar key={status} label={prettyLabel(status)} value={statusCounts[status]} max={applications.length} />
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
              {topClubs.length ? (
                <div className="grid gap-3">
                  {topClubs.map((club) => (
                    <MiniBar key={club.id} label={club.name} value={club.availableSeats} max={topClubs[0]?.availableSeats ?? 0} />
                  ))}
                </div>
              ) : (
                <EmptyState title="No capacity data yet" description="Create clubs to see capacity analytics." />
              )}
            </div>
          </div>
        </Panel>
      </div>
    );
  }

  function renderUsers() {
    return (
      <Panel title="User Directory" description="Manage students, parents, teachers, and administrators.">
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

        {filteredUsers.length ? (
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="min-w-full table-fixed text-left text-sm">
              <thead className="bg-slate-50 text-xs font-bold uppercase tracking-normal text-slate-500">
                <tr>
                  <th className="w-[30%] px-4 py-3">User</th>
                  <th className="w-[18%] px-4 py-3">Role</th>
                  <th className="w-[22%] px-4 py-3">Group</th>
                  <th className="w-[16%] px-4 py-3">Status</th>
                  <th className="w-[14%] px-4 py-3">Actions</th>
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
                        <button className="h-8 rounded-md border border-slate-200 px-3 text-xs font-bold text-slate-700 transition hover:bg-slate-50" type="button" onClick={() => toggleUserStatus(user)}>
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
        ) : (
          <EmptyState title="No users available" description="Sign in as administrator to load users. A clean database starts with only the bootstrap admin account." />
        )}
      </Panel>
    );
  }

  function renderClubs() {
    return (
      <div className="grid gap-5 xl:grid-cols-[0.75fr_1.25fr]">
        <Panel title="Create Club" description="Add a program and publish it to enrollment.">
          <form className="grid gap-3" onSubmit={handleCreateClub}>
            <label className="grid gap-1.5 text-sm font-bold text-ink">
              Club name
              <input className="h-10 rounded-md border border-slate-200 px-3 text-sm font-medium outline-none transition focus:border-primary focus:ring-4 focus:ring-teal-100" value={clubName} onChange={(event) => setClubName(event.target.value)} required />
            </label>
            <label className="grid gap-1.5 text-sm font-bold text-ink">
              Description
              <textarea className="min-h-24 rounded-md border border-slate-200 px-3 py-2 text-sm font-medium outline-none transition focus:border-primary focus:ring-4 focus:ring-teal-100" value={clubDescription} onChange={(event) => setClubDescription(event.target.value)} required />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-1.5 text-sm font-bold text-ink">
                Category
                <input className="h-10 rounded-md border border-slate-200 px-3 text-sm font-medium outline-none transition focus:border-primary focus:ring-4 focus:ring-teal-100" value={clubCategory} onChange={(event) => setClubCategory(event.target.value)} required />
              </label>
              <label className="grid gap-1.5 text-sm font-bold text-ink">
                Classroom
                <input className="h-10 rounded-md border border-slate-200 px-3 text-sm font-medium outline-none transition focus:border-primary focus:ring-4 focus:ring-teal-100" value={clubClassroom} onChange={(event) => setClubClassroom(event.target.value)} required />
              </label>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <label className="grid gap-1.5 text-sm font-bold text-ink">
                Age min
                <input className="h-10 rounded-md border border-slate-200 px-3 text-sm font-medium outline-none transition focus:border-primary focus:ring-4 focus:ring-teal-100" type="number" min={3} max={25} value={clubAgeMin} onChange={(event) => setClubAgeMin(Number(event.target.value))} required />
              </label>
              <label className="grid gap-1.5 text-sm font-bold text-ink">
                Age max
                <input className="h-10 rounded-md border border-slate-200 px-3 text-sm font-medium outline-none transition focus:border-primary focus:ring-4 focus:ring-teal-100" type="number" min={3} max={25} value={clubAgeMax} onChange={(event) => setClubAgeMax(Number(event.target.value))} required />
              </label>
              <label className="grid gap-1.5 text-sm font-bold text-ink">
                Seats
                <input className="h-10 rounded-md border border-slate-200 px-3 text-sm font-medium outline-none transition focus:border-primary focus:ring-4 focus:ring-teal-100" type="number" min={0} value={clubSeats} onChange={(event) => setClubSeats(Number(event.target.value))} required />
              </label>
            </div>
            <label className="grid gap-1.5 text-sm font-bold text-ink">
              Schedule
              <input className="h-10 rounded-md border border-slate-200 px-3 text-sm font-medium outline-none transition focus:border-primary focus:ring-4 focus:ring-teal-100" value={clubSchedule} onChange={(event) => setClubSchedule(event.target.value)} required />
            </label>
            <button className="mt-2 inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-bold text-white shadow-[0_10px_20px_rgba(15,159,143,0.18)] transition hover:bg-primaryDark" type="submit">
              <Plus size={16} aria-hidden="true" />
              Create club
            </button>
          </form>
        </Panel>

        <Panel title="Club Management" description="Capacity, rooms, teachers, and enrollment status.">
          {managedClubs.length ? (
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
                    <button className="h-9 rounded-md border border-slate-200 px-3 text-sm font-bold text-slate-700 transition hover:bg-white" type="button" onClick={() => cycleClubStatus(club)}>
                      Cycle status
                    </button>
                    <button className="h-9 rounded-md border border-slate-200 px-3 text-sm font-bold text-slate-700 transition hover:bg-white" type="button" onClick={() => increaseClubSeats(club)}>
                      Add seat
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState title="No clubs yet" description="A clean production database starts empty. Create the first club when the center is ready." />
          )}
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
              <input className="h-10 rounded-md border border-slate-200 px-3 text-sm font-medium outline-none transition focus:border-primary focus:ring-4 focus:ring-teal-100" value={materialTitle} onChange={(event) => setMaterialTitle(event.target.value)} required />
            </label>
            <label className="grid gap-1.5 text-sm font-bold text-ink">
              Description
              <textarea className="min-h-24 rounded-md border border-slate-200 px-3 py-2 text-sm font-medium outline-none transition focus:border-primary focus:ring-4 focus:ring-teal-100" value={materialDescription} onChange={(event) => setMaterialDescription(event.target.value)} />
            </label>
            <label className="grid gap-1.5 text-sm font-bold text-ink">
              Club
              <select className="h-10 rounded-md border border-slate-200 px-3 text-sm font-medium outline-none transition focus:border-primary focus:ring-4 focus:ring-teal-100" value={materialClubId} onChange={(event) => setMaterialClubId(event.target.value)}>
                <option value="">All clubs</option>
                {managedClubs.map((club) => (
                  <option key={club.id} value={club.id}>
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
            <label className="flex items-center gap-2 text-sm font-bold text-ink">
              <input className="h-4 w-4 accent-primary" type="checkbox" checked={materialIsPublic} onChange={(event) => setMaterialIsPublic(event.target.checked)} />
              Public material
            </label>
            <button className="mt-2 inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-bold text-white shadow-[0_10px_20px_rgba(15,159,143,0.18)] transition hover:bg-primaryDark" type="submit">
              <BookOpen size={16} aria-hidden="true" />
              Add material
            </button>
          </form>
        </Panel>

        <Panel title="Materials Library" description="Visibility and updates for educational content.">
          {managedMaterials.length ? (
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
                        <button className="h-8 rounded-md border border-slate-200 px-3 text-xs font-bold text-slate-700 transition hover:bg-slate-50" type="button" onClick={() => toggleMaterialVisibility(material)}>
                          Toggle
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState title="No materials yet" description="Materials created by teachers or admins will appear here." />
          )}
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
              <input className="h-10 rounded-md border border-slate-200 px-3 text-sm font-medium outline-none transition focus:border-primary focus:ring-4 focus:ring-teal-100" value={announcementTitle} onChange={(event) => setAnnouncementTitle(event.target.value)} required />
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
              <textarea className="min-h-32 rounded-md border border-slate-200 px-3 py-2 text-sm font-medium outline-none transition focus:border-primary focus:ring-4 focus:ring-teal-100" value={announcementBody} onChange={(event) => setAnnouncementBody(event.target.value)} required />
            </label>
            <button className="mt-2 inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-bold text-white shadow-[0_10px_20px_rgba(15,159,143,0.18)] transition hover:bg-primaryDark" type="submit">
              <Megaphone size={16} aria-hidden="true" />
              Publish
            </button>
          </form>
        </Panel>

        <Panel title="Announcement Feed" description="Published public and internal updates.">
          {managedAnnouncements.length ? (
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
          ) : (
            <EmptyState title="No announcements yet" description="Published announcements will appear here." />
          )}
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
            {managedClubs.filter((club) => club.enrollmentStatus !== "closed").length ? (
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
            ) : (
              <EmptyState title="No active clubs yet" description="Create open or waitlist clubs to enable recommendations." />
            )}
          </div>
        </Panel>
      </div>
    );
  }

  function renderSettings() {
    return (
      <Panel title="Center Settings" description="Operational switches for the admin workspace.">
        <EmptyState title="No persisted settings yet" description="Production settings are managed through environment variables and backend configuration." />
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
          <button className="hidden h-10 items-center gap-2 rounded-md bg-primary px-3 text-sm font-bold text-white shadow-[0_10px_20px_rgba(15,159,143,0.18)] transition hover:bg-primaryDark sm:inline-flex" type="button" onClick={() => setSection("clubs")}>
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
              dataSource === "api"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : dataSource === "partial"
                  ? "border-amber-200 bg-amber-50 text-amber-700"
                  : "border-slate-200 bg-white text-slate-600"
            }`}
          >
            <span className={`h-2 w-2 rounded-full ${isSyncing ? "bg-slate-400" : dataSource === "api" ? "bg-emerald-500" : dataSource === "partial" ? "bg-amber-500" : "bg-slate-400"}`} />
            {isSyncing ? "Syncing data..." : dataSource === "api" ? "Live API" : dataSource === "partial" ? "Partial API" : "No data loaded"}
          </div>
        </div>
      </div>

      {dataNotice ? <div className="mb-5 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 shadow-sm">{dataNotice}</div> : null}

      {sectionContent[activeSection]}
    </AppShell>
  );
}
