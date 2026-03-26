export type Palette = {
  id: string;
  name: string;
  // The 3 color bars shown in the picker (mymind style)
  bars: [string, string, string];
  // CSS variable overrides
  vars: {
    pink: string;
    "pink-light": string;
    blue: string;
    "blue-light": string;
    "blue-pale": string;
    marble: string;
    ink: string;
  };
  // Confetti colors
  confetti: string[];
};

export const palettes: Palette[] = [
  {
    id: "melted-shake",
    name: "Melted Shake",
    bars: ["#d4a9a0", "#1a1419", "#c44f8a"],
    vars: {
      pink: "#c44f8a",
      "pink-light": "#d98aaf",
      blue: "#d4a9a0",
      "blue-light": "#e2c4bd",
      "blue-pale": "#edd8d3",
      marble: "#ebe6e2",
      ink: "#1a1419",
    },
    confetti: ["#c44f8a", "#d4a9a0", "#d98aaf", "#e2c4bd"],
  },
  {
    id: "dear-reader",
    name: "Dear Reader",
    bars: ["#e2ddd6", "#c4905c", "#a8c4d4"],
    vars: {
      pink: "#c4905c",
      "pink-light": "#d9b48e",
      blue: "#a8c4d4",
      "blue-light": "#c2d8e2",
      "blue-pale": "#dae8ef",
      marble: "#e8e4de",
      ink: "#2c2825",
    },
    confetti: ["#c4905c", "#a8c4d4", "#d9b48e", "#c2d8e2"],
  },
  {
    id: "golden-hour",
    name: "Golden Hour",
    bars: ["#f5e6c8", "#c4552a", "#8b9e74"],
    vars: {
      pink: "#c4552a",
      "pink-light": "#d48a6e",
      blue: "#8b9e74",
      "blue-light": "#b0bf9e",
      "blue-pale": "#cdd8c2",
      marble: "#ece8e2",
      ink: "#3a2e28",
    },
    confetti: ["#c4552a", "#8b9e74", "#dba24e", "#d48a6e"],
  },
];

export const defaultPalette = palettes[0]; // Melted Shake
