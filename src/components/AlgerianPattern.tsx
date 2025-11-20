import React, { useId } from 'react';

export function AlgerianPattern({ className = '' }: { className?: string }) {
  // Generate unique ID for each instance to avoid conflicts
  const id = useId();
  const patternId = `algerianPattern-${id}`;
  
  return (
    <svg
      className={className}
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      style={{ opacity: 0.1 }}
    >
      {/* Geometric Islamic pattern inspired by Algerian architecture */}
      <defs>
        <pattern id={patternId} x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
          {/* Star pattern */}
          <path
            d="M 25 5 L 27 18 L 40 18 L 30 26 L 34 39 L 25 31 L 16 39 L 20 26 L 10 18 L 23 18 Z"
            fill="currentColor"
            opacity="0.3"
          />
          {/* Interlocking squares */}
          <rect x="0" y="0" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.2" />
          <rect x="35" y="0" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.2" />
          <rect x="0" y="35" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.2" />
          <rect x="35" y="35" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.2" />
          {/* Center ornament */}
          <circle cx="25" cy="25" r="3" fill="currentColor" opacity="0.25" />
        </pattern>
      </defs>
      <rect width="200" height="200" fill={`url(#${patternId})`} />
    </svg>
  );
}

export function AlgerianBorder({ className = '' }: { className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-0 border-2 border-emerald-600/20 rounded-lg" 
           style={{
             backgroundImage: `
               linear-gradient(45deg, transparent 48%, #10b981 48%, #10b981 52%, transparent 52%),
               linear-gradient(-45deg, transparent 48%, #10b981 48%, #10b981 52%, transparent 52%)
             `,
             backgroundSize: '8px 8px',
             backgroundPosition: '0 0, 4px 4px',
             opacity: 0.1
           }}
      />
    </div>
  );
}
