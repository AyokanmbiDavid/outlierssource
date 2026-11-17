
import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import { ProfileProvider } from "./context/ProfileContext";
import NotificationPanel from "./components/NotificationPanel";


const LoginSignIn = lazy(() => import("./pages/LoginSignIn.jsx"));
const AdminLogin = lazy(() => import("./pages/AdminLogin.jsx"));
const Home = lazy(() => import("./pages/Home.jsx"));
const Classes = lazy(() => import("./pages/Classes.jsx"));
const ClassDetails = lazy(() => import("./pages/ClassDetails.jsx"));
const Materials = lazy(() => import("./pages/Materials.jsx"));
const Schedule = lazy(() => import("./pages/Schedule.jsx"));
const Profile = lazy(() => import("./pages/Profile.jsx"));
const Events = lazy(() => import("./pages/Events.jsx"));const Settings = lazy(() => import("./pages/Settings.jsx"));
const AnnouncementDetails = lazy(() => import("./pages/AnnouncementDetails.jsx"));
const Notifications = lazy(() =>
  import("./pages/Notifications.jsx")
);
const Announcements = lazy(() =>
  import("./pages/Announcements.jsx")
);

const StudentLayout = lazy(() =>
  import("./layouts/StudentLayout.jsx")
);

const AdminDashboard = lazy(() =>
  import("./admin/AdminDashboard.jsx")
);

const AdminLayout = lazy(() => import("./layouts/AdminLayout.jsx"));
const ManageStudents = lazy(() => import("./admin/ManageStudents.jsx"));
const ManageClasses = lazy(() => import("./admin/ManageClasses.jsx"));
const ManageMaterials = lazy(() => import("./admin/ManageMaterials.jsx"));
const ManageAnnouncements = lazy(() => import("./admin/ManageAnnouncements.jsx"));
const ManageSchedule = lazy(() => import("./admin/ManageSchedule.jsx"));
const ManageCourses = lazy(() => import("./admin/ManageCourses.jsx"));
const ManageTimetable = lazy(() => import("./admin/ManageTimetable.jsx"));

export default function App() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen grid place-items-center bg-[#F5F8F6]">
          <span className="font-semibold text-[#176D68]">
            OutliersSource
          </span>
        </div>
      }
    >
      <AuthProvider>
        <ProfileProvider>
        
      <Routes>
        {/* Authentication */}
        <Route path="/sign" element={<LoginSignIn />} />
        <Route path="/admin/login" element={<AdminLogin />} />

        <Route element={<ProtectedRoute />}>
        {/* Student portal — shared layout */}
        <Route element={<StudentLayout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/courses" element={<Classes />} />
          <Route path="/courses/:id" element={<ClassDetails />} />
          <Route path="/materials" element={<Materials />} />
          <Route path="/announcements" element={<Announcements />} />
          <Route path="/schedule" element={<Schedule />} />
         <Route path="/announcements" element={<Announcements />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/events" element={<Events />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/announcements/:id" element={<AnnouncementDetails />} />
        </Route>
        </Route>
        
        <Route element={<AdminProtectedRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="students" element={<ManageStudents />} />
          <Route path="classes" element={<ManageClasses />} />
          <Route path="materials" element={<ManageMaterials />} />
          <Route path="announcements" element={<ManageAnnouncements />} />
          <Route path="schedule" element={<ManageSchedule />} />
          <Route path="/admin/courses" element={<ManageCourses />}/>
          <Route path="/admin/timetable" element={<ManageTimetable />} />
          </Route>
        </Route>
      

        <Route path="/" element={<Navigate to="/sign" replace />} />
        <Route path="*" element={<Navigate to="/sign" replace />} />
      </Routes>
        </ProfileProvider>
        </AuthProvider>
        
    </Suspense>
  );
}
