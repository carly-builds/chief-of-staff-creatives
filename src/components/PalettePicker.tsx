"use client";

import { Palette, palettes } from "@/lib/palettes";

export default function PalettePicker({
  selected,
  onSelect,
}: {
  selected: Palette;
  onSelect: (p: Palette) => void;
}) {
  return (
    <div className="space-y-5">
      {palettes.map((p, idx) => {
        const isSelected = p.id === selected.id;
        return (
          <button
            key={p.id}
            onClick={() => onSelect(p)}
            className="w-full text-left group"
            style={{ animationDelay: `${idx * 120}ms` }}
          >
            <div
              className={`relative overflow-hidden rounded-2xl transition-all duration-500 ${
                isSelected
                  ? "shadow-lg scale-[1.01]"
                  : "opacity-60 hover:opacity-90 hover:scale-[1.005]"
              }`}
            >
              {/* Color field: layered organic gradient */}
              <div className="relative h-32 overflow-hidden">
                {/* Base layer */}
                <div
                  className="absolute inset-0"
                  style={{ background: p.bars[2] }}
                />
                {/* Middle sweep */}
                <div
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(135deg, ${p.bars[0]} 0%, ${p.bars[0]}00 55%)`,
                  }}
                />
                {/* Accent diagonal */}
                <div
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(225deg, ${p.bars[1]} 0%, ${p.bars[1]}00 50%)`,
                  }}
                />
                {/* Soft middle blend */}
                <div
                  className="absolute inset-0"
                  style={{
                    background: `radial-gradient(ellipse at 60% 50%, ${p.bars[0]}88 0%, transparent 65%)`,
                  }}
                />
                {/* Subtle grain texture */}
                <div
                  className="absolute inset-0 opacity-[0.04] mix-blend-multiply"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                  }}
                />

                {/* Index number */}
                <div className="absolute top-4 left-5">
                  <span
                    className="font-mono text-[0.5rem] tracking-[0.2em] uppercase"
                    style={{ color: p.vars.ink, opacity: 0.3 }}
                  >
                    0{idx + 1}
                  </span>
                </div>

                {/* Three discrete swatches floating at bottom */}
                <div className="absolute bottom-4 right-5 flex gap-2">
                  {p.bars.map((color, ci) => (
                    <div
                      key={ci}
                      className="w-4 h-4 rounded-full shadow-sm"
                      style={{
                        background: color,
                        border: `1px solid ${color === "#1a1419" || color === "#ffffff" ? "rgba(128,128,128,0.2)" : "rgba(255,255,255,0.3)"}`,
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Name strip */}
              <div
                className="px-5 py-3.5 flex items-center justify-between"
                style={{ background: p.vars.marble }}
              >
                <span
                  className="font-display italic text-[1rem]"
                  style={{ color: p.vars.ink }}
                >
                  {p.name}
                </span>
                {/* Selection indicator */}
                <div
                  className={`w-3 h-3 rounded-full border-[1.5px] transition-all duration-300 ${
                    isSelected ? "scale-100" : "scale-0"
                  }`}
                  style={{
                    borderColor: p.vars.ink,
                    background: isSelected ? p.vars.ink : "transparent",
                  }}
                />
              </div>

              {/* Selected border */}
              {isSelected && (
                <div
                  className="absolute inset-0 rounded-2xl pointer-events-none"
                  style={{
                    border: `1.5px solid ${p.vars.ink}`,
                    opacity: 0.15,
                  }}
                />
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
