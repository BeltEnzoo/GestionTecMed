import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

const DashboardCharts = ({ 
  mantenimientosData, 
  equiposData, 
  costosData,
  eventosData 
}) => {
  const [expandedChart, setExpandedChart] = useState(null);
  
  // Función para expandir/contraer gráficos
  const toggleChartExpansion = (chartId) => {
    setExpandedChart(expandedChart === chartId ? null : chartId);
  };
  
  // Configuración común para los gráficos
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        font: {
          family: 'Georgia, Times New Roman, Times, serif',
          size: 16,
          weight: 'bold'
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          font: {
            family: 'Georgia, Times New Roman, Times, serif'
          }
        }
      },
      x: {
        ticks: {
          font: {
            family: 'Georgia, Times New Roman, Times, serif'
          }
        }
      }
    }
  };

  // Datos para gráfico de tendencias de mantenimientos
  const mantenimientosChartData = {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Preventivos',
        data: mantenimientosData?.preventivos || [12, 19, 3, 5, 2, 3],
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 2,
      },
      {
        label: 'Correctivos',
        data: mantenimientosData?.correctivos || [2, 3, 20, 5, 1, 4],
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 2,
      },
    ],
  };

  // Datos para gráfico de costos por departamento
  const costosChartData = {
    labels: ['UTI', 'Emergencias', 'Cirugía', 'Cardiología', 'Neurología'],
    datasets: [
      {
        label: 'Costos (Miles $)',
        data: costosData || [45, 32, 28, 15, 22],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)',
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(139, 92, 246, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  // Datos para gráfico de eventos por equipo
  const eventosChartData = {
    labels: eventosData?.equipos || ['Respirador MP86', 'Desfibrilador Zoll', 'Monitor Cardíaco'],
    datasets: [
      {
        label: 'Eventos (últimos 6 meses)',
        data: eventosData?.frecuencia || [8, 12, 5],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(16, 185, 129, 0.8)',
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(16, 185, 129, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  // Calcular estadísticas para móvil
  const mobileStats = {
    totalMantenimientos: (mantenimientosData?.preventivos || []).reduce((a, b) => a + b, 0) + 
                        (mantenimientosData?.correctivos || []).reduce((a, b) => a + b, 0),
    totalCostos: (costosData || []).reduce((a, b) => a + b, 0),
    equiposActivos: equiposData?.[0] || 0,
    totalEventos: (eventosData?.frecuencia || []).reduce((a, b) => a + b, 0),
  };

  return (
    <div className="dashboard-charts">
      {/* Overlay para gráficos expandidos */}
      {expandedChart && (
        <div className="chart-overlay active" onClick={() => setExpandedChart(null)} />
      )}
      
      {/* Mobile Stats Cards - Only visible on mobile */}
      <div className="mobile-stats-grid">
        <div className="mobile-stat-card">
          <div className="mobile-stat-number">{mobileStats.totalMantenimientos}</div>
          <div className="mobile-stat-label">Mantenimientos</div>
          <div className="mobile-stat-description">Últimos 6 meses</div>
          <div className="mobile-stat-trend positive">↗ +12% vs anterior</div>
        </div>
        
        <div className="mobile-stat-card">
          <div className="mobile-stat-number">${mobileStats.totalCostos}K</div>
          <div className="mobile-stat-label">Inversión Total</div>
          <div className="mobile-stat-description">En mantenimientos</div>
          <div className="mobile-stat-trend neutral">→ Estable</div>
        </div>
        
        <div className="mobile-stat-card">
          <div className="mobile-stat-number">{mobileStats.equiposActivos}%</div>
          <div className="mobile-stat-label">Equipos Activos</div>
          <div className="mobile-stat-description">Disponibles para uso</div>
          <div className="mobile-stat-trend positive">↗ +5% este mes</div>
        </div>
        
        <div className="mobile-stat-card">
          <div className="mobile-stat-number">{mobileStats.totalEventos}</div>
          <div className="mobile-stat-label">Eventos Registrados</div>
          <div className="mobile-stat-description">En equipos críticos</div>
          <div className="mobile-stat-trend negative">↘ -8% vs anterior</div>
        </div>
      </div>

      {/* Desktop Charts - Hidden on mobile */}
      <div className="charts-grid">
        
        {/* Gráfico de Tendencias de Mantenimientos */}
        <div 
          className={`chart-container ${expandedChart === 'mantenimientos' ? 'expanded' : ''}`}
          onClick={() => toggleChartExpansion('mantenimientos')}
        >
          <div className="chart-header">
            <h3>Tendencias de Mantenimientos</h3>
            <p>Últimos 6 meses</p>
          </div>
          <div className="chart-wrapper">
            <Bar 
              data={mantenimientosChartData} 
              options={{
                ...chartOptions,
                plugins: {
                  ...chartOptions.plugins,
                  title: {
                    ...chartOptions.plugins.title,
                    text: 'Mantenimientos por Tipo'
                  }
                }
              }} 
            />
          </div>
          {expandedChart === 'mantenimientos' && (
            <button 
              className="chart-close-btn"
              onClick={(e) => {
                e.stopPropagation();
                setExpandedChart(null);
              }}
            >
              ×
            </button>
          )}
        </div>

        {/* Gráfico de Costos por Departamento */}
        <div 
          className={`chart-container ${expandedChart === 'costos' ? 'expanded' : ''}`}
          onClick={() => toggleChartExpansion('costos')}
        >
          <div className="chart-header">
            <h3>Costos por Departamento</h3>
            <p>Mantenimientos y reparaciones</p>
          </div>
          <div className="chart-wrapper">
            <Bar 
              data={costosChartData} 
              options={{
                ...chartOptions,
                plugins: {
                  ...chartOptions.plugins,
                  title: {
                    ...chartOptions.plugins.title,
                    text: 'Inversión por Área'
                  }
                }
              }} 
            />
          </div>
          {expandedChart === 'costos' && (
            <button 
              className="chart-close-btn"
              onClick={(e) => {
                e.stopPropagation();
                setExpandedChart(null);
              }}
            >
              ×
            </button>
          )}
        </div>

        {/* Gráfico de Eventos por Equipo */}
        <div 
          className={`chart-container ${expandedChart === 'eventos' ? 'expanded' : ''}`}
          onClick={() => toggleChartExpansion('eventos')}
        >
          <div className="chart-header">
            <h3>Frecuencia de Eventos</h3>
            <p>Registros por equipo</p>
          </div>
          <div className="chart-wrapper">
            <Line 
              data={eventosChartData} 
              options={{
                ...chartOptions,
                plugins: {
                  ...chartOptions.plugins,
                  title: {
                    ...chartOptions.plugins.title,
                    text: 'Actividad de Equipos'
                  }
                }
              }} 
            />
          </div>
          {expandedChart === 'eventos' && (
            <button 
              className="chart-close-btn"
              onClick={(e) => {
                e.stopPropagation();
                setExpandedChart(null);
              }}
            >
              ×
            </button>
          )}
        </div>

        {/* Gráfico de Distribución de Equipos */}
        <div 
          className={`chart-container ${expandedChart === 'equipos' ? 'expanded' : ''}`}
          onClick={() => toggleChartExpansion('equipos')}
        >
          <div className="chart-header">
            <h3>Distribución por Estado</h3>
            <p>Estado actual de equipos</p>
          </div>
          <div className="chart-wrapper">
            <Doughnut 
              data={{
                labels: ['Activos', 'Mantenimiento', 'Fuera de Servicio'],
                datasets: [
                  {
                    data: equiposData || [0, 0, 0],
                    backgroundColor: [
                      'rgba(34, 197, 94, 0.8)',
                      'rgba(245, 158, 11, 0.8)',
                      'rgba(239, 68, 68, 0.8)',
                    ],
                    borderColor: [
                      'rgba(34, 197, 94, 1)',
                      'rgba(245, 158, 11, 1)',
                      'rgba(239, 68, 68, 1)',
                    ],
                    borderWidth: 2,
                  },
                ],
              }}
              options={{
                ...chartOptions,
                plugins: {
                  ...chartOptions.plugins,
                  title: {
                    ...chartOptions.plugins.title,
                    text: 'Estado de Equipos'
                  }
                }
              }} 
            />
          </div>
          {expandedChart === 'equipos' && (
            <button 
              className="chart-close-btn"
              onClick={(e) => {
                e.stopPropagation();
                setExpandedChart(null);
              }}
            >
              ×
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default DashboardCharts;
