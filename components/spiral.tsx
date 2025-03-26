export function Spiral() {
  return (
    <svg
    width="120"
    height="120"
    viewBox="0 -30 120 120"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
      {/* Outer Spiral */}
      <path
        d="M60 10C60 10 60 30 80 30C100 30 100 50 100 50C100 50 100 70 80 70C60 70 60 90 60 90C60 90 60 110 40 110C20 110 20 90 20 90C20 90 20 70 40 70C60 70 60 50 60 50C60 50 60 30 40 30C20 30 20 10 20 10"
        stroke="white"
        strokeWidth="5"
        strokeLinecap="round"
      />
      {/* Central square to represent a project */}
    </svg>
  )
}

