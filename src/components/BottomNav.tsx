"use client";

const tabs = [
  { id: "focus", label: "Focus" },
  { id: "today", label: "Today" },
  { id: "week", label: "Week" },
  { id: "aims", label: "Aims" },
] as const;

export type TabId = (typeof tabs)[number]["id"];

export default function BottomNav({
  activeTab,
  onTabChange,
}: {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}) {
  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-10 bg-white/80 backdrop-blur-xl border-t border-white/50 flex justify-around py-3 pb-7">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className="flex flex-col items-center gap-1"
        >
          <span
            className={`font-mono text-[0.46rem] uppercase tracking-widest transition-colors ${
              activeTab === tab.id ? "text-ink" : "text-ink/[0.18]"
            }`}
          >
            {tab.label}
          </span>
          {activeTab === tab.id && (
            <div className="w-1 h-1 rounded-full bg-pink" />
          )}
        </button>
      ))}
    </div>
  );
}
