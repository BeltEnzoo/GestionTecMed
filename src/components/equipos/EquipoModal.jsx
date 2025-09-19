import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import './EquipoModal.css';

const EquipoModal = ({ equipo, isOpen, onClose, onEdit, onDelete }) => {
  if (!isOpen || !equipo) return null;

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('es-ES');
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  return (
    <div className="equipo-modal-overlay" onClick={onClose}>
      <div className="equipo-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="equipo-modal-header">
          <h2 className="equipo-modal-title">
            {equipo.marca} {equipo.modelo}
          </h2>
          <button className="equipo-modal-close" onClick={onClose}>
            <XMarkIcon className="equipo-modal-close-icon" />
          </button>
        </div>

        <div className="equipo-modal-body">
          <div className="equipo-modal-tabs">
            <div className="equipo-modal-tab active">
              <span>Información General</span>
            </div>
          </div>

          <div className="equipo-modal-tab-content">
            <div className="equipo-modal-grid">
              <div className="equipo-modal-section">
                <h3 className="equipo-modal-section-title">Datos Básicos</h3>
                <div className="equipo-modal-field">
                  <label>Marca:</label>
                  <span>{equipo.marca || 'N/A'}</span>
                </div>
                <div className="equipo-modal-field">
                  <label>Modelo:</label>
                  <span>{equipo.modelo || 'N/A'}</span>
                </div>
                <div className="equipo-modal-field">
                  <label>Número de Serie:</label>
                  <span>{equipo.numero_serie || 'N/A'}</span>
                </div>
                <div className="equipo-modal-field">
                  <label>Código Interno:</label>
                  <span>{equipo.codigo_interno || 'N/A'}</span>
                </div>
                <div className="equipo-modal-field">
                  <label>Tipo de Equipo:</label>
                  <span>{equipo.tipo_equipo || 'N/A'}</span>
                </div>
                <div className="equipo-modal-field">
                  <label>Estado:</label>
                  <span className={`equipo-modal-status equipo-modal-status-${equipo.estado}`}>
                    {equipo.estado || 'N/A'}
                  </span>
                </div>
              </div>

              <div className="equipo-modal-section">
                <h3 className="equipo-modal-section-title">Ubicación</h3>
                <div className="equipo-modal-field">
                  <label>Edificio:</label>
                  <span>{equipo.edificio || 'N/A'}</span>
                </div>
                <div className="equipo-modal-field">
                  <label>Piso:</label>
                  <span>{equipo.piso || 'N/A'}</span>
                </div>
                <div className="equipo-modal-field">
                  <label>Sala/Habitación:</label>
                  <span>{equipo.sala || 'N/A'}</span>
                </div>
                <div className="equipo-modal-field">
                  <label>Servicio:</label>
                  <span>{equipo.servicio || 'N/A'}</span>
                </div>
              </div>

              <div className="equipo-modal-section">
                <h3 className="equipo-modal-section-title">Especificaciones Técnicas</h3>
                <div className="equipo-modal-field">
                  <label>Voltaje:</label>
                  <span>{equipo.voltaje || 'N/A'}</span>
                </div>
                <div className="equipo-modal-field">
                  <label>Frecuencia:</label>
                  <span>{equipo.frecuencia || 'N/A'}</span>
                </div>
                <div className="equipo-modal-field">
                  <label>Potencia:</label>
                  <span>{equipo.potencia || 'N/A'}</span>
                </div>
                <div className="equipo-modal-field">
                  <label>Peso:</label>
                  <span>{equipo.peso || 'N/A'} kg</span>
                </div>
                <div className="equipo-modal-field">
                  <label>Dimensiones:</label>
                  <span>{equipo.dimensiones || 'N/A'}</span>
                </div>
              </div>

              <div className="equipo-modal-section">
                <h3 className="equipo-modal-section-title">Información Comercial</h3>
                <div className="equipo-modal-field">
                  <label>Proveedor:</label>
                  <span>{equipo.proveedor || 'N/A'}</span>
                </div>
                <div className="equipo-modal-field">
                  <label>Fecha de Compra:</label>
                  <span>{formatDate(equipo.fecha_compra)}</span>
                </div>
                <div className="equipo-modal-field">
                  <label>Precio de Compra:</label>
                  <span>{formatCurrency(equipo.precio_compra)}</span>
                </div>
                <div className="equipo-modal-field">
                  <label>Garantía (meses):</label>
                  <span>{equipo.garantia_meses || 'N/A'}</span>
                </div>
                <div className="equipo-modal-field">
                  <label>Fecha de Instalación:</label>
                  <span>{formatDate(equipo.fecha_instalacion)}</span>
                </div>
              </div>

              <div className="equipo-modal-section">
                <h3 className="equipo-modal-section-title">Mantenimiento</h3>
                <div className="equipo-modal-field">
                  <label>Último Mantenimiento:</label>
                  <span>{formatDate(equipo.ultimo_mantenimiento)}</span>
                </div>
                <div className="equipo-modal-field">
                  <label>Próximo Mantenimiento:</label>
                  <span>{formatDate(equipo.proximo_mantenimiento)}</span>
                </div>
                <div className="equipo-modal-field">
                  <label>Frecuencia de Mantenimiento:</label>
                  <span>{equipo.frecuencia_mantenimiento || 'N/A'}</span>
                </div>
                <div className="equipo-modal-field">
                  <label>Responsable de Mantenimiento:</label>
                  <span>{equipo.responsable_mantenimiento || 'N/A'}</span>
                </div>
              </div>

              <div className="equipo-modal-section equipo-modal-section-full">
                <h3 className="equipo-modal-section-title">Observaciones</h3>
                <div className="equipo-modal-field">
                  <p className="equipo-modal-observations">
                    {equipo.observaciones || 'Sin observaciones registradas'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="equipo-modal-footer">
          <button className="equipo-modal-btn equipo-modal-btn-secondary" onClick={onClose}>
            Cerrar
          </button>
          <button className="equipo-modal-btn equipo-modal-btn-primary" onClick={onEdit}>
            Editar
          </button>
          <button className="equipo-modal-btn equipo-modal-btn-danger" onClick={onDelete}>
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
};

export default EquipoModal;




