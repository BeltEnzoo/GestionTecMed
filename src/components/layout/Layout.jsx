import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  HomeIcon,
  CpuChipIcon,
  WrenchScrewdriverIcon,
  ChartBarIcon,
  UserIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../../hooks/useAuth";
import "./Layout.css";

const Layout = ({ children }) => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, signOut } = useAuth();

  // Navegación base para todos los usuarios
  const baseNavigation = [
    { name: "Dashboard", href: "/", icon: HomeIcon },
    { name: "Equipos", href: "/equipos", icon: CpuChipIcon },
    { name: "Mantenimientos", href: "/mantenimientos", icon: WrenchScrewdriverIcon },
    { name: "Reportes", href: "/reportes", icon: ChartBarIcon },
  ];

  // Navegación completa (solo para Administradores)
  const adminNavigation = [
    ...baseNavigation,
    { name: "Usuarios", href: "/usuarios", icon: UserIcon },
  ];

  // Determinar qué navegación usar según el rol del usuario
  const navigation = user?.rol === 'Administrador' ? adminNavigation : baseNavigation;

  const closeSidebar = () => setSidebarOpen(false);

  const handleLogout = async () => {
    try {
      await signOut();
      // La redirección se maneja automáticamente en el AuthProvider
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <div className="layout-container">
      {/* Mobile menu button */}
      <button
        className="mobile-menu-btn"
        onClick={() => setSidebarOpen(true)}
        aria-label="Abrir menú"
      >
        <Bars3Icon className="h-6 w-6" />
      </button>

      {/* Sidebar overlay */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`}
        onClick={closeSidebar}
      />

      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h1 className="sidebar-title">
            🏥 Gestión Médica
          </h1>
          <button
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600"
            onClick={closeSidebar}
            aria-label="Cerrar menú"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        <nav className="sidebar-nav">
          <div className="nav-menu">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`nav-item ${isActive ? 'active' : ''}`}
                  onClick={closeSidebar}
                >
                  <item.icon className="nav-icon" />
                  {item.name}
                </Link>
              );
            })}
          </div>
          
          {/* Información del usuario y botón de cerrar sesión */}
          <div className="sidebar-footer">
            <div className="user-info">
              <div className="user-avatar">
                <UserIcon className="h-6 w-6" />
              </div>
              <div className="user-details">
                <p className="user-name">{user?.email || 'Usuario'}</p>
                <p className="user-role">{user?.rol || 'Usuario'}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="logout-btn"
              title="Cerrar sesión"
            >
              <ArrowRightOnRectangleIcon className="logout-icon" />
              Cerrar Sesión
            </button>
          </div>
        </nav>
      </div>

      {/* Main content */}
      <div className="main-content">
        <main className="main-wrapper">
          <div className="main-container">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
