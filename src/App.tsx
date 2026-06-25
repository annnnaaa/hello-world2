import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { useAuthStore } from './store/authStore';
import { AuthGuard } from './components/auth/AuthGuard';
import { AppShell } from './components/layout/AppShell';
import { useRealtime } from './hooks/useRealtime';

import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import DashboardPage from './pages/DashboardPage';
import BrainDumpPage from './pages/BrainDumpPage';
import UnsortedPage from './pages/UnsortedPage';
import TaskHubPage from './pages/tasks/TaskHubPage';
import TaskDetailPage from './pages/tasks/TaskDetailPage';
import PlannerPage from './pages/planner/PlannerPage';
import FilingCabinetPage from './pages/filing/FilingCabinetPage';
import FolderView from './pages/filing/FolderView';
import DocumentDetailPage from './pages/filing/DocumentDetailPage';
import SettingsPage from './pages/SettingsPage';

function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  useRealtime(user?.id);
  return <>{children}</>;
}

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const initialize = useAuthStore((s) => s.initialize);

  useEffect(() => {
    const unsubscribe = initialize();
    return unsubscribe;
  }, [initialize]);

  return <>{children}</>;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthInitializer>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

            <Route element={<AuthGuard />}>
              <Route element={<RealtimeProvider><AppShell /></RealtimeProvider>}>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/brain-dump" element={<BrainDumpPage />} />
                <Route path="/unsorted" element={<UnsortedPage />} />
                <Route path="/tasks" element={<TaskHubPage />} />
                <Route path="/tasks/:id" element={<TaskDetailPage />} />
                <Route path="/planner" element={<PlannerPage />} />
                <Route path="/planner/week" element={<PlannerPage />} />
                <Route path="/planner/month" element={<PlannerPage />} />
                <Route path="/filing" element={<FilingCabinetPage />} />
                <Route path="/filing/folder/:folderId" element={<FolderView />} />
                <Route path="/filing/doc/:docId" element={<DocumentDetailPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthInitializer>
    </QueryClientProvider>
  );
}
