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
  Filler,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

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
  Filler
);

const DashboardCharts = ({ 
  eventosData,
  roturasData,
  inversionData
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
        labels: {
          font: {
            size: 12,
            weight: '500'
          },
          padding: 15,
          usePointStyle: true
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 14,
          weight: '600'
        },
        bodyFont: {
          size: 13
        },
        cornerRadius: 8
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          font: {
            size: 11
          },
          color: '#6b7280'
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 11
          },
          color: '#6b7280'
        }
      }
    }
  };

  // Datos para gráfico de Eventos en el tiempo
  const eventosChartData = {
    labels: eventosData?.labels || ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Cantidad de Eventos',
        data: eventosData?.values || [0, 0, 0, 0, 0, 0],
        borderColor: 'rgba(59, 130, 246, 1)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: 'rgba(59, 130, 246, 1)',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2
      },
    ],
  };

  // Datos para gráfico de Roturas (Mantenimientos Correctivos) en el tiempo
  const roturasChartData = {
    labels: roturasData?.labels || ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Mantenimientos Correctivos',
        data: roturasData?.values || [0, 0, 0, 0, 0, 0],
        borderColor: 'rgba(239, 68, 68, 1)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: 'rgba(239, 68, 68, 1)',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2
      },
    ],
  };

  // Datos para gráfico de Inversión (estructura preparada, sin datos aún)
  const inversionChartData = {
    labels: ['Insumos', 'Accesorios', 'Equipos Médicos'],
    datasets: [
      {
        label: 'Inversión ($)',
        data: inversionData?.values || [0, 0, 0],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(168, 85, 247, 0.8)',
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(168, 85, 247, 1)',
        ],
        borderWidth: 2,
        borderRadius: 8
      },
    ],
  };

  return (
    <div className="dashboard-charts">
      {/* Overlay para gráficos expandidos */}
      {expandedChart && (
        <div className="chart-overlay active" onClick={() => setExpandedChart(null)} />
      )}
      
      {/* Desktop Charts */}
      <div className="charts-grid">
        
        {/* Gráfico de Eventos */}
        <div 
          className={`chart-container ${expandedChart === 'eventos' ? 'expanded' : ''}`}
          onClick={() => toggleChartExpansion('eventos')}
        >
          <div className="chart-header">
            <h3>Eventos</h3>
            <p>Cantidad de eventos registrados en el tiempo</p>
          </div>
          <div className="chart-wrapper">
            <Line 
              data={eventosChartData} 
              options={{
                ...chartOptions,
                plugins: {
                  ...chartOptions.plugins,
                  title: {
                    display: false
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

        {/* Gráfico de Roturas */}
        <div 
          className={`chart-container ${expandedChart === 'roturas' ? 'expanded' : ''}`}
          onClick={() => toggleChartExpansion('roturas')}
        >
          <div className="chart-header">
            <h3>Roturas</h3>
            <p>Cantidad de mantenimientos correctivos en el tiempo</p>
          </div>
          <div className="chart-wrapper">
            <Line 
              data={roturasChartData} 
              options={{
                ...chartOptions,
                plugins: {
                  ...chartOptions.plugins,
                  title: {
                    display: false
                  }
                }
              }} 
            />
          </div>
          {expandedChart === 'roturas' && (
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

        {/* Gráfico de Inversión */}
        <div 
          className={`chart-container ${expandedChart === 'inversion' ? 'expanded' : ''}`}
          onClick={() => toggleChartExpansion('inversion')}
        >
          <div className="chart-header">
            <h3>Inversión</h3>
            <p>Dinero invertido en insumos, accesorios y equipos médicos</p>
          </div>
          <div className="chart-wrapper">
            <Bar 
              data={inversionChartData} 
              options={{
                ...chartOptions,
                plugins: {
                  ...chartOptions.plugins,
                  title: {
                    display: false
                  }
                }
              }} 
            />
          </div>
          {expandedChart === 'inversion' && (
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
