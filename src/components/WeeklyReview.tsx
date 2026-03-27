"use client";

import { useState } from "react";
import { ParsedTask } from "./Onboarding";

const typeDot: Record<string, string> = {
  focus: "bg-blue",
  flow: "bg-pink",
  admin: "bg-ink/20",
};

export default function WeeklyReview({
  tasks,
  completedTasks,
  aims,
  weekIntention,
  onClose,
  onSetNextIntention,
}: {
  tasks: ParsedTask[];
  completedTasks: Set<string>;
  aims: string[];
  weekIntention: string;
  onClose: () => void;
  onSetNextIntention: (val: string) => void;
}) {
  const [nextIntention, setNextIntention] = useState("");

  const done = tasks.filter((t) => completedTasks.has(t.title));
  const dropped = tasks.filter((t) => !completedTasks.has(t.title));
  const totalTasks = tasks.length;
  const completedCount = done.length;
  const completionRate = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  const aimBreakdown = aims.map((aim) => {
    const aimTasks = tasks.filter((t) => t.aim === aim);
    const aimDone = aimTasks.filter((t) => completedTasks.has(t.title));
    return {
      name: aim,
      total: aimTasks.length,
      done: aimDone.length,
      pct: aimTasks.length > 0 ? Math.round((aimDone.length / aimTasks.length) * 100) : 0,
      gotLove: aimDone.length > 0,
      neglected: aimTasks.length > 0 && aimDone.length === 0,
    };
  });

  const neglectedAims = aimBreakdown.filter((a) => a.neglected);

  const getMessage = () => {
    if (completionRate >= 80) return "You showed up this week.";
    if (completionRate >= 50) return "Solid progress. Not everything, but enough.";
    if (completionRate >= 25) return "A slower week. That's okay.";
    return "Some weeks are for planting, not harvesting.";
  };

  return (
    <div className="fixed inset-0 z-50">
      {/* Full screen backdrop */}
      <div className="absolute inset-0 bg-ink/30" onClick={onClose} />

      {/* Full screen panel */}
      <div
        className="absolute inset-0 overflow-y-auto animate-fade-up scroll-hide"
        style={{ background: "var(--surface-bg)" }}
      >
        {/* Close button */}
        <div className="sticky top-0 z-10 flex justify-end p-4" style={{ background: "var(--surface-bg)" }}>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-ink/[0.05] flex items-center justify-center text-ink/30 hover:text-ink/50 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="px-6 pb-12 max-w-[430px] mx-auto">
          {/* Header */}
          <div className="mb-10">
            <p className="font-mono-upper text-[0.48rem] text-pink mb-4 tracking-widest">Weekly review</p>
            <h2 className="font-display text-[1.6rem] text-ink leading-snug mb-3">{getMessage()}</h2>
            {weekIntention && (
              <p className="text-[0.82rem] text-ink/30 leading-relaxed">
                Your intention: &ldquo;{weekIntention}&rdquo;
              </p>
            )}
          </div>

          {/* Score - lighter treatment */}
          <div className="mb-10 text-center">
            <div className="inline-flex items-baseline gap-1">
              <span className="font-display text-[2.5rem] text-ink">{completedCount}</span>
              <span className="font-display text-[1.2rem] text-ink/20">/ {totalTasks}</span>
            </div>
            <div className="font-mono-upper text-[0.45rem] text-ink/25 tracking-widest mt-1">tasks completed</div>
          </div>

          {/* Aim breakdown */}
          <div className="glass rounded-2xl p-5 mb-4">
            <div className="font-mono-upper text-[0.45rem] text-ink/25 mb-5 tracking-widest">By aim</div>
            <div className="space-y-5">
              {aimBreakdown.map((aim, i) => {
                const barColors = ["var(--blue)", "var(--pink)", "var(--blue-light)"];
                const barColor = aim.neglected ? "var(--pink)" : barColors[i % barColors.length];
                return (
                  <div key={aim.name}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[0.85rem] text-ink/70 leading-snug">{aim.name}</span>
                      <span className="font-mono text-[0.5rem] text-ink/25 tracking-wide">
                        {aim.done}/{aim.total}
                      </span>
                    </div>
                    <div className="w-full h-[3px] rounded-full bg-ink/[0.04] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700 ease-out"
                        style={{ width: `${Math.max(aim.pct, 2)}%`, background: barColor, opacity: aim.neglected ? 0.4 : 0.6 }}
                      />
                    </div>
                    {aim.neglected && (
                      <p className="font-mono text-[0.42rem] text-pink/50 tracking-wide mt-1.5">
                        Didn&apos;t get attention this week
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* What got done */}
          {done.length > 0 && (
            <div className="glass rounded-2xl p-5 mb-4">
              <div className="font-mono-upper text-[0.45rem] text-ink/25 mb-4 tracking-widest">What you did</div>
              <div className="space-y-2.5">
                {done.map((task, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-pink/40 mt-0.5 shrink-0">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <div className="flex-1">
                      <span className="text-[0.78rem] text-ink/50 leading-snug">{task.title}</span>
                      {task.aim && (
                        <span className="font-mono text-[0.4rem] text-ink/15 tracking-wide ml-2">{task.aim}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* What got dropped */}
          {dropped.length > 0 && (
            <div className="glass rounded-2xl p-5 mb-4">
              <div className="font-mono-upper text-[0.45rem] text-ink/25 mb-2 tracking-widest">Carry forward?</div>
              <p className="text-[0.75rem] text-ink/25 mb-4 leading-relaxed">
                These didn&apos;t happen. That&apos;s information, not failure.
              </p>
              <div className="space-y-2">
                {dropped.map((task, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <div className={`w-[4px] h-[4px] rounded-full mt-[7px] shrink-0 ${typeDot[task.type] || "bg-ink/10"}`} />
                    <span className="text-[0.75rem] text-ink/30 leading-snug">{task.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Neglected aims */}
          {neglectedAims.length > 0 && (
            <div className="glass rounded-2xl p-5 mb-4 border-l-[2px] border-l-pink/30">
              <p className="text-[0.82rem] text-ink/50 leading-relaxed">
                <span className="text-ink/70">{neglectedAims.map((a) => a.name).join(" and ")}</span>{" "}
                {neglectedAims.length === 1 ? "didn't" : "didn't"} get any love this week.
              </p>
            </div>
          )}

          {/* Next week intention */}
          <div className="mt-8 mb-4">
            <div className="font-mono-upper text-[0.45rem] text-ink/25 mb-3 tracking-widest">Next week</div>
            <p className="text-[0.82rem] text-ink/35 mb-4 leading-relaxed">
              One sentence. What matters most?
            </p>
            <input
              type="text"
              value={nextIntention}
              onChange={(e) => setNextIntention(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && nextIntention.trim()) {
                  onSetNextIntention(nextIntention.trim());
                  onClose();
                }
              }}
              placeholder="This is the week I..."
              className="w-full py-3 px-4 border-b-[1.5px] border-b-ink/[0.06] text-[0.92rem] text-ink font-display italic bg-transparent outline-none focus:border-b-pink transition-colors"
            />
          </div>

          <button
            onClick={() => {
              if (nextIntention.trim()) onSetNextIntention(nextIntention.trim());
              onClose();
            }}
            className="font-mono-upper text-[0.55rem] bg-ink px-9 py-3.5 rounded-xl transition-opacity hover:opacity-85 w-full mt-6"
            style={{ color: "var(--surface-bg)" }}
          >
            {nextIntention.trim() ? "set intention & close" : "close review"}
          </button>
        </div>
      </div>
    </div>
  );
}
