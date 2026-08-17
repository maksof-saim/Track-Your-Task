export function StarMotif({ className = "" }: { className?: string }) {
  // A simple rub-el-hizb-style 8-pointed star, built from two overlapping squares.
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect
        x="20"
        y="20"
        width="60"
        height="60"
        stroke="currentColor"
        strokeWidth="2"
      />
      <rect
        x="20"
        y="20"
        width="60"
        height="60"
        stroke="currentColor"
        strokeWidth="2"
        transform="rotate(45 50 50)"
      />
    </svg>
  );
}
