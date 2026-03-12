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
  const [eventosData, setEventosData] = useState(null);
  const [roturasData, setRoturasData] = useState(null);
  const [inversionData, setInversionData] = useState(null);

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
      // Obtener eventos agrupados por mes (últimos 6 meses)
      const { data: eventos, error: eventosError } = await supabase
        .from('historial_eventos')
        .select('fecha_evento')
        .order('fecha_evento', { ascending: true });

      if (!eventosError && eventos && eventos.length > 0) {
        // Calcular eventos por mes (últimos 6 meses)
        const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'];
        const eventosPorMes = [0, 0, 0, 0, 0, 0];
        
        const hoy = new Date();
        eventos.forEach(evento => {
          if (evento.fecha_evento) {
            const fechaEvento = new Date(evento.fecha_evento);
            const mesesAtras = Math.floor((hoy - fechaEvento) / (1000 * 60 * 60 * 24 * 30));
            
            if (mesesAtras >= 0 && mesesAtras < 6) {
              eventosPorMes[5 - mesesAtras]++;
            }
          }
        });

        setEventosData({
          labels: meses,
          values: eventosPorMes
        });
      } else {
        // Si no hay eventos, mostrar datos vacíos
        setEventosData({
          labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
          values: [0, 0, 0, 0, 0, 0]
        });
      }

      // Obtener mantenimientos correctivos agrupados por mes (últimos 6 meses)
      if (mantenimientos && mantenimientos.length > 0) {
        const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'];
        const roturasPorMes = [0, 0, 0, 0, 0, 0];
        
        const hoy = new Date();
        mantenimientos.forEach(mantenimiento => {
          // Filtrar solo mantenimientos correctivos
          const tipoNormalizado = (mantenimiento.tipo || '').toLowerCase().trim();
          if (tipoNormalizado === 'correctivo' || tipoNormalizado === 'reparación') {
            if (mantenimiento.fecha_programada || mantenimiento.fecha_realizacion) {
              const fechaMantenimiento = new Date(mantenimiento.fecha_realizacion || mantenimiento.fecha_programada);
              const mesesAtras = Math.floor((hoy - fechaMantenimiento) / (1000 * 60 * 60 * 24 * 30));
              
              if (mesesAtras >= 0 && mesesAtras < 6) {
                roturasPorMes[5 - mesesAtras]++;
              }
            }
          }
        });

        setRoturasData({
          labels: meses,
          values: roturasPorMes
        });
      } else {
        // Si no hay mantenimientos, mostrar datos vacíos
        setRoturasData({
          labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
          values: [0, 0, 0, 0, 0, 0]
        });
      }

      // Estructura para gráfico de inversión (sin datos aún)
      setInversionData({
        values: [0, 0, 0] // Insumos, Accesorios, Equipos Médicos
      });

    } catch (error) {
      console.error('Error fetching charts data:', error);
      // En caso de error, establecer datos vacíos
      setEventosData({
        labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
        values: [0, 0, 0, 0, 0, 0]
      });
      setRoturasData({
        labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
        values: [0, 0, 0, 0, 0, 0]
      });
      setInversionData({
        values: [0, 0, 0]
      });
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
        {stats.map((stat) => {
          const colorClass = stat.color.replace('bg-', '').replace('-500', '');
          return (
            <div key={stat.name} className={`stat-card ${colorClass}`}>
              <div className="stat-card-content">
                <div className="stat-label">
                  {stat.name}
                </div>
                <div className="stat-value">
                  {stat.value}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <DashboardCharts 
        eventosData={eventosData}
        roturasData={roturasData}
        inversionData={inversionData}
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
