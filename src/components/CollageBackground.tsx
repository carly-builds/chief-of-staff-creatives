"use client";

const blobs = [
  {
    color: "var(--pink)",
    w: 320, h: 240,
    top: -50, right: -80,
    opacity: 0.6,
    animation: "lava1 45s ease-in-out infinite",
  },
  {
    color: "var(--blue-light)",
    w: 340, h: 200,
    top: 100, left: -100,
    opacity: 0.55,
    animation: "lava2 55s ease-in-out infinite",
  },
  {
    color: "var(--pink-light)",
    w: 260, h: 180,
    top: 280, left: -60,
    opacity: 0.5,
    animation: "lava3 50s ease-in-out infinite",
  },
  {
    color: "var(--blue)",
    w: 280, h: 220,
    top: 400, right: -90,
    opacity: 0.5,
    animation: "lava4 60s ease-in-out infinite",
  },
  {
    color: "var(--blue-pale)",
    w: 350, h: 180,
    bottom: 200, left: -120,
    opacity: 0.45,
    animation: "lava5 48s ease-in-out infinite",
  },
  {
    color: "var(--pink)",
    w: 220, h: 170,
    bottom: 100, right: -40,
    opacity: 0.45,
    animation: "lava6 52s ease-in-out infinite",
  },
  {
    color: "var(--blue-light)",
    w: 200, h: 150,
    top: 650, left: 50,
    opacity: 0.4,
    animation: "lava7 58s ease-in-out infinite",
  },
];

export default function CollageBackground() {
  return (
    <>
      {/* Lava lamp keyframes */}
      <style jsx global>{`
        @keyframes lava1 {
          0%, 100% {
            transform: translate(0, 0) scale(1);
            border-radius: 40% 60% 55% 45% / 50% 40% 60% 50%;
          }
          25% {
            transform: translate(15px, 20px) scale(1.04);
            border-radius: 55% 45% 40% 60% / 45% 55% 45% 55%;
          }
          50% {
            transform: translate(-10px, 35px) scale(0.97);
            border-radius: 48% 52% 60% 40% / 55% 45% 50% 50%;
          }
          75% {
            transform: translate(20px, 10px) scale(1.02);
            border-radius: 42% 58% 45% 55% / 48% 52% 55% 45%;
          }
        }
        @keyframes lava2 {
          0%, 100% {
            transform: translate(0, 0) scale(1);
            border-radius: 55% 45% 50% 50% / 40% 60% 40% 60%;
          }
          20% {
            transform: translate(20px, -15px) scale(1.03);
            border-radius: 45% 55% 55% 45% / 50% 50% 45% 55%;
          }
          45% {
            transform: translate(30px, 25px) scale(0.96);
            border-radius: 52% 48% 42% 58% / 55% 45% 55% 45%;
          }
          70% {
            transform: translate(-15px, 15px) scale(1.05);
            border-radius: 48% 52% 58% 42% / 42% 58% 48% 52%;
          }
        }
        @keyframes lava3 {
          0%, 100% {
            transform: translate(0, 0) scale(1);
            border-radius: 50% 50% 45% 55% / 55% 45% 55% 45%;
          }
          30% {
            transform: translate(-20px, 30px) scale(1.06);
            border-radius: 58% 42% 52% 48% / 45% 55% 42% 58%;
          }
          60% {
            transform: translate(15px, -10px) scale(0.95);
            border-radius: 42% 58% 48% 52% / 52% 48% 58% 42%;
          }
        }
        @keyframes lava4 {
          0%, 100% {
            transform: translate(0, 0) scale(1);
            border-radius: 45% 55% 50% 50% / 50% 50% 50% 50%;
          }
          35% {
            transform: translate(-25px, -20px) scale(1.03);
            border-radius: 55% 45% 42% 58% / 58% 42% 55% 45%;
          }
          65% {
            transform: translate(10px, 30px) scale(0.98);
            border-radius: 48% 52% 55% 45% / 42% 58% 45% 55%;
          }
        }
        @keyframes lava5 {
          0%, 100% {
            transform: translate(0, 0) scale(1);
            border-radius: 55% 45% 45% 55% / 45% 55% 55% 45%;
          }
          25% {
            transform: translate(25px, -15px) scale(1.04);
            border-radius: 42% 58% 55% 45% / 55% 45% 42% 58%;
          }
          55% {
            transform: translate(-10px, 20px) scale(0.97);
            border-radius: 58% 42% 48% 52% / 48% 52% 58% 42%;
          }
          80% {
            transform: translate(15px, 10px) scale(1.02);
            border-radius: 50% 50% 42% 58% / 52% 48% 50% 50%;
          }
        }
        @keyframes lava6 {
          0%, 100% {
            transform: translate(0, 0) scale(1);
            border-radius: 45% 55% 50% 50% / 60% 40% 60% 40%;
          }
          40% {
            transform: translate(-20px, -25px) scale(1.05);
            border-radius: 55% 45% 58% 42% / 45% 55% 48% 52%;
          }
          70% {
            transform: translate(15px, 15px) scale(0.96);
            border-radius: 48% 52% 42% 58% / 52% 48% 55% 45%;
          }
        }
        @keyframes lava7 {
          0%, 100% {
            transform: translate(0, 0) scale(1);
            border-radius: 48% 52% 58% 42% / 52% 48% 52% 48%;
          }
          30% {
            transform: translate(20px, 20px) scale(1.03);
            border-radius: 55% 45% 45% 55% / 45% 55% 48% 52%;
          }
          65% {
            transform: translate(-15px, -10px) scale(0.98);
            border-radius: 42% 58% 52% 48% / 58% 42% 55% 45%;
          }
        }
      `}</style>

      {/* Layer 1: Marble texture */}
      <div className="fixed inset-0 pointer-events-none z-0" style={{ maxWidth: 430, left: "50%", transform: "translateX(-50%)" }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
          <defs>
            <filter id="marble-base">
              <feTurbulence type="fractalNoise" baseFrequency="0.009 0.006" numOctaves="6" seed="2" />
              <feColorMatrix type="saturate" values="0" />
              <feComponentTransfer>
                <feFuncR type="linear" slope="0.3" intercept="0.55" />
                <feFuncG type="linear" slope="0.3" intercept="0.54" />
                <feFuncB type="linear" slope="0.3" intercept="0.52" />
                <feFuncA type="linear" slope="1" intercept="0" />
              </feComponentTransfer>
            </filter>
            <filter id="marble-veins">
              <feTurbulence type="turbulence" baseFrequency="0.004 0.002" numOctaves="3" seed="5" />
              <feColorMatrix type="saturate" values="0" />
              <feComponentTransfer>
                <feFuncR type="discrete" tableValues="0.78 0.82 0.72 0.85 0.75 0.88 0.70 0.80" />
                <feFuncG type="discrete" tableValues="0.76 0.80 0.70 0.83 0.73 0.86 0.68 0.78" />
                <feFuncB type="discrete" tableValues="0.74 0.78 0.68 0.81 0.71 0.84 0.66 0.76" />
                <feFuncA type="linear" slope="0.35" intercept="0" />
              </feComponentTransfer>
            </filter>
          </defs>
          <rect width="100%" height="100%" filter="url(#marble-base)" />
          <rect width="100%" height="100%" filter="url(#marble-veins)" />
        </svg>
      </div>

      {/* Layer 2: Organic blob shapes (lava lamp) */}
      <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden" style={{ maxWidth: 430, left: "50%", transform: "translateX(-50%)" }}>
        {blobs.map((blob, i) => (
          <div
            key={i}
            className="absolute will-change-transform"
            style={{
              width: blob.w,
              height: blob.h,
              background: blob.color,
              opacity: blob.opacity,
              top: blob.top,
              right: (blob as Record<string, unknown>).right as number | undefined,
              bottom: (blob as Record<string, unknown>).bottom as number | undefined,
              left: (blob as Record<string, unknown>).left as number | undefined,
              animation: blob.animation,
            }}
          />
        ))}
      </div>
    </>
  );
}
