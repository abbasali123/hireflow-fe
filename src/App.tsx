import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import CandidatesPage from './pages/candidates/CandidatesPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import JobsListPage from './pages/jobs/JobsListPage';
import JobCreatePage from './pages/jobs/JobCreatePage';
import JobDetailPage from './pages/jobs/JobDetailPage';
import ProtectedRoute from './components/routing/ProtectedRoute';
import PipelinePage from './pages/PipelinePage';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="jobs" element={<JobsListPage />} />
        <Route path="jobs/new" element={<JobCreatePage />} />
        <Route path="jobs/:id" element={<JobDetailPage />} />
        <Route path="candidates" element={<CandidatesPage />} />
        <Route path="pipeline" element={<PipelinePage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/app" replace />} />
    </Routes>
  );
}

export default App;
