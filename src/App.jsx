import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './components/auth/AuthProvider';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Layout from './components/layout/Layout';
import Dashboard from './components/dashboard/Dashboard';
import EquiposList from './components/equipos/EquiposList';
import EquipoDetail from './components/equipos/EquipoDetail';
import MantenimientosList from './components/mantenimientos/MantenimientosList';
import ReportesList from './components/reportes/ReportesList';
import UsuariosList from './components/usuarios/UsuariosList';
import LoginForm from './components/auth/LoginForm';
import './index.css';

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginForm />} />
          <Route path="/*" element={
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/equipos" element={<EquiposList />} />
                <Route path="/equipos/:id" element={<EquipoDetail />} />
                <Route path="/mantenimientos" element={<MantenimientosList />} />
                <Route path="/reportes" element={<ReportesList />} />
                <Route path="/usuarios" element={
                  <ProtectedRoute requiredRole="Administrador">
                    <UsuariosList />
                  </ProtectedRoute>
                } />
              </Routes>
            </Layout>
          } />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;