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

  // Per-aim breakdown
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

  const unlinkedDone = done.filter((t) => !t.aim);
  const neglectedAims = aimBreakdown.filter((a) => a.neglected);

  // Encouragement based on completion rate
  const getMessage = () => {
    if (completionRate >= 80) return "You showed up this week.";
    if (completionRate >= 50) return "Solid progress. Not everything, but enough.";
    if (completionRate >= 25) return "A slower week. That's okay.";
    return "Some weeks are about surviving, not thriving.";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-ink/20" onClick={onClose} />

      {/* Review panel */}
      <div
        className="relative w-full max-w-[430px] max-h-[85vh] overflow-y-auto rounded-t-3xl animate-fade-up scroll-hide"
        style={{ background: "var(--surface-bg)" }}
      >
        {/* Handle */}
        <div className="sticky top-0 pt-3 pb-2 flex justify-center" style={{ background: "var(--surface-bg)" }}>
          <div className="w-10 h-1 rounded-full bg-ink/10" />
        </div>

        <div className="px-6 pb-10">
          {/* Header */}
          <div className="mb-8">
            <p className="font-mono-upper text-[0.48rem] text-pink mb-3 tracking-widest">Weekly review</p>
            <h2 className="font-display text-2xl text-ink leading-snug mb-2">{getMessage()}</h2>
            {weekIntention && (
              <p className="text-[0.82rem] text-ink/35 leading-relaxed">
                Your intention was: &ldquo;{weekIntention}&rdquo;
              </p>
            )}
          </div>

          {/* Score */}
          <div className="glass rounded-2xl p-5 mb-4 text-center">
            <div className="font-display text-4xl text-ink mb-1">{completedCount}/{totalTasks}</div>
            <div className="font-mono-upper text-[0.48rem] text-ink/30 tracking-widest">tasks completed</div>
            {/* Progress bar */}
            <div className="w-full h-2 rounded-full bg-ink/[0.04] mt-4 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{ width: `${completionRate}%`, background: "var(--pink)" }}
              />
            </div>
          </div>

          {/* Aim breakdown */}
          <div className="glass rounded-2xl p-5 mb-4">
            <div className="font-mono-upper text-[0.48rem] text-ink/30 mb-4 tracking-widest">By aim</div>
            <div className="space-y-4">
              {aimBreakdown.map((aim) => (
                <div key={aim.name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[0.85rem] text-ink leading-snug">{aim.name}</span>
                    <span className="font-mono text-[0.52rem] text-ink/30 tracking-wide">
                      {aim.done}/{aim.total}
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-ink/[0.04] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700 ease-out"
                      style={{
                        width: `${aim.pct}%`,
                        background: aim.neglected ? "var(--pink)" : "var(--blue)",
                        opacity: aim.neglected ? 0.5 : 0.7,
                      }}
                    />
                  </div>
                  {aim.neglected && (
                    <p className="font-mono text-[0.45rem] text-pink/60 tracking-wide mt-1">
                      Didn&apos;t get attention this week
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* What got done */}
          {done.length > 0 && (
            <div className="glass rounded-2xl p-5 mb-4">
              <div className="font-mono-upper text-[0.48rem] text-ink/30 mb-3 tracking-widest">What you did</div>
              <div className="space-y-1.5">
                {done.map((task, i) => (
                  <div key={i} className="flex items-start gap-2.5 py-1">
                    <div className="w-[16px] h-[16px] rounded-md bg-pink/15 mt-0.5 shrink-0 flex items-center justify-center">
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-pink">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[0.78rem] text-ink/60 leading-snug">{task.title}</span>
                      {task.aim && (
                        <span className="font-mono text-[0.4rem] text-ink/20 tracking-wide ml-2">{task.aim}</span>
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
              <div className="font-mono-upper text-[0.48rem] text-ink/30 mb-3 tracking-widest">
                Carry forward?
              </div>
              <p className="text-[0.78rem] text-ink/35 mb-3 leading-relaxed">
                These didn&apos;t happen. That&apos;s information, not failure.
              </p>
              <div className="space-y-1.5">
                {dropped.map((task, i) => (
                  <div key={i} className="flex items-start gap-2.5 py-1">
                    <div className={`w-[5px] h-[5px] rounded-full mt-2 shrink-0 ${typeDot[task.type] || "bg-ink/15"}`} />
                    <span className="text-[0.78rem] text-ink/40 leading-snug">{task.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Neglected aims callout */}
          {neglectedAims.length > 0 && (
            <div className="glass rounded-2xl p-5 mb-4 border-l-[3px] border-l-pink">
              <div className="font-mono-upper text-[0.48rem] text-pink/50 mb-2 tracking-widest">Heads up</div>
              <p className="text-[0.85rem] text-ink/60 leading-relaxed">
                {neglectedAims.map((a) => a.name).join(" and ")}{" "}
                {neglectedAims.length === 1 ? "didn't" : "didn't"} get any love this week.
                Want to make {neglectedAims.length === 1 ? "it" : "them"} a priority next week?
              </p>
            </div>
          )}

          {/* Next week intention */}
          <div className="glass rounded-2xl p-5 mb-4">
            <div className="font-mono-upper text-[0.48rem] text-ink/30 mb-3 tracking-widest">
              Next week
            </div>
            <p className="text-[0.82rem] text-ink/40 mb-4 leading-relaxed">
              Set an intention for next week. One sentence. What matters most?
            </p>
            <div className="flex items-center gap-2">
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
                className="flex-1 py-3 px-4 border-[1.5px] border-ink/[0.06] rounded-xl text-[0.88rem] text-ink font-display italic bg-white/50 outline-none focus:border-pink transition-colors"
              />
            </div>
            <button
              onClick={() => {
                if (nextIntention.trim()) onSetNextIntention(nextIntention.trim());
                onClose();
              }}
              className="font-mono-upper text-[0.6rem] bg-ink text-white px-9 py-3.5 rounded-xl mt-4 transition-opacity hover:opacity-85 w-full"
              style={{ color: "var(--surface-bg)" }}
            >
              {nextIntention.trim() ? "set intention & close" : "close review"}
            </button>
          </div>

          {/* Unlinked wins */}
          {unlinkedDone.length > 0 && (
            <p className="text-[0.7rem] text-ink/20 text-center italic">
              Plus {unlinkedDone.length} other {unlinkedDone.length === 1 ? "thing" : "things"} that didn&apos;t tie to an aim but still got done.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
