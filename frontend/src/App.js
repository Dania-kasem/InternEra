import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { globalStyles } from './theme';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { ActivityProvider } from './context/ActivityContext';

// --- General Pages ---
import LandingPage from './pages/LandingPage';
import Login from './pages/Login'; // Unified login page
import ForgotPassword from './pages/ForgotPassword';
import PrivateRoute from "./components/PrivateRoute"; // Admin route protection

// --- Student Pages ---
import StudentRegister from './pages/student/StudentRegister';
import StudentProfile from './pages/student/StudentProfile';
import SearchInternships from './pages/student/SearchInternships';
import Dashboard from './pages/student/Dashboard';
import TrackApplications from './pages/student/TrackApplications';
import UploadCV from './pages/student/UploadCV';
import InternshipDetails from './pages/student/InternshipDetails';
import ApplyPage from './pages/student/ApplyPage';
import StudentReport from './pages/student/StudentReport';
import CompanyProfileView from './pages/student/CompanyProfileView';

// --- Company Pages ---
import CompanyDashboard from "./pages/company/CompanyDashboard";
import CompanyRegister from './pages/company/CompanyRegister';
import CompanyProfile from './pages/company/CompanyProfile';
import PostInternship from './pages/company/PostInternship';
import ManageInternships from './pages/company/ManageInternships';
import ViewApplicants from './pages/company/ViewApplicants';
import ViewCV from './pages/company/ViewCV';
import Messaging from './pages/company/Messaging';
import CompanyReport from './pages/company/CompanyReport';

// --- Admin Pages ---
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageStudents from "./pages/admin/ManageStudents";
import ManageCompanies from "./pages/admin/ManageCompanies";
import AdminManageInternships from "./pages/admin/ManageInternships";
import ManageApplications from "./pages/admin/ManageApplications";
import GenerateReports from "./pages/admin/GenerateReports";
import VerifyInternships from "./pages/admin/VerifyInternships";
import CompanyApplicants from "./pages/admin/CompanyApplicants";

function GlobalStylesWrapper() {
  const { isDark } = useTheme();
  return <style>{globalStyles(isDark)}</style>;
}

function App() {
  return (
    <ThemeProvider>
      <GlobalStylesWrapper />
      <AuthProvider>
        <ActivityProvider>
          <BrowserRouter>
            <Routes>
              {/* General Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />

              {/* Student Routes */}
              <Route path="/student/register" element={<StudentRegister />} />
              <Route path="/student/profile" element={<StudentProfile />} />
              <Route path="/student/search" element={<SearchInternships />} />
              <Route path="/student/dashboard" element={<Dashboard />} />
              <Route path="/student/applications" element={<TrackApplications />} />
              <Route path="/student/upload-cv" element={<UploadCV />} />
              <Route path="/student/internship/:id" element={<InternshipDetails />} />
              <Route path="/student/apply/:id" element={<ApplyPage />} />
              <Route path="/student/report" element={<StudentReport />} />
              <Route path="/company/profile/view/:id" element={<CompanyProfileView />} />

              {/* Company Routes */}
              <Route path="/company/register" element={<CompanyRegister />} />
              <Route path="/company/dashboard" element={<CompanyDashboard />} />
              <Route path="/company/profile" element={<CompanyProfile />} />
              <Route path="/company/post" element={<PostInternship />} />
              <Route path="/company/internships" element={<ManageInternships />} />
              <Route path="/company/applicants/:id" element={<ViewApplicants />} />
              <Route path="/company/cv/:id" element={<ViewCV />} />
              <Route path="/company/messages/:id" element={<Messaging />} />
              <Route path="/messages/:id" element={<Messaging />} />
              <Route path="/company/report" element={<CompanyReport />} />

              {/* Admin Routes (protected by PrivateRoute) */}
              <Route path="/admin/dashboard" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
              <Route path="/admin/students" element={<PrivateRoute><ManageStudents /></PrivateRoute>} />
              <Route path="/admin/companies" element={<PrivateRoute><ManageCompanies /></PrivateRoute>} />
              <Route path="/admin/internships" element={<PrivateRoute><AdminManageInternships /></PrivateRoute>} />
              <Route path="/admin/applications" element={<PrivateRoute><ManageApplications /></PrivateRoute>} />
              <Route path="/admin/reports" element={<PrivateRoute><GenerateReports /></PrivateRoute>} />
              <Route path="/admin/verify-internships" element={<PrivateRoute><VerifyInternships /></PrivateRoute>} />
              <Route path="/admin/company-applicants/:companyName" element={<PrivateRoute><CompanyApplicants /></PrivateRoute>} />

              {/* Default fallback for unknown paths */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </BrowserRouter>
        </ActivityProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;