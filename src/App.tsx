import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import Landing from '@/pages/Landing';
import SignIn from '@/pages/SignIn';
import SignUp from '@/pages/SignUp';
import Dashboard from '@/pages/Dashboard';
import Attendance from '@/pages/Attendance';
import Assignments from '@/pages/Assignments';
import Analytics from '@/pages/Analytics';
import AI from '@/pages/AI';
import Scanner from '@/pages/Scanner';
import Profile from '@/pages/Profile';
import Settings from '@/pages/Settings';
import Subjects from '@/pages/Subjects';
import Semesters from '@/pages/Semesters';
import Timetable from '@/pages/Timetable';
import AttendanceCalendar from '@/pages/AttendanceCalendar';
import ProtectedRoute from '@/components/ProtectedRoute';
import OnboardingWizard from '@/components/OnboardingWizard';

function AppRoutes() {
  const { initializing, needsOnboarding } = useAuth();

  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/assignments" element={<Assignments />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/ai" element={<AI />} />
          <Route path="/scanner" element={<Scanner />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/subjects" element={<Subjects />} />
          <Route path="/semesters" element={<Semesters />} />
          <Route path="/timetable" element={<Timetable />} />
          <Route path="/calendar" element={<AttendanceCalendar />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {needsOnboarding && <OnboardingWizard />}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
