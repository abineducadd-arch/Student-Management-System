import React from 'react';

// Elegant Botanical Leaf Branch Logo
export const AureliaLogoIcon: React.FC<{ className?: string }> = ({ className = "w-8 h-8 text-forest" }) => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M24 44C24 44 24 24 38 12C38 12 36 28 24 44Z" fill="currentColor" fillOpacity="0.85" />
    <path d="M24 44C24 44 24 20 10 10C10 10 12 26 24 44Z" fill="currentColor" fillOpacity="0.65" />
    <path d="M24 44C24 44 23 14 24 4C24 4 28 12 24 44Z" fill="currentColor" />
    <circle cx="37" cy="11" r="2" fill="#D9E2C6" />
    <circle cx="11" cy="9" r="2" fill="#E9D3B5" />
    <circle cx="24" cy="4" r="2" fill="#DDD1EA" />
  </svg>
);

// Botanical leaf sprig watermark for cards
export const LeafWatermark: React.FC<{ className?: string; color?: string }> = ({ className = "w-24 h-24", color = "#D9E2C6" }) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M20 90C40 70 60 50 85 15" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.4" />
    <path d="M45 65C58 55 68 62 65 72C60 76 50 74 45 65Z" fill={color} fillOpacity="0.25" />
    <path d="M62 48C75 38 85 45 82 55C77 59 67 57 62 48Z" fill={color} fillOpacity="0.25" />
    <path d="M30 80C22 70 24 60 34 62C38 67 36 77 30 80Z" fill={color} fillOpacity="0.25" />
    <path d="M78 25C88 18 95 24 92 32C87 36 80 34 78 25Z" fill={color} fillOpacity="0.28" />
  </svg>
);

// Hand-drawn sunshine sparkle rays
export const SunRays: React.FC<{ className?: string }> = ({ className = "w-6 h-6 text-amber-600" }) => (
  <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={className}>
    <line x1="16" y1="2" x2="16" y2="7" />
    <line x1="26" y1="6" x2="22" y2="10" />
    <line x1="30" y1="16" x2="25" y2="16" />
    <line x1="26" y1="26" x2="22" y2="22" />
    <line x1="16" y1="30" x2="16" y2="25" />
    <line x1="6" y1="26" x2="10" y2="22" />
    <line x1="2" y1="16" x2="7" y2="16" />
    <line x1="6" y1="6" x2="10" y2="10" />
  </svg>
);

// Arched Campus Clock Tower & Botanical Gardens illustration
export const CampusArchIllustration: React.FC<{ className?: string }> = ({ className = "w-full h-full" }) => (
  <div className={`relative overflow-hidden ${className}`}>
    <svg viewBox="0 0 340 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full object-cover">
      <defs>
        <clipPath id="archClip">
          <path d="M40 220V90C40 40 90 20 170 20C250 20 300 40 300 90V220H40Z" />
        </clipPath>
        <linearGradient id="skyGrad" x1="170" y1="0" x2="170" y2="220" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F9F5EC" />
          <stop offset="60%" stopColor="#EADECB" />
          <stop offset="100%" stopColor="#D9CBB7" />
        </linearGradient>
        <linearGradient id="warmSun" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F5D7B5" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#D9E2C6" stopOpacity="0.4" />
        </linearGradient>
      </defs>

      {/* Decorative background sun & soft botanical circles */}
      <circle cx="100" cy="110" r="70" fill="url(#warmSun)" />
      <circle cx="280" cy="80" r="45" fill="#D9E2C6" fillOpacity="0.4" />

      {/* Campus Building Arched Cutout */}
      <g clipPath="url(#archClip)">
        <rect x="0" y="0" width="340" height="220" fill="url(#skyGrad)" />
        
        {/* Soft clouds */}
        <ellipse cx="140" cy="65" rx="50" ry="12" fill="#FAF6EE" fillOpacity="0.6" />
        <ellipse cx="230" cy="50" rx="40" ry="10" fill="#FAF6EE" fillOpacity="0.6" />

        {/* Main Italianate/Collegiate Clock Tower */}
        <g id="tower" transform="translate(190, 45)">
          {/* Tower roof spire */}
          <polygon points="25,5 15,35 35,35" fill="#B35E44" />
          <line x1="25" y1="0" x2="25" y2="5" stroke="#4F382E" strokeWidth="1.5" />
          
          {/* Bell chamber with open arches */}
          <rect x="15" y="35" width="20" height="30" fill="#D6B898" />
          <rect x="19" y="40" width="12" height="18" rx="6" fill="#4B3B33" />
          {/* Bell silhouette */}
          <circle cx="25" cy="49" r="3" fill="#D48B38" />

          {/* Clock face section */}
          <rect x="13" y="65" width="24" height="28" fill="#E2C9AC" />
          <circle cx="25" cy="79" r="7" fill="#FAF6EE" stroke="#4B3B33" strokeWidth="1" />
          <line x1="25" y1="79" x2="25" y2="75" stroke="#4B3B33" strokeWidth="1.2" />
          <line x1="25" y1="79" x2="28" y2="79" stroke="#4B3B33" strokeWidth="1.2" />

          {/* Lower tower shaft */}
          <rect x="12" y="93" width="26" height="85" fill="#DCBEA0" />
          <rect x="19" y="105" width="12" height="15" rx="2" fill="#7D6254" />
          <rect x="19" y="130" width="12" height="15" rx="2" fill="#7D6254" />
        </g>

        {/* Collegiate Wing Building Left */}
        <g id="hall-left" transform="translate(90, 115)">
          {/* Roof */}
          <polygon points="0,20 100,20 90,0 10,0" fill="#B35E44" />
          {/* Facade */}
          <rect x="5" y="20" width="95" height="70" fill="#DFCAA5" />
          {/* Windows columns */}
          <rect x="15" y="28" width="10" height="16" rx="5" fill="#5A473D" />
          <rect x="35" y="28" width="10" height="16" rx="5" fill="#5A473D" />
          <rect x="55" y="28" width="10" height="16" rx="5" fill="#5A473D" />
          <rect x="75" y="28" width="10" height="16" rx="5" fill="#5A473D" />
          
          <rect x="15" y="52" width="10" height="18" rx="2" fill="#5A473D" />
          <rect x="35" y="52" width="10" height="18" rx="2" fill="#5A473D" />
          <rect x="55" y="52" width="10" height="18" rx="2" fill="#5A473D" />
          <rect x="75" y="52" width="10" height="18" rx="2" fill="#5A473D" />
        </g>

        {/* Portico columns & entryway */}
        <g id="entry" transform="translate(145, 145)">
          <rect x="0" y="0" width="40" height="40" fill="#D2B994" />
          <rect x="8" y="10" width="24" height="30" rx="12" fill="#3D302A" />
        </g>

        {/* Lush Green Trees and Botanical Foliage in Foreground */}
        {/* Tree 1 Left */}
        <ellipse cx="65" cy="180" rx="35" ry="30" fill="#5E7852" />
        <ellipse cx="80" cy="165" rx="25" ry="25" fill="#759367" />
        <ellipse cx="55" cy="160" rx="22" ry="22" fill="#88A879" />
        <circle cx="70" cy="155" r="14" fill="#9FB88F" />

        {/* Tree 2 Center-Right */}
        <ellipse cx="245" cy="175" rx="30" ry="26" fill="#4B6640" />
        <ellipse cx="260" cy="160" rx="24" ry="22" fill="#69885C" />
        <ellipse cx="230" cy="165" rx="20" ry="20" fill="#7E9E70" />

        {/* Tree 3 Right Edge */}
        <ellipse cx="295" cy="180" rx="28" ry="28" fill="#5E7852" />
        <ellipse cx="285" cy="155" rx="18" ry="18" fill="#7A986B" />

        {/* Manicured Lawn Grass */}
        <rect x="30" y="195" width="280" height="25" fill="#4F6D44" />
        <path d="M40 200 Q170 190 300 200 V220 H40 Z" fill="#3E5735" />
      </g>

      {/* Delicate botanical branches curling along top-right and left */}
      <path d="M225 15C240 25 255 45 265 70" stroke="#485B43" strokeWidth="1.8" strokeLinecap="round" />
      <ellipse cx="235" cy="22" rx="6" ry="3" transform="rotate(-30 235 22)" fill="#7A986B" />
      <ellipse cx="248" cy="36" rx="7" ry="3.5" transform="rotate(-20 248 36)" fill="#8EA87D" />
      <ellipse cx="260" cy="54" rx="7" ry="4" transform="rotate(10 260 54)" fill="#6D8B60" />

      {/* Decorative stars / glints */}
      <g transform="translate(295, 25)">
        <line x1="0" y1="-6" x2="0" y2="6" stroke="#9A856D" strokeWidth="1.5" />
        <line x1="-6" y1="0" x2="6" y2="0" stroke="#9A856D" strokeWidth="1.5" />
      </g>
      <g transform="translate(48, 50)">
        <line x1="0" y1="-4" x2="0" y2="4" stroke="#9A856D" strokeWidth="1.2" />
        <line x1="-4" y1="0" x2="4" y2="0" stroke="#9A856D" strokeWidth="1.2" />
      </g>
    </svg>
  </div>
);

// Botanical Card Pattern Background
export const BotanicalWatermarkPattern: React.FC = () => (
  <svg className="absolute right-0 bottom-0 pointer-events-none opacity-20 w-48 h-48" viewBox="0 0 200 200" fill="none">
    <path d="M50 200C90 150 140 100 190 30" stroke="#263329" strokeWidth="2" strokeDasharray="4 4" />
    <circle cx="150" cy="80" r="16" fill="#D9E2C6" />
    <circle cx="120" cy="120" r="12" fill="#E9D3B5" />
    <circle cx="90" cy="160" r="8" fill="#DDD1EA" />
  </svg>
);

