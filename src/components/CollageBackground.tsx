"use client";

export default function CollageBackground() {
  return (
    <>
      {/* Layer 1: Paper texture */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          maxWidth: 430,
          left: "50%",
          transform: "translateX(-50%)",
          background: "var(--surface-bg)",
          transition: "background 0.4s ease",
        }}
      >
        {/* Fine grain — like quality paper stock */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="100%"
          height="100%"
          className="absolute inset-0 opacity-[0.045]"
          style={{ mixBlendMode: "multiply" }}
        >
          <filter id="paper-grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="4" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#paper-grain)" />
        </svg>

        {/* Coarser fiber texture — like cotton rag paper */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="100%"
          height="100%"
          className="absolute inset-0 opacity-[0.025]"
          style={{ mixBlendMode: "multiply" }}
        >
          <filter id="paper-fiber">
            <feTurbulence type="fractalNoise" baseFrequency="0.15 0.4" numOctaves="2" seed="7" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#paper-fiber)" />
        </svg>
      </div>

      {/* Layer 2: Structural lines — notebook / margin feel */}
      <div
        className="fixed inset-0 pointer-events-none z-[1]"
        style={{ maxWidth: 430, left: "50%", transform: "translateX(-50%)" }}
      >
        {/* Left margin line */}
        <div
          className="absolute top-0 h-full w-px"
          style={{
            left: 52,
            background: `linear-gradient(180deg, transparent 5%, var(--pink) 20%, var(--pink) 80%, transparent 95%)`,
            opacity: 0.08,
          }}
        />

        {/* Subtle color wash at top edge — like a watercolor bleed on the paper */}
        <div
          className="absolute top-0 left-0 right-0"
          style={{
            height: 180,
            background: `linear-gradient(180deg, var(--pink) 0%, transparent 100%)`,
            opacity: 0.04,
          }}
        />

        {/* Faint color wash at bottom — balances the top */}
        <div
          className="absolute bottom-0 left-0 right-0"
          style={{
            height: 200,
            background: `linear-gradient(0deg, var(--blue) 0%, transparent 100%)`,
            opacity: 0.03,
          }}
        />

        {/* Thin horizontal color stripe — like a ribbon bookmark */}
        <div
          className="absolute left-0 right-0"
          style={{
            top: "38%",
            height: 2,
            background: `linear-gradient(90deg, transparent 5%, var(--pink) 25%, var(--blue) 75%, transparent 95%)`,
            opacity: 0.07,
          }}
        />
      </div>
    </>
  );
}
