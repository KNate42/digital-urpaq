import type {
  Announcement,
  AnnouncementType,
  Application,
  ApplicationStatus,
  Club,
  ContentType,
  EnrollmentStatus,
  ManagedUser,
  Material,
  Recommendation,
  UserRole
} from "../types";

const API_URL = import.meta.env.VITE_API_URL ?? `${window.location.protocol}//${window.location.hostname}:8000/api`;
const TOKEN_KEY = "digital_urpaq_token";

export const API_UNAVAILABLE_MESSAGE =
  "Backend API is unavailable. Start the backend on port 8000.";

interface ApiRecommendation {
  club_id: number;
  club_name: string;
  category: string;
  score: number;
  explanation: string;
}

interface ApiClub {
  id: number;
  name: string;
  description: string;
  category: string;
  age_min: number;
  age_max: number;
  age_group: string;
  teacher_id: number | null;
  teacher_name: string | null;
  schedule: string;
  classroom: string;
  available_seats: number;
  enrollment_status: EnrollmentStatus;
  created_at: string;
  updated_at: string;
}

interface ApiApplication {
  id: number;
  applicant_id: number | null;
  club_id: number;
  club_name: string | null;
  applicant_email: string | null;
  student_full_name: string;
  age: number;
  contacts: string;
  comment: string | null;
  status: ApplicationStatus;
  created_at: string;
  updated_at: string;
}

interface ApiContent {
  id: number;
  title: string;
  description: string | null;
  content_type: ContentType;
  body: string | null;
  url: string | null;
  club_id: number | null;
  club_name: string | null;
  author_id: number | null;
  author_name: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

interface ApiAnnouncement {
  id: number;
  title: string;
  body: string;
  announcement_type: AnnouncementType;
  published: boolean;
  author_id: number | null;
  author_name: string | null;
  created_at: string;
  updated_at: string;
}

interface ApiUser {
  id: number;
  email: string;
  full_name: string;
  phone: string | null;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

export interface ClubWritePayload {
  name: string;
  description: string;
  category: string;
  ageMin: number;
  ageMax: number;
  teacherId?: number | null;
  schedule: string;
  classroom: string;
  availableSeats: number;
  enrollmentStatus: EnrollmentStatus;
}

export interface MaterialWritePayload {
  title: string;
  description?: string | null;
  type: ContentType;
  body?: string | null;
  url?: string | null;
  clubId?: number | null;
  isPublic: boolean;
}

export interface AnnouncementWritePayload {
  title: string;
  body: string;
  type: AnnouncementType;
  published: boolean;
}

function dateOnly(value: string): string {
  return value.slice(0, 10);
}

function mapClub(item: ApiClub): Club {
  return {
    id: item.id,
    name: item.name,
    description: item.description,
    category: item.category,
    ageGroup: item.age_group,
    teacher: item.teacher_name ?? "Unassigned",
    schedule: item.schedule,
    classroom: item.classroom,
    availableSeats: item.available_seats,
    enrollmentStatus: item.enrollment_status
  };
}

function mapApplication(item: ApiApplication): Application {
  return {
    id: item.id,
    studentFullName: item.student_full_name,
    age: item.age,
    contacts: item.contacts,
    selectedClub: item.club_name ?? `Club #${item.club_id}`,
    comment: item.comment ?? "",
    status: item.status,
    submittedAt: dateOnly(item.created_at)
  };
}

function mapMaterial(item: ApiContent): Material {
  return {
    id: item.id,
    title: item.title,
    description: item.description ?? item.body ?? "No description provided.",
    type: item.content_type,
    club: item.club_name ?? "All clubs",
    visibility: item.is_public ? "Public" : "Assigned",
    updatedAt: dateOnly(item.updated_at)
  };
}

function mapAnnouncement(item: ApiAnnouncement): Announcement {
  return {
    id: item.id,
    title: item.title,
    body: item.body,
    type: item.announcement_type,
    date: dateOnly(item.created_at)
  };
}

function mapUser(item: ApiUser): ManagedUser {
  return {
    id: item.id,
    fullName: item.full_name,
    role: item.role,
    email: item.email,
    phone: item.phone ?? "No phone",
    joinedAt: dateOnly(item.created_at),
    status: item.is_active ? "active" : "paused",
    group: item.role === "administrator" ? "Operations" : "Pending assignment"
  };
}

function toApiClubPayload(payload: Partial<ClubWritePayload>) {
  return {
    ...(payload.name !== undefined ? { name: payload.name } : {}),
    ...(payload.description !== undefined ? { description: payload.description } : {}),
    ...(payload.category !== undefined ? { category: payload.category } : {}),
    ...(payload.ageMin !== undefined ? { age_min: payload.ageMin } : {}),
    ...(payload.ageMax !== undefined ? { age_max: payload.ageMax } : {}),
    ...(payload.teacherId !== undefined ? { teacher_id: payload.teacherId } : {}),
    ...(payload.schedule !== undefined ? { schedule: payload.schedule } : {}),
    ...(payload.classroom !== undefined ? { classroom: payload.classroom } : {}),
    ...(payload.availableSeats !== undefined ? { available_seats: payload.availableSeats } : {}),
    ...(payload.enrollmentStatus !== undefined ? { enrollment_status: payload.enrollmentStatus } : {})
  };
}

function toApiMaterialPayload(payload: Partial<MaterialWritePayload>) {
  return {
    ...(payload.title !== undefined ? { title: payload.title } : {}),
    ...(payload.description !== undefined ? { description: payload.description } : {}),
    ...(payload.type !== undefined ? { content_type: payload.type } : {}),
    ...(payload.body !== undefined ? { body: payload.body } : {}),
    ...(payload.url !== undefined ? { url: payload.url } : {}),
    ...(payload.clubId !== undefined ? { club_id: payload.clubId } : {}),
    ...(payload.isPublic !== undefined ? { is_public: payload.isPublic } : {})
  };
}

function toApiAnnouncementPayload(payload: AnnouncementWritePayload) {
  return {
    title: payload.title,
    body: payload.body,
    announcement_type: payload.type,
    published: payload.published
  };
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export function isApiUnavailableError(error: unknown): boolean {
  return error instanceof Error && error.message === API_UNAVAILABLE_MESSAGE;
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  const token = getToken();

  if (!headers.has("Content-Type") && init.body && !(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, { ...init, headers });
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(API_UNAVAILABLE_MESSAGE);
    }
    throw error;
  }
  if (!response.ok) {
    const detail = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(typeof detail.detail === "string" ? detail.detail : "Request failed");
  }
  if (response.status === 204) {
    return undefined as T;
  }
  return response.json() as Promise<T>;
}

export const api = {
  async currentUser(): Promise<ManagedUser> {
    const response = await request<ApiUser>("/auth/me");
    return mapUser(response);
  },

  async login(email: string, password: string): Promise<UserRole> {
    const body = new URLSearchParams();
    body.set("username", email);
    body.set("password", password);
    const response = await request<{ access_token: string }>("/auth/login", {
      method: "POST",
      body,
      headers: { "Content-Type": "application/x-www-form-urlencoded" }
    });
    setToken(response.access_token);
    const currentUser = await request<ApiUser>("/auth/me");
    return currentUser.role;
  },

  async register(payload: {
    email: string;
    password: string;
    full_name: string;
    phone?: string;
    role: "student" | "parent";
  }): Promise<void> {
    await request("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },

  async listUsers(): Promise<ManagedUser[]> {
    const response = await request<ApiUser[]>("/users");
    return response.map(mapUser);
  },

  async updateUser(id: number, payload: { isActive?: boolean; role?: UserRole; fullName?: string; phone?: string | null }): Promise<ManagedUser> {
    const response = await request<ApiUser>(`/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify({
        ...(payload.isActive !== undefined ? { is_active: payload.isActive } : {}),
        ...(payload.role !== undefined ? { role: payload.role } : {}),
        ...(payload.fullName !== undefined ? { full_name: payload.fullName } : {}),
        ...(payload.phone !== undefined ? { phone: payload.phone } : {})
      })
    });
    return mapUser(response);
  },

  async listClubs(): Promise<Club[]> {
    const response = await request<ApiClub[]>("/clubs");
    return response.map(mapClub);
  },

  async readClub(id: number): Promise<Club> {
    const response = await request<ApiClub>(`/clubs/${id}`);
    return mapClub(response);
  },

  async createClub(payload: ClubWritePayload): Promise<Club> {
    const response = await request<ApiClub>("/clubs", {
      method: "POST",
      body: JSON.stringify(toApiClubPayload(payload))
    });
    return mapClub(response);
  },

  async updateClub(id: number, payload: Partial<ClubWritePayload>): Promise<Club> {
    const response = await request<ApiClub>(`/clubs/${id}`, {
      method: "PUT",
      body: JSON.stringify(toApiClubPayload(payload))
    });
    return mapClub(response);
  },

  async listApplications(): Promise<Application[]> {
    const response = await request<ApiApplication[]>("/applications");
    return response.map(mapApplication);
  },

  async createApplication(payload: {
    studentFullName: string;
    age: number;
    contacts: string;
    clubId: number;
    comment?: string | null;
  }): Promise<Application> {
    const response = await request<ApiApplication>("/applications", {
      method: "POST",
      body: JSON.stringify({
        student_full_name: payload.studentFullName,
        age: payload.age,
        contacts: payload.contacts,
        club_id: payload.clubId,
        comment: payload.comment ?? null
      })
    });
    return mapApplication(response);
  },

  async updateApplicationStatus(id: number, status: ApplicationStatus): Promise<Application> {
    const response = await request<ApiApplication>(`/applications/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status })
    });
    return mapApplication(response);
  },

  async listMaterials(): Promise<Material[]> {
    const response = await request<ApiContent[]>("/content/assigned");
    return response.map(mapMaterial);
  },

  async listPublicMaterials(): Promise<Material[]> {
    const response = await request<ApiContent[]>("/content");
    return response.map(mapMaterial);
  },

  async createMaterial(payload: MaterialWritePayload): Promise<Material> {
    const response = await request<ApiContent>("/content", {
      method: "POST",
      body: JSON.stringify(toApiMaterialPayload(payload))
    });
    return mapMaterial(response);
  },

  async updateMaterial(id: number, payload: Partial<MaterialWritePayload>): Promise<Material> {
    const response = await request<ApiContent>(`/content/${id}`, {
      method: "PUT",
      body: JSON.stringify(toApiMaterialPayload(payload))
    });
    return mapMaterial(response);
  },

  async listAnnouncements(): Promise<Announcement[]> {
    const response = await request<ApiAnnouncement[]>("/announcements");
    return response.map(mapAnnouncement);
  },

  async createAnnouncement(payload: AnnouncementWritePayload): Promise<Announcement> {
    const response = await request<ApiAnnouncement>("/announcements", {
      method: "POST",
      body: JSON.stringify(toApiAnnouncementPayload(payload))
    });
    return mapAnnouncement(response);
  },

  async recommend(payload: { age: number; interests: string[]; skills: string[] }): Promise<Recommendation[]> {
    const response = await request<{ recommendations: ApiRecommendation[] }>("/ai/recommend", {
      method: "POST",
      body: JSON.stringify(payload)
    });
    return response.recommendations.map((item) => ({
      clubId: item.club_id,
      clubName: item.club_name,
      category: item.category,
      score: item.score,
      explanation: item.explanation
    }));
  }
};
