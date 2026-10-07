import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ClientLoginPage from "./pages/ClientLoginPage";
import ClientDashboardPage from "./pages/ClientDashboardPage";
import ClientProjectsPage from "./pages/ClientProjectsPage";
import ClientProjectDetailPage from "./pages/ClientProjectDetailPage";
import ClientInvoicesPage from "./pages/ClientInvoicesPage";
import ClientTicketsPage from "./pages/ClientTicketsPage";
import ClientProfilePage from "./pages/ClientProfilePage";
import ClientOffersPage from "./pages/ClientOffersPage";
import ClientUpdatesPage from "./pages/ClientUpdatesPage";
import { ClientLayout } from "./layouts/ClientLayout";
import { authService } from "./services/authService";

function ProtectedClientRoute({ children }: { children: React.ReactElement }) {
  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <ClientLayout>{children}</ClientLayout>;
}

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<ClientLoginPage />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedClientRoute>
              <ClientDashboardPage />
            </ProtectedClientRoute>
          }
        />
        <Route
          path="/projects"
          element={
            <ProtectedClientRoute>
              <ClientProjectsPage />
            </ProtectedClientRoute>
          }
        />
        <Route
          path="/projects/:id"
          element={
            <ProtectedClientRoute>
              <ClientProjectDetailPage />
            </ProtectedClientRoute>
          }
        />
        <Route
          path="/invoices"
          element={
            <ProtectedClientRoute>
              <ClientInvoicesPage />
            </ProtectedClientRoute>
          }
        />
        <Route
          path="/tickets"
          element={
            <ProtectedClientRoute>
              <ClientTicketsPage />
            </ProtectedClientRoute>
          }
        />
        <Route
          path="/offers"
          element={
            <ProtectedClientRoute>
              <ClientOffersPage />
            </ProtectedClientRoute>
          }
        />
        <Route
          path="/updates"
          element={
            <ProtectedClientRoute>
              <ClientUpdatesPage />
            </ProtectedClientRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedClientRoute>
              <ClientProfilePage />
            </ProtectedClientRoute>
          }
        />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
