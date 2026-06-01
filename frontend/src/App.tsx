import type { ReactNode } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";

import { getToken } from "./api/client";
import { AdminDashboard } from "./pages/AdminDashboard";
import { ClubDetailsPage } from "./pages/ClubDetailsPage";
import { LoginPage } from "./pages/LoginPage";
import { PublicHome } from "./pages/PublicHome";
import { RegisterPage } from "./pages/RegisterPage";
import { StudentDashboard } from "./pages/StudentDashboard";
import { TeacherDashboard } from "./pages/TeacherDashboard";

function RequireAuth({ children }: { children: ReactNode }) {
  return getToken() ? <>{children}</> : <Navigate to="/login" replace />;
}

export const router = createBrowserRouter([
  { path: "/", element: <PublicHome /> },
  { path: "/clubs/:id", element: <ClubDetailsPage /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },
  {
    path: "/student",
    element: (
      <RequireAuth>
        <StudentDashboard />
      </RequireAuth>
    )
  },
  {
    path: "/teacher",
    element: (
      <RequireAuth>
        <TeacherDashboard />
      </RequireAuth>
    )
  },
  {
    path: "/admin",
    element: (
      <RequireAuth>
        <AdminDashboard />
      </RequireAuth>
    )
  },
  { path: "*", element: <Navigate to="/" replace /> }
]);
