import React, { useState } from 'react';
import {
  DocumentArrowDownIcon,
  DocumentTextIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';
import ReportesPDFService from '../../services/reportesPDFService';
import './ExportButtons.css';

const ExportButtons = ({ 
  equipos = [], 
  mantenimientos = [], 
  eventos = [], 
  equipoSeleccionado = null 
}) => {
  const [exportando, setExportando] = useState(false);

  // Función auxiliar para obtener todos los equipos
  const getAllEquipos = (equiposData) => {
    if (Array.isArray(equiposData)) {
      return equiposData;
    } else if (equiposData && typeof equiposData === 'object') {
      return [
        ...(equiposData.equiposFueraServicio || []),
        ...(equiposData.equiposSinMantenimientoReciente || []),
        ...(equiposData.mantenimientosVencidos || [])
      ];
    }
    return [];
  };

  const totalEquipos = getAllEquipos(equipos);

  const handleExportInventario = async () => {
    try {
      setExportando(true);
      await ReportesPDFService.generarReporteInventario(equipos);
    } catch (error) {
      console.error('Error exportando inventario:', error);
      alert('Error al exportar el inventario. Por favor, inténtalo de nuevo.');
    } finally {
      setExportando(false);
    }
  };

  const handleExportMantenimientos = async () => {
    try {
      setExportando(true);
      await ReportesPDFService.generarReporteMantenimientos(mantenimientos);
    } catch (error) {
      console.error('Error exportando mantenimientos:', error);
      alert('Error al exportar los mantenimientos. Por favor, inténtalo de nuevo.');
    } finally {
      setExportando(false);
    }
  };

  const handleExportEventosEquipo = async () => {
    if (!equipoSeleccionado) {
      alert('Por favor, selecciona un equipo para exportar sus eventos.');
      return;
    }

    try {
      setExportando(true);
      await ReportesPDFService.generarReporteEventosEquipo(equipoSeleccionado, eventos);
    } catch (error) {
      console.error('Error exportando eventos:', error);
      alert('Error al exportar los eventos. Por favor, inténtalo de nuevo.');
    } finally {
      setExportando(false);
    }
  };

  const handleExportCostos = async () => {
    try {
      setExportando(true);
      await ReportesPDFService.generarReporteCostos(equipos, mantenimientos);
    } catch (error) {
      console.error('Error exportando costos:', error);
      alert('Error al exportar los costos. Por favor, inténtalo de nuevo.');
    } finally {
      setExportando(false);
    }
  };

  return (
    <div className="export-buttons">
      <div className="export-header">
        <h3>📊 Exportar Reportes</h3>
        <p>Genera reportes en PDF con la información del sistema</p>
      </div>

      <div className="export-grid">
        
        {/* Botón de Inventario */}
        <button 
          className="export-btn inventario-btn"
          onClick={handleExportInventario}
          disabled={exportando || totalEquipos.length === 0}
        >
          <div className="export-btn-icon">
            <DocumentTextIcon className="h-6 w-6" />
          </div>
          <div className="export-btn-content">
            <h4>Inventario Completo</h4>
            <p>Lista detallada de todos los equipos</p>
            <span className="export-count">{totalEquipos.length} equipos</span>
          </div>
        </button>

        {/* Botón de Mantenimientos */}
        <button 
          className="export-btn mantenimientos-btn"
          onClick={handleExportMantenimientos}
          disabled={exportando || mantenimientos.length === 0}
        >
          <div className="export-btn-icon">
            <ChartBarIcon className="h-6 w-6" />
          </div>
          <div className="export-btn-content">
            <h4>Mantenimientos</h4>
            <p>Reporte de mantenimientos y reparaciones</p>
            <span className="export-count">{mantenimientos.length} registros</span>
          </div>
        </button>

        {/* Botón de Eventos por Equipo */}
        <button 
          className="export-btn eventos-btn"
          onClick={handleExportEventosEquipo}
          disabled={exportando || !equipoSeleccionado}
        >
          <div className="export-btn-icon">
            <DocumentArrowDownIcon className="h-6 w-6" />
          </div>
          <div className="export-btn-content">
            <h4>Eventos por Equipo</h4>
            <p>Historial de eventos de un equipo específico</p>
            <span className="export-count">
              {equipoSeleccionado ? `${equipoSeleccionado.marca || 'Equipo'} seleccionado` : 'Selecciona un equipo'}
            </span>
          </div>
        </button>

        {/* Botón de Costos */}
        <button 
          className="export-btn costos-btn"
          onClick={handleExportCostos}
          disabled={exportando}
        >
          <div className="export-btn-icon">
            <CurrencyDollarIcon className="h-6 w-6" />
          </div>
          <div className="export-btn-content">
            <h4>Análisis de Costos</h4>
            <p>Costos por departamento y recomendaciones</p>
            <span className="export-count">Análisis financiero</span>
          </div>
        </button>

      </div>

      {exportando && (
        <div className="export-loading">
          <div className="loading-spinner"></div>
          <p>Generando reporte PDF...</p>
        </div>
      )}

      <div className="export-info">
        <p>💡 <strong>Tip:</strong> Los reportes se descargan automáticamente en formato PDF</p>
      </div>
    </div>
  );
};

export default ExportButtons;
