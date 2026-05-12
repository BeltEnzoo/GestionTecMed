import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  HomeIcon,
  CpuChipIcon,
  WrenchScrewdriverIcon,
  ChartBarIcon,
  UserGroupIcon,
  UserIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
  BellAlertIcon,
  CubeIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../../hooks/useAuth";
import Logo from "./Logo";
import "./Layout.css";

const Layout = ({ children }) => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, signOut } = useAuth();

  const isNavActive = (href) => {
    if (href === "/") return location.pathname === "/";
    return (
      location.pathname === href ||
      location.pathname.startsWith(`${href}/`)
    );
  };

  const baseNavigation = [
    { name: "Inicio", href: "/", icon: HomeIcon },
    { name: "Equipos", href: "/equipos", icon: CpuChipIcon },
    { name: "Mantenimientos", href: "/mantenimientos", icon: WrenchScrewdriverIcon },
    { name: "Eventos", href: "/eventos", icon: BellAlertIcon },
    { name: "Stock / Insumos", href: "/stock", icon: CubeIcon },
    { name: "Reportes", href: "/reportes", icon: ChartBarIcon },
  ];

  const adminNavigation = [
    ...baseNavigation,
    { name: "Usuarios", href: "/usuarios", icon: UserGroupIcon },
  ];

  const navigation =
    user?.rol === "Administrador" ? adminNavigation : baseNavigation;

  const closeSidebar = () => setSidebarOpen(false);

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <div className="layout-container">
      <button
        type="button"
        className="mobile-menu-btn"
        onClick={() => setSidebarOpen(true)}
        aria-label="Abrir menú"
      >
        <Bars3Icon className="h-6 w-6" />
      </button>

      <div
        className={`sidebar-overlay ${sidebarOpen ? "open" : ""}`}
        onClick={closeSidebar}
        onKeyDown={(e) => e.key === "Escape" && closeSidebar()}
        role="presentation"
        aria-hidden={!sidebarOpen}
      />

      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <Logo size={40} className="sidebar-logo" />
            <div className="sidebar-title-block">
              <h1 className="sidebar-title">Tec. Médica</h1>
              <span className="sidebar-tagline">
                Parque tecnológico · Control clínico
              </span>
            </div>
          </div>
          <button
            type="button"
            className="sidebar-close-btn"
            onClick={closeSidebar}
            aria-label="Cerrar menú"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        <nav className="sidebar-nav" aria-label="Principal">
          <div>
            <p className="nav-section-label">Menú</p>
            <div className="nav-menu">
              {navigation.map((item) => {
                const active = isNavActive(item.href);
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`nav-item ${active ? "active" : ""}`}
                    onClick={closeSidebar}
                  >
                    <item.icon className="nav-icon" aria-hidden />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="sidebar-footer">
            <div className="user-info">
              <div className="user-avatar">
                <UserIcon className="h-5 w-5" aria-hidden />
              </div>
              <div className="user-details">
                <p className="user-name">{user?.email || "Usuario"}</p>
                <p className="user-role">{user?.rol || "Sesión"}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="logout-btn"
              title="Cerrar sesión"
            >
              <ArrowRightOnRectangleIcon className="logout-icon" aria-hidden />
              Cerrar sesión
            </button>
          </div>
        </nav>
      </aside>

      <div className="main-content">
        <main className="main-wrapper">
          <div className="main-container">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
