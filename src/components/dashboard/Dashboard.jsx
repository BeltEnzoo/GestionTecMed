import React, { useState, useEffect } from "react";
import {
  CpuChipIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  WrenchScrewdriverIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
import { supabase } from "../../services/supabase";
import DashboardCharts from "./DashboardCharts";
import "./Dashboard.css";
import "./DashboardCharts.css";

const Dashboard = () => {
  const [stats, setStats] = useState([
    {
      name: "Total Equipos",
      value: "0",
      icon: CpuChipIcon,
      color: "bg-blue-500",
    },
    {
      name: "Mantenimientos Pendientes",
      value: "0",
      icon: ExclamationTriangleIcon,
      color: "bg-yellow-500",
    },
    {
      name: "Equipos Activos",
      value: "0",
      icon: CheckCircleIcon,
      color: "bg-green-500",
    },
    {
      name: "Próximos Mantenimientos",
      value: "0",
      icon: ClockIcon,
      color: "bg-purple-500",
    },
  ]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para los gráficos
  const [mantenimientosData, setMantenimientosData] = useState(null);
  const [equiposData, setEquiposData] = useState(null);
  const [costosData, setCostosData] = useState(null);
  const [eventosData, setEventosData] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Obtener estadísticas de equipos
      const { data: equipos, error: equiposError } = await supabase
        .from('equipos')
        .select('*');

      if (equiposError) throw equiposError;

      // Obtener estadísticas de mantenimientos
      const { data: mantenimientos, error: mantenimientosError } = await supabase
        .from('mantenimientos')
        .select('*');

      if (mantenimientosError) throw mantenimientosError;

      // Calcular estadísticas con normalización de estados
      const totalEquipos = equipos?.length || 0;
      
      // Normalizar estados (convertir a minúsculas y manejar variaciones)
      const normalizarEstado = (estado) => {
        if (!estado) return '';
        const estadoLower = estado.toLowerCase().trim();
        // Mapear posibles variaciones
        if (estadoLower === 'activo' || estadoLower === 'disponible') return 'activo';
        if (estadoLower === 'mantenimiento' || estadoLower === 'en mantenimiento') return 'mantenimiento';
        if (estadoLower === 'fuera-servicio' || estadoLower === 'fuera de servicio' || estadoLower === 'fuera_de_servicio') return 'fuera-servicio';
        return estadoLower;
      };

      const equiposActivos = equipos?.filter(e => normalizarEstado(e.estado) === 'activo').length || 0;
      const equiposMantenimiento = equipos?.filter(e => normalizarEstado(e.estado) === 'mantenimiento').length || 0;
      const equiposFueraServicio = equipos?.filter(e => normalizarEstado(e.estado) === 'fuera-servicio').length || 0;
      
      // Debug: verificar estados reales
      console.log('Estados únicos en BD:', [...new Set(equipos?.map(e => e.estado))]);
      console.log('Equipos activos encontrados:', equiposActivos);
      console.log('Equipos en mantenimiento:', equiposMantenimiento);
      console.log('Equipos fuera de servicio:', equiposFueraServicio);
      
      const mantenimientosPendientes = mantenimientos?.filter(m => {
        const estadoNormalizado = (m.estado || '').toLowerCase().trim();
        return estadoNormalizado === 'programado' || estadoNormalizado === 'pendiente';
      }).length || 0;
      
      // Próximos mantenimientos (en los próximos 7 días)
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0); // Normalizar a inicio del día
      const proximosMantenimientos = mantenimientos?.filter(m => {
        if (!m.fecha_programada) return false;
        const fechaProgramada = new Date(m.fecha_programada);
        fechaProgramada.setHours(0, 0, 0, 0);
        const diasDiferencia = Math.ceil((fechaProgramada - hoy) / (1000 * 60 * 60 * 24));
        return diasDiferencia >= 0 && diasDiferencia <= 7;
      }).length || 0;

      // Actualizar estadísticas (6 tarjetas como en la imagen)
      setStats([
        {
          name: "Total Equipos",
          value: totalEquipos.toString(),
          icon: CpuChipIcon,
          color: "bg-blue-500",
        },
        {
          name: "Equipos Activos",
          value: equiposActivos.toString(),
          icon: CheckCircleIcon,
          color: "bg-green-500",
        },
        {
          name: "En Mantenimiento",
          value: equiposMantenimiento.toString(),
          icon: WrenchScrewdriverIcon,
          color: "bg-yellow-500",
        },
        {
          name: "Fuera de Servicio",
          value: equiposFueraServicio.toString(),
          icon: XCircleIcon,
          color: "bg-red-500",
        },
        {
          name: "Mantenimientos Pendientes",
          value: mantenimientosPendientes.toString(),
          icon: ExclamationTriangleIcon,
          color: "bg-purple-500",
        },
        {
          name: "Próximos Mantenimientos",
          value: proximosMantenimientos.toString(),
          icon: CalendarIcon,
          color: "bg-pink-500",
        },
      ]);

      // Generar actividad reciente basada en datos reales
      const actividad = [];
      
      if (equipos && equipos.length > 0) {
        equipos.slice(0, 3).forEach(equipo => {
          actividad.push({
            text: `Equipo registrado: ${equipo.marca} ${equipo.modelo} - ${equipo.numero_serie}`,
            time: `Agregado el ${new Date(equipo.created_at).toLocaleDateString('es-ES')}`,
            type: 'green'
          });
        });
      }

      setRecentActivity(actividad);

      // Obtener datos para gráficos
      await fetchChartsData(equipos, mantenimientos);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchChartsData = async (equipos, mantenimientos) => {
    try {
      // Datos de mantenimientos por tipo (últimos 6 meses)
      const mantenimientosPorTipo = {
        preventivos: [12, 19, 3, 5, 2, 3], // Datos simulados - TODO: implementar datos reales
        correctivos: [2, 3, 20, 5, 1, 4]
      };
      setMantenimientosData(mantenimientosPorTipo);

      // Datos de equipos por estado
      const equiposPorEstado = [
        equipos?.filter(e => e.estado === 'activo').length || 0,
        equipos?.filter(e => e.estado === 'mantenimiento').length || 0,
        equipos?.filter(e => e.estado === 'fuera-servicio').length || 0
      ];
      
      // Debug: mostrar datos de equipos
      console.log('Total equipos:', equipos?.length || 0);
      console.log('Equipos por estado:', equiposPorEstado);
      console.log('Estados únicos:', [...new Set(equipos?.map(e => e.estado))]);
      
      setEquiposData(equiposPorEstado);

      // Calcular costos reales por departamento
      const costosPorDepartamento = {};
      
      if (mantenimientos && mantenimientos.length > 0 && equipos && equipos.length > 0) {
        // Crear un mapa de equipos por ID para acceso rápido
        const equiposMap = {};
        equipos.forEach(equipo => {
          equiposMap[equipo.id] = equipo;
        });

        // Calcular costos por departamento desde los mantenimientos
        mantenimientos.forEach(mantenimiento => {
          if (mantenimiento.equipo_id) {
            const equipo = equiposMap[mantenimiento.equipo_id];
            if (equipo && equipo.departamento) {
              const depto = equipo.departamento;
              
              // Si el mantenimiento tiene costo, usarlo; sino, usar costo promedio del equipo
              let costo = mantenimiento.costo || 0;
              
              // Si no hay costo en el mantenimiento, usar el costo promedio del equipo
              if (!costo && equipo.costo_promedio_mantenimiento) {
                costo = equipo.costo_promedio_mantenimiento;
              }
              
              // Agregar al acumulador del departamento
              if (!costosPorDepartamento[depto]) {
                costosPorDepartamento[depto] = 0;
              }
              costosPorDepartamento[depto] += parseFloat(costo) || 0;
            }
          }
        });

        // También considerar equipos que tienen costo promedio pero sin mantenimientos registrados
        equipos.forEach(equipo => {
          if (equipo.departamento && equipo.costo_promedio_mantenimiento) {
            // Verificar si ya hay mantenimientos para este equipo
            const tieneMantenimientos = mantenimientos.some(m => m.equipo_id === equipo.id);
            
            // Si no tiene mantenimientos registrados, pero tiene costo promedio, agregar un valor estimado
            // Solo si el departamento no tiene costos aún o queremos incluir un estimado
            if (!tieneMantenimientos) {
              // Opcional: agregar costo estimado basado en equipos sin mantenimientos
              // Por ahora no lo hacemos para evitar duplicar costos
            }
          }
        });
      }

      // Convertir a arrays para el gráfico (ordenar por costo descendente)
      const departamentosOrdenados = Object.entries(costosPorDepartamento)
        .sort((a, b) => b[1] - a[1]) // Ordenar por costo descendente
        .slice(0, 5); // Top 5 departamentos

      const labelsDeptos = departamentosOrdenados.map(([depto]) => depto || 'Sin departamento');
      const valoresCostos = departamentosOrdenados.map(([, costo]) => {
        // Convertir a miles para mostrar mejor en el gráfico
        return parseFloat((costo / 1000).toFixed(1));
      });

      // Si no hay datos, mostrar valores vacíos
      if (labelsDeptos.length === 0) {
        labelsDeptos.push('Sin datos');
        valoresCostos.push(0);
      }

      setCostosData({
        labels: labelsDeptos,
        valores: valoresCostos
      });

      // Obtener eventos por equipo
      const { data: eventos, error: eventosError } = await supabase
        .from('historial_eventos')
        .select('equipo_id, fecha_evento');

      if (!eventosError && eventos) {
        // Agrupar eventos por equipo
        const eventosPorEquipo = {};
        eventos.forEach(evento => {
          if (!eventosPorEquipo[evento.equipo_id]) {
            eventosPorEquipo[evento.equipo_id] = 0;
          }
          eventosPorEquipo[evento.equipo_id]++;
        });

        // Obtener nombres de equipos
        const equiposConEventos = equipos?.filter(e => eventosPorEquipo[e.id]) || [];
        const nombresEquipos = equiposConEventos.map(e => `${e.marca || 'Sin marca'} ${e.modelo || 'Sin modelo'}`);
        const frecuenciaEventos = equiposConEventos.map(e => eventosPorEquipo[e.id] || 0);

        setEventosData({
          equipos: nombresEquipos.slice(0, 5), // Top 5 equipos
          frecuencia: frecuenciaEventos.slice(0, 5)
        });
      }

    } catch (error) {
      console.error('Error fetching charts data:', error);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Inicio</h1>
          <p className="dashboard-subtitle">
            Cargando datos...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Inicio</h1>
        <p className="dashboard-subtitle">
          Resumen general del estado de la tecnología médica
        </p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {stats.map((stat) => (
          <div key={stat.name} className="stat-card">
            <div className="stat-card-content">
              <div className="stat-card-inner">
                <div className="stat-icon-container">
                  <div className={`stat-icon-wrapper ${stat.color.replace('bg-', '').replace('-500', '')}`}>
                    {stat.name === "Total Equipos" && (
                      <svg className="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                        <line x1="8" y1="21" x2="16" y2="21"/>
                        <line x1="12" y1="17" x2="12" y2="21"/>
                      </svg>
                    )}
                    {stat.name === "Mantenimientos Pendientes" && (
                      <svg className="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                        <line x1="12" y1="9" x2="12" y2="13"/>
                        <line x1="12" y1="17" x2="12.01" y2="17"/>
                      </svg>
                    )}
                    {stat.name === "Equipos Activos" && (
                      <svg className="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                        <polyline points="22,4 12,14.01 9,11.01"/>
                      </svg>
                    )}
                    {stat.name === "Próximos Mantenimientos" && (
                      <svg className="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12,6 12,12 16,14"/>
                      </svg>
                    )}
                  </div>
                </div>
                <div className="stat-content">
                  <div className="stat-label">
                    {stat.name}
                  </div>
                  <div className="stat-value">
                    {stat.value}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <DashboardCharts 
        mantenimientosData={mantenimientosData}
        equiposData={equiposData}
        costosData={costosData}
        eventosData={eventosData}
      />

      {/* Recent Activity */}
      <div className="activity-section">
        <div className="activity-card">
          <div className="activity-card-content">
            <h3 className="activity-title">
              Actividad Reciente
            </h3>
            <div className="activity-list">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity, index) => (
                  <div key={index} className="activity-item">
                    <div className="activity-indicator">
                      <div className={`activity-dot ${activity.type}`}></div>
                    </div>
                    <div className="activity-content">
                      <p className="activity-text">
                        {activity.text}
                      </p>
                      <p className="activity-time">{activity.time}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="activity-item">
                  <div className="activity-content">
                    <p className="activity-text">
                      No hay actividad reciente
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
