export function Spiral() {
  return (
    <>
      <style>{`
        /* The total length of the path is assumed to be 300 (adjust if needed) */
        @keyframes drawErase {
          0% {
            stroke-dashoffset: 300;
          }
          50% {
            stroke-dashoffset: 0;
          }
          100% {
            stroke-dashoffset: -300;
          }
        }
        .infinity-path {
          stroke: url(#gradStroke);
          stroke-width: 10;
          fill: none;
          stroke-linecap: round;
          stroke-linejoin: round;
          /* This dasharray value should equal the total path length */
          stroke-dasharray: 300;
          animation: drawErase 6s ease-in-out infinite;
        }
      `}</style>
      <svg
        width="300"
        height="150"
        viewBox="0 0 200 150"
        xmlns="http://www.w3.org/2000/svg"
        style={{ cursor: 'pointer' }}
      >
        <defs>
          {/* Gradient to simulate a calligraphic stroke that tapers */}
          <linearGradient id="gradStroke" gradientUnits="userSpaceOnUse" x1="40" y1="75" x2="160" y2="75">
            <stop offset="0%" stop-color="white" stop-opacity="1" />
            <stop offset="50%" stop-color="white" stop-opacity="0.5" />
            <stop offset="100%" stop-color="white" stop-opacity="0.1" />
          </linearGradient>
        </defs>
        {/*
          Figure-eight Infinity Symbol:
          This path starts at the center (100,75), draws the left loop using control points (40,0) and (40,150),
          returns to center, then draws the right loop using control points (160,0) and (160,150), crossing at the center.
        */}
        <path
          className="infinity-path"
          d="M 100,75 C 40,0, 40,150, 100,75 C 160,0, 160,150, 100,75"
        />
      </svg>
    </>
  );
}
