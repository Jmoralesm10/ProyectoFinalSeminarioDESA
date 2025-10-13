import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import RegistrationPage from './pages/RegistrationPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AttendancePage from './pages/AttendancePage';
import AttendanceStatsPage from './pages/AttendanceStatsPage';
import AdminPanelPage from './pages/AdminPanelPage';
import UserPermissionsPage from './pages/UserPermissionsPage';
import UserManagementPage from './pages/UserManagementPage';
import ListUsersPage from './pages/ListUsersPage';
import ActivityManagementPage from './pages/ActivityManagementPage';
import ListActivitiesPage from './pages/ListActivitiesPage';
import CreateActivityPage from './pages/CreateActivityPage';
import EditActivityPage from './pages/EditActivityPage';
import AdminGuard from './components/AdminGuard/AdminGuard';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/registro" element={<RegistrationPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/asistencia" element={
            <AdminGuard>
              <AttendancePage />
            </AdminGuard>
          } />
          <Route path="/estadisticas" element={
            <AdminGuard requiredPermission="ver_estadisticas">
              <AttendanceStatsPage />
            </AdminGuard>
          } />
          <Route path="/admin-panel" element={<AdminPanelPage />} />
          <Route path="/permisos" element={<UserPermissionsPage />} />
          <Route path="/gestion-usuarios" element={<UserManagementPage />} />
          <Route path="/listar-usuarios" element={<ListUsersPage />} />
          <Route path="/gestion-actividades" element={<ActivityManagementPage />} />
          <Route path="/listar-actividades" element={<ListActivitiesPage />} />
                <Route path="/crear-actividad" element={
                  <AdminGuard requiredPermission="gestion_actividades">
                    <CreateActivityPage />
                  </AdminGuard>
                } />
                <Route path="/editar-actividad" element={
                  <AdminGuard requiredPermission="gestion_actividades">
                    <EditActivityPage />
                  </AdminGuard>
                } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
