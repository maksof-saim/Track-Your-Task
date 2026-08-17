export function GeometricPattern({ className = "" }: { className?: string }) {
  // A tessellating 8-point star + cross pattern, common in Islamic tilework,
  // rendered as a repeating SVG tile. Used at low opacity as texture, never as
  // the main focal element — the signature star motif stays that role.
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <pattern
          id="amaal-geo-tile"
          width="60"
          height="60"
          patternUnits="userSpaceOnUse"
        >
          <g stroke="currentColor" strokeWidth="1" fill="none">
            <path d="M30 4 L38 22 L56 30 L38 38 L30 56 L22 38 L4 30 L22 22 Z" />
            <circle cx="30" cy="30" r="3" />
            <circle cx="0" cy="0" r="3" />
            <circle cx="60" cy="0" r="3" />
            <circle cx="0" cy="60" r="3" />
            <circle cx="60" cy="60" r="3" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#amaal-geo-tile)" />
    </svg>
  );
}
