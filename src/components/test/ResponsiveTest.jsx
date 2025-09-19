import React from 'react';

const ResponsiveTest = () => {
  return (
    <div className="responsive-test-container" style={{ padding: '2rem', background: '#f9fafb', minHeight: '100vh' }}>
      <div className="responsive-test-content" style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Header */}
        <div className="responsive-test-header" style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 className="responsive-test-title" style={{ fontSize: '2rem', fontWeight: '700', color: '#111827', marginBottom: '0.5rem' }}>
            📱 Test de Responsividad
          </h1>
          <p className="responsive-test-subtitle" style={{ color: '#6b7280', fontSize: '1.125rem' }}>
            Verificación de diseño en diferentes dispositivos
          </p>
        </div>

        {/* Grid Test */}
        <div className="responsive-test-grid" style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#111827', marginBottom: '1rem' }}>
            Grid Responsivo
          </h2>
          <div className="grid-responsive-4" style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '1rem',
            marginBottom: '1rem'
          }}>
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="responsive-test-card" style={{
                background: 'white',
                padding: '1.5rem',
                borderRadius: '0.75rem',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📦</div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827', marginBottom: '0.5rem' }}>
                  Card {item}
                </h3>
                <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                  Este es un ejemplo de card responsivo que se adapta al tamaño de pantalla.
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Form Test */}
        <div className="responsive-test-form" style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#111827', marginBottom: '1rem' }}>
            Formulario Responsivo
          </h2>
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '0.75rem',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1rem',
              marginBottom: '1rem'
            }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                  Nombre
                </label>
                <input 
                  type="text" 
                  placeholder="Ingresa tu nombre"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                  Email
                </label>
                <input 
                  type="email" 
                  placeholder="tu@email.com"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem'
                  }}
                />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                Mensaje
              </label>
              <textarea 
                placeholder="Escribe tu mensaje aquí..."
                rows="4"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  resize: 'vertical'
                }}
              />
            </div>
          </div>
        </div>

        {/* Button Test */}
        <div className="responsive-test-buttons" style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#111827', marginBottom: '1rem' }}>
            Botones Responsivos
          </h2>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1rem',
            justifyContent: 'center'
          }}>
            <button style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: 'pointer'
            }}>
              Botón Principal
            </button>
            <button style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: 'white',
              color: '#374151',
              border: '1px solid #d1d5db',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: 'pointer'
            }}>
              Botón Secundario
            </button>
            <button style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: 'pointer'
            }}>
              Botón de Peligro
            </button>
          </div>
        </div>

        {/* Table Test */}
        <div className="responsive-test-table">
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#111827', marginBottom: '1rem' }}>
            Tabla Responsiva
          </h2>
          <div style={{
            background: 'white',
            borderRadius: '0.75rem',
            overflow: 'hidden',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            overflowX: 'auto'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
              <thead style={{ backgroundColor: '#f9fafb' }}>
                <tr>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#374151', fontSize: '0.875rem' }}>
                    Nombre
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#374151', fontSize: '0.875rem' }}>
                    Email
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#374151', fontSize: '0.875rem' }}>
                    Rol
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#374151', fontSize: '0.875rem' }}>
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: 'Juan Pérez', email: 'juan@hospital.com', role: 'Técnico', status: 'Activo' },
                  { name: 'María García', email: 'maria@hospital.com', role: 'Administrador', status: 'Activo' },
                  { name: 'Carlos López', email: 'carlos@hospital.com', role: 'Invitado', status: 'Inactivo' }
                ].map((user, index) => (
                  <tr key={index} style={{ borderTop: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#111827' }}>
                      {user.name}
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
                      {user.email}
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
                      {user.role}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        backgroundColor: user.status === 'Activo' ? '#dcfce7' : '#f3f4f6',
                        color: user.status === 'Activo' ? '#166534' : '#374151'
                      }}>
                        {user.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Instructions */}
        <div style={{
          marginTop: '3rem',
          padding: '1.5rem',
          background: 'white',
          borderRadius: '0.75rem',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          textAlign: 'center'
        }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827', marginBottom: '1rem' }}>
            📋 Instrucciones de Prueba
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', textAlign: 'left' }}>
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#111827', marginBottom: '0.5rem' }}>
                📱 Móvil (0-639px)
              </h4>
              <ul style={{ fontSize: '0.875rem', color: '#6b7280', paddingLeft: '1rem' }}>
                <li>Grid se convierte en 1 columna</li>
                <li>Botones apilados verticalmente</li>
                <li>Tabla con scroll horizontal</li>
              </ul>
            </div>
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#111827', marginBottom: '0.5rem' }}>
                📱 Tablet (640-1023px)
              </h4>
              <ul style={{ fontSize: '0.875rem', color: '#6b7280', paddingLeft: '1rem' }}>
                <li>Grid de 2 columnas</li>
                <li>Formularios en 2 columnas</li>
                <li>Botones en fila</li>
              </ul>
            </div>
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#111827', marginBottom: '0.5rem' }}>
                💻 Desktop (1024px+)
              </h4>
              <ul style={{ fontSize: '0.875rem', color: '#6b7280', paddingLeft: '1rem' }}>
                <li>Grid de 4 columnas</li>
                <li>Formularios optimizados</li>
                <li>Tabla sin scroll</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResponsiveTest;


