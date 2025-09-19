import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PlusIcon, MagnifyingGlassIcon, EyeIcon } from "@heroicons/react/24/outline";
import { useEquipos } from "../../hooks/useEquipos";
import EquipoForm from "./EquipoForm";
import EquipoModal from "./EquipoModal";
import "./EquiposList.css";

const EquiposList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedEquipo, setSelectedEquipo] = useState(null);
  const [editingEquipo, setEditingEquipo] = useState(null);

  // Usar el hook de equipos
  const {
    equipos,
    loading,
    error,
    createEquipo,
    updateEquipo,
    deleteEquipo,
    searchEquipos
  } = useEquipos();

  // Filtrar equipos localmente o usar búsqueda de Supabase
  const filteredEquipos = searchTerm 
    ? equipos.filter((equipo) =>
        equipo.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        equipo.marca?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        equipo.modelo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        equipo.sala?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        equipo.numero_serie?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        equipo.codigo_interno?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : equipos;

  const getEstadoColor = (estado) => {
    switch (estado) {
      case "activo":
        return "estado-badge activo";
      case "mantenimiento":
        return "estado-badge mantenimiento";
      case "fuera-servicio":
        return "estado-badge fuera-servicio";
      case "retirado":
        return "estado-badge retirado";
      default:
        return "estado-badge";
    }
  };

  const getEstadoLabel = (estado) => {
    switch (estado) {
      case "activo":
        return "Activo";
      case "mantenimiento":
        return "En Mantenimiento";
      case "fuera-servicio":
        return "Fuera de Servicio";
      case "retirado":
        return "Retirado";
      default:
        return estado;
    }
  };

  const handleNewEquipo = () => {
    setEditingEquipo(null);
    setShowForm(true);
  };

  const handleEditEquipo = (equipo) => {
    setEditingEquipo(equipo);
    setShowForm(true);
  };

  const handleViewEquipo = (equipo) => {
    navigate(`/equipos/${equipo.id}`);
  };

  const handleDeleteEquipo = async (equipo) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar el equipo "${equipo.nombre}"?`)) {
      const { error } = await deleteEquipo(equipo.id);
      if (error) {
        alert('Error al eliminar el equipo: ' + error);
      }
    }
  };

  const handleSaveEquipo = async (equipoData) => {
    if (editingEquipo) {
      // Actualizar equipo existente
      const { error } = await updateEquipo(editingEquipo.id, equipoData);
      if (error) {
        alert('Error al actualizar el equipo: ' + error);
        return;
      }
    } else {
      // Crear nuevo equipo
      const { error } = await createEquipo(equipoData);
      if (error) {
        alert('Error al crear el equipo: ' + error);
        return;
      }
    }
    setShowForm(false);
    setEditingEquipo(null);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingEquipo(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedEquipo(null);
  };

  if (loading) {
    return (
      <div className="equipos-container">
        <div className="equipos-loading">
          <div className="equipos-loading-spinner"></div>
          <p>Cargando equipos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="equipos-container">
        <div className="equipos-error">
          <h2>Error al cargar los equipos</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="equipos-retry-btn">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="equipos-container">
      <div className="equipos-header">
        <div className="equipos-header-content">
          <div>
            <h1 className="equipos-title">Equipos Médicos</h1>
            <p className="equipos-subtitle">
              Gestión del inventario de tecnología médica
            </p>
          </div>
          <button className="new-equipo-btn" onClick={handleNewEquipo}>
            <PlusIcon className="new-equipo-btn-icon" />
            Nuevo Equipo
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="search-container">
        <div className="search-wrapper">
          <div className="search-icon">
            <MagnifyingGlassIcon />
          </div>
          <input
            type="text"
            placeholder="Buscar equipos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {/* Equipos Table - Desktop */}
      <div className="equipos-table-container">
        <table className="equipos-table">
          <thead>
            <tr>
              <th>Equipo</th>
              <th>Ubicación</th>
              <th>Estado</th>
              <th>Antigüedad</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredEquipos.map((equipo) => (
              <tr key={equipo.id}>
                <td>
                  <div className="equipo-info">
                    <div className="equipo-name">
                      {equipo.nombre}
                    </div>
                    <div className="equipo-details">
                      {equipo.marca} {equipo.modelo}
                    </div>
                    <div className="equipo-serial">
                      S/N: {equipo.numero_serie}
                    </div>
                  </div>
                </td>
                <td>
                  {equipo.sala}
                </td>
                <td>
                  <span className={getEstadoColor(equipo.estado)}>
                    {getEstadoLabel(equipo.estado)}
                  </span>
                </td>
                <td>
                  {equipo.años_antigüedad || 0} años
                </td>
                <td className="action-buttons">
                  <button 
                    className="view-btn"
                    onClick={() => handleViewEquipo(equipo)}
                    title="Ver detalles"
                  >
                    <EyeIcon className="h-3 w-3" />
                    Ver
                  </button>
                  <button 
                    className="edit-btn"
                    onClick={() => handleEditEquipo(equipo)}
                    title="Editar"
                  >
                    Editar
                  </button>
                  <button 
                    className="delete-btn"
                    onClick={() => handleDeleteEquipo(equipo)}
                    title="Eliminar"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Equipos Cards - Mobile */}
      <div className="equipos-mobile-cards">
        {filteredEquipos.length === 0 ? (
          <div className="equipos-empty-mobile">
            <div className="equipos-empty-content">
              <p>No se encontraron equipos</p>
              {searchTerm && (
                <p className="equipos-empty-subtitle">
                  Intenta con otros términos de búsqueda
                </p>
              )}
            </div>
          </div>
        ) : (
          filteredEquipos.map((equipo) => (
            <div key={equipo.id} className="equipos-mobile-card">
              <div className="equipos-mobile-card-header">
                <div>
                  <div className="equipos-mobile-card-title">
                    {equipo.nombre}
                  </div>
                  <div className="equipos-mobile-card-subtitle">
                    {equipo.marca} {equipo.modelo}
                  </div>
                  <div className="equipos-mobile-card-serial">
                    S/N: {equipo.numero_serie}
                  </div>
                </div>
                <span className={getEstadoColor(equipo.estado)}>
                  {getEstadoLabel(equipo.estado)}
                </span>
              </div>
              
              <div className="equipos-mobile-card-body">
                <div className="equipos-mobile-card-field">
                  <div className="equipos-mobile-card-label">Ubicación</div>
                  <div className="equipos-mobile-card-value">{equipo.sala}</div>
                </div>
                <div className="equipos-mobile-card-field">
                  <div className="equipos-mobile-card-label">Antigüedad</div>
                  <div className="equipos-mobile-card-value">{equipo.años_antigüedad || 0} años</div>
                </div>
              </div>
              
              <div className="equipos-mobile-card-actions">
                <button 
                  className="view-btn"
                  onClick={() => handleViewEquipo(equipo)}
                  title="Ver detalles"
                >
                  <EyeIcon className="h-3 w-3" />
                  Ver
                </button>
                <button 
                  className="edit-btn"
                  onClick={() => handleEditEquipo(equipo)}
                  title="Editar"
                >
                  Editar
                </button>
                <button 
                  className="delete-btn"
                  onClick={() => handleDeleteEquipo(equipo)}
                  title="Eliminar"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Formulario de Equipo */}
      <EquipoForm
        equipo={editingEquipo}
        isOpen={showForm}
        onSave={handleSaveEquipo}
        onCancel={handleCloseForm}
      />

      {/* Modal de Detalles */}
      <EquipoModal
        equipo={selectedEquipo}
        isOpen={showModal}
        onClose={handleCloseModal}
        onEdit={handleEditEquipo}
        onDelete={handleDeleteEquipo}
      />
    </div>
  );
};

export default EquiposList;
