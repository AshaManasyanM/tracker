import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./index.css";
import App from "./App";
import { AuthProvider } from "./state/AuthContext";
import { TournamentProvider } from "./state/TournamentContext";
import { RequireAuth } from "./components/RequireAuth";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { DashboardPage } from "./pages/DashboardPage";
import { TournamentEditorPage } from "./pages/TournamentEditorPage";

const localWorkspace = (
  <TournamentProvider>
    <App />
  </TournamentProvider>
);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route element={<RequireAuth />}>
            <Route index element={<DashboardPage />} />
            <Route path="t/:tournamentId" element={<TournamentEditorPage />} />
            <Route path="local" element={localWorkspace} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
