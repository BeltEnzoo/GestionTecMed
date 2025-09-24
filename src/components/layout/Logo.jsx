import React from 'react';

const Logo = ({ className = "", size = 32 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Fondo circular */}
      <circle
        cx="32"
        cy="32"
        r="30"
        fill="url(#gradient)"
        stroke="url(#borderGradient)"
        strokeWidth="2"
      />
      
      {/* Cruz médica central */}
      <rect
        x="28"
        y="16"
        width="8"
        height="32"
        rx="2"
        fill="white"
      />
      <rect
        x="16"
        y="28"
        width="32"
        height="8"
        rx="2"
        fill="white"
      />
      
      {/* Elementos tecnológicos */}
      {/* Chip/CPU en la esquina superior izquierda */}
      <rect
        x="12"
        y="12"
        width="8"
        height="6"
        rx="1"
        fill="rgba(255, 255, 255, 0.8)"
      />
      <rect
        x="13"
        y="13"
        width="6"
        height="4"
        rx="0.5"
        fill="url(#techGradient)"
      />
      
      {/* Monitor en la esquina superior derecha */}
      <rect
        x="44"
        y="12"
        width="8"
        height="6"
        rx="1"
        fill="rgba(255, 255, 255, 0.8)"
      />
      <rect
        x="45"
        y="13"
        width="6"
        height="4"
        rx="0.5"
        fill="url(#techGradient)"
      />
      
      {/* Equipos médicos en las esquinas inferiores */}
      {/* Respirador (inferior izquierda) */}
      <circle
        cx="16"
        cy="48"
        r="4"
        fill="rgba(255, 255, 255, 0.8)"
      />
      <path
        d="M14 48 L18 48 M16 46 L16 50"
        stroke="url(#techGradient)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      
      {/* Monitor de signos (inferior derecha) */}
      <rect
        x="44"
        y="44"
        width="8"
        height="6"
        rx="1"
        fill="rgba(255, 255, 255, 0.8)"
      />
      <path
        d="M45 45.5 L47 46.5 L49 45 L51 47"
        stroke="url(#techGradient)"
        strokeWidth="1"
        fill="none"
      />
      
      {/* Gradientes */}
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="50%" stopColor="#1E40AF" />
          <stop offset="100%" stopColor="#1E3A8A" />
        </linearGradient>
        
        <linearGradient id="borderGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#60A5FA" />
          <stop offset="100%" stopColor="#2563EB" />
        </linearGradient>
        
        <linearGradient id="techGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export default Logo;
