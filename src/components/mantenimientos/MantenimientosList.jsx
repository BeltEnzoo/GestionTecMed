import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import MantenimientoForm, { equipoOptionLabel } from './MantenimientoForm';
import './MantenimientosList.css';

function formatFecha(value) {
  if (!value) return '-';
  const raw = String(value).slice(0, 10);
  const [year, month, day] = raw.split('-');
  if (!year || !month || !day) return '-';
  return `${day}/${month}/${year}`;
}

function formatCosto(costo) {
  if (costo == null || costo === '' || Number.isNaN(Number(costo))) return '-';
  return `$${Number(costo).toFixed(2)}`;
}

function equipoResumen(equipo) {
  if (!equipo) return 'Equipo no encontrado';
  const identidad = [equipo.marca, equipo.modelo].filter(Boolean).join(' ') || equipo.nombre;
  return identidad || 'Sin nombre';
}

function ubicacionEquipo(equipo) {
  if (!equipo) return '-';
  const partes = [equipo.edificio, equipo.piso, equipo.sala].filter(Boolean);
  return partes.length ? partes.join(' · ') : '-';
}

const MantenimientoDetalle = ({ mantenimiento, onClose }) => {
  const equipo = mantenimiento.equipos;
  const filas = [
    ['Equipo', equipo?.nombre || '-'],
    ['Marca y modelo', equipoResumen(equipo)],
    ['Ubicación', ubicacionEquipo(equipo)],
    ['Tipo', mantenimiento.tipo === 'preventivo' ? 'Preventivo' : 'Correctivo'],
    ['Técnico', mantenimiento.tecnico || '-'],
    ['Fecha programada', formatFecha(mantenimiento.fecha_programada)],
    ['Fecha completado', formatFecha(mantenimiento.fecha_completado)],
    ['Estado', ({
      programado: 'Programado',
      en_proceso: 'En proceso',
      completado: 'Completado',
      cancelado: 'Cancelado',
    })[mantenimiento.estado] || mantenimiento.estado || '-'],
    ['Costo', formatCosto(mantenimiento.costo)],
    ['Descripción', mantenimiento.descripcion || '-'],
    ['Observaciones', mantenimiento.observaciones || '-'],
  ];

  return (
    <div className="detalle-overlay" onClick={onClose}>
      <div className="detalle-panel" onClick={(e) => e.stopPropagation()}>
        <div className="detalle-header">
          <h2>Detalle del mantenimiento</h2>
          <button className="close-btn" onClick={onClose} type="button" aria-label="Cerrar">×</button>
        </div>
        <dl className="detalle-list">
          {filas.map(([label, value]) => (
            <div key={label} className="detalle-row">
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
};

const MantenimientosList = () => {
  const { user } = useAuth();
  const canWrite = user?.rol !== 'Invitado';
  const [mantenimientos, setMantenimientos] = useState([]);
  const [equipos, setEquipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMantenimiento, setEditingMantenimiento] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [detalle, setDetalle] = useState(null);

  useEffect(() => {
    fetchMantenimientos();
    fetchEquipos();
  }, []);

  const fetchMantenimientos = async () => {
    try {
      const { data } = await api('/api/mantenimientos');
      const sorted = (data || []).sort(
        (a, b) => new Date(b.fecha_programada) - new Date(a.fecha_programada)
      );
      setMantenimientos(sorted);
    } catch (error) {
      console.error('Error fetching mantenimientos:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEquipos = async () => {
    try {
      const { data } = await api('/api/equipos');
      const sorted = (data || [])
        .map((e) => ({
          id: e.id,
          nombre: e.nombre,
          marca: e.marca,
          modelo: e.modelo,
          edificio: e.edificio,
          piso: e.piso,
          sala: e.sala,
        }))
        .sort((a, b) => equipoOptionLabel(a).localeCompare(equipoOptionLabel(b), 'es'));
      setEquipos(sorted);
    } catch (error) {
      console.error('Error fetching equipos:', error);
    }
  };

  const handleCreate = () => {
    setEditingMantenimiento(null);
    setShowForm(true);
  };

  const handleEdit = (mantenimiento) => {
    setEditingMantenimiento(mantenimiento);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este mantenimiento?')) {
      return;
    }

    try {
      await api(`/api/mantenimientos/${id}`, { method: 'DELETE' });
      fetchMantenimientos();
    } catch (error) {
      console.error('Error deleting mantenimiento:', error);
      alert('Error al eliminar el mantenimiento');
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingMantenimiento(null);
    fetchMantenimientos();
  };

  const filteredMantenimientos = mantenimientos.filter(mantenimiento => {
    const matchesSearch = 
      mantenimiento.equipos?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mantenimiento.tecnico?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mantenimiento.descripcion?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'todos' || mantenimiento.estado === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (estado) => {
    switch (estado) {
      case 'programado': return 'status-scheduled';
      case 'en_proceso': return 'status-progress';
      case 'completado': return 'status-completed';
      case 'cancelado': return 'status-cancelled';
      default: return 'status-default';
    }
  };

  const getStatusText = (estado) => {
    switch (estado) {
      case 'programado': return 'Programado';
      case 'en_proceso': return 'En Proceso';
      case 'completado': return 'Completado';
      case 'cancelado': return 'Cancelado';
      default: return estado;
    }
  };

  const getTipoColor = (tipo) => {
    return tipo === 'preventivo' ? 'tipo-preventivo' : 'tipo-correctivo';
  };

  const getTipoText = (tipo) => {
    return tipo === 'preventivo' ? 'Preventivo' : 'Correctivo';
  };

  if (loading) {
    return (
      <div className="mantenimientos-container">
        <div className="loading">Cargando mantenimientos...</div>
      </div>
    );
  }

  return (
    <div className="mantenimientos-container">
      <div className="mantenimientos-header">
        <div>
          <h1>Mantenimientos</h1>
          <p>Gestión de mantenimientos preventivos y correctivos</p>
        </div>
        {canWrite && (
          <button className="btn btn-primary" onClick={handleCreate}>
            + Nuevo Mantenimiento
          </button>
        )}
      </div>

      <div className="mantenimientos-filters">
        <div className="search-container">
          <input
            type="text"
            placeholder="Buscar mantenimientos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="filter-select"
        >
          <option value="todos">Todos los estados</option>
          <option value="programado">Programado</option>
          <option value="en_proceso">En Proceso</option>
          <option value="completado">Completado</option>
          <option value="cancelado">Cancelado</option>
        </select>
      </div>

      <div className="mantenimientos-table-container">
        <table className="mantenimientos-table">
          <thead>
            <tr>
              <th>EQUIPO</th>
              <th>TIPO</th>
              <th>TÉCNICO</th>
              <th>FECHA PROGRAMADA</th>
              <th>ESTADO</th>
              <th>COSTO</th>
              <th>ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {filteredMantenimientos.map((mantenimiento) => (
              <tr key={mantenimiento.id}>
                <td>
                  <div className="equipo-nombre" title={equipoResumen(mantenimiento.equipos)}>
                    {equipoResumen(mantenimiento.equipos)}
                  </div>
                </td>
                <td>
                  <span className={`tipo-badge ${getTipoColor(mantenimiento.tipo)}`}>
                    {getTipoText(mantenimiento.tipo)}
                  </span>
                </td>
                <td className="cell-clip" title={mantenimiento.tecnico || ''}>
                  {mantenimiento.tecnico || '-'}
                </td>
                <td>{formatFecha(mantenimiento.fecha_programada)}</td>
                <td>
                  <span className={`status-badge ${getStatusColor(mantenimiento.estado)}`}>
                    {getStatusText(mantenimiento.estado)}
                  </span>
                </td>
                <td>{formatCosto(mantenimiento.costo)}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => setDetalle(mantenimiento)}
                    >
                      Detalles
                    </button>
                    {canWrite && (
                      <>
                        <button
                          className="btn btn-warning btn-sm"
                          onClick={() => handleEdit(mantenimiento)}
                          title="Editar mantenimiento"
                        >
                          Editar
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(mantenimiento.id)}
                          title="Eliminar mantenimiento"
                        >
                          Eliminar
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredMantenimientos.length === 0 && (
          <div className="empty-state">
            <p>No se encontraron mantenimientos</p>
          </div>
        )}
      </div>

      {detalle && (
        <MantenimientoDetalle
          mantenimiento={detalle}
          onClose={() => setDetalle(null)}
        />
      )}

      {showForm && (
        <MantenimientoForm
          mantenimiento={editingMantenimiento}
          equipos={equipos}
          onClose={handleFormClose}
        />
      )}
    </div>
  );
};

export default MantenimientosList;