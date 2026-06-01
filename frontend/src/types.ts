export type UserRole = "student" | "parent" | "teacher" | "administrator";
export type ApplicationStatus = "new" | "pending" | "approved" | "rejected";
export type EnrollmentStatus = "open" | "waitlist" | "closed";
export type ContentType = "article" | "video" | "presentation" | "attachment" | "homework";
export type AnnouncementType = "announcement" | "event" | "banner" | "success_story";
export type ManagedUserStatus = "active" | "invited" | "paused";

export interface Club {
  id: number;
  name: string;
  description: string;
  category: string;
  ageGroup: string;
  teacher: string;
  schedule: string;
  classroom: string;
  availableSeats: number;
  enrollmentStatus: EnrollmentStatus;
}

export interface Application {
  id: number;
  studentFullName: string;
  age: number;
  contacts: string;
  selectedClub: string;
  comment: string;
  status: ApplicationStatus;
  submittedAt: string;
}

export interface Material {
  id: number;
  title: string;
  description: string;
  type: ContentType;
  club: string;
  visibility: "Public" | "Assigned";
  updatedAt: string;
}

export interface Announcement {
  id: number;
  title: string;
  body: string;
  type: AnnouncementType;
  date: string;
}

export interface Recommendation {
  clubId: number;
  clubName: string;
  category: string;
  score: number;
  explanation: string;
}

export interface ManagedUser {
  id: number;
  fullName: string;
  role: UserRole;
  email: string;
  phone: string;
  joinedAt: string;
  status: ManagedUserStatus;
  group: string;
}
