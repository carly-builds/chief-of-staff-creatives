"use client";

import { useState } from "react";
import { ParsedTask } from "./Onboarding";

const typeDot: Record<string, string> = {
  focus: "bg-blue",
  flow: "bg-pink",
  admin: "bg-ink/20",
};

function AimRing({ pct, color, size = 64 }: { pct: number; color: string; size?: number }) {
  const r = (size - 10) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" className="text-ink/[0.05]" strokeWidth={4} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={4} strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} className="transition-all duration-700 ease-out" />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center font-mono text-[0.7rem] text-ink tracking-tight">
        {Math.round(pct)}%
      </span>
    </div>
  );
}

const dayLabel = (dateStr: string) =>
  new Date(dateStr + "T12:00:00").toLocaleDateString("en-US", { weekday: "short" });

export default function AimsScreen({
  aims,
  milestones,
  tasks,
  completedAims,
  onUpdateAim,
  onUpdateMilestone,
  onAddAim,
  onCompleteAim,
}: {
  aims: string[];
  milestones: Record<string, string>;
  tasks: ParsedTask[];
  completedAims: Set<string>;
  onUpdateAim: (index: number, newName: string) => void;
  onUpdateMilestone: (aim: string, milestone: string) => void;
  onAddAim: (name: string) => void;
  onCompleteAim: (aim: string) => void;
}) {
  const [editingAim, setEditingAim] = useState<number | null>(null);
  const [editingMilestone, setEditingMilestone] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const [showAddAim, setShowAddAim] = useState(false);
  const [newAimName, setNewAimName] = useState("");

  const aimColors = ["var(--blue)", "var(--pink)", "var(--blue-light)"];

  const activeAims = aims.filter((a) => !completedAims.has(a));
  const doneAims = aims.filter((a) => completedAims.has(a));

  return (
    <div className="animate-fade-up">
      <h2 className="font-display text-2xl text-ink mb-1">Aims</h2>
      <p className="font-mono-upper text-[0.5rem] text-ink/40 mb-6">
        What you&apos;re putting your energy toward
      </p>

      {/* Active aims */}
      <div className="space-y-4">
        {activeAims.map((aim, _i) => {
          const globalIndex = aims.indexOf(aim);
          const relatedTasks = tasks.filter(
            (t) => t.aim && t.aim.toLowerCase() === aim.toLowerCase()
          );
          const pct = relatedTasks.length > 0 ? Math.min(relatedTasks.length * 20, 100) : 0;
          const color = aimColors[globalIndex % aimColors.length];

          return (
            <div key={globalIndex} className="glass rounded-2xl p-5">
              <div className="flex items-center gap-4 mb-4">
                <AimRing pct={pct} color={color} />
                <div className="flex-1 min-w-0">
                  {/* Editable aim name */}
                  {editingAim === globalIndex ? (
                    <input
                      type="text"
                      value={editDraft}
                      onChange={(e) => setEditDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          onUpdateAim(globalIndex, editDraft);
                          setEditingAim(null);
                        }
                      }}
                      onBlur={() => {
                        onUpdateAim(globalIndex, editDraft);
                        setEditingAim(null);
                      }}
                      autoFocus
                      className="text-[1rem] text-ink leading-snug mb-1 w-full bg-transparent outline-none border-b border-pink/30 pb-0.5"
                    />
                  ) : (
                    <button
                      onClick={() => {
                        setEditDraft(aim);
                        setEditingAim(globalIndex);
                      }}
                      className="text-[1rem] text-ink leading-snug mb-1 text-left hover:text-ink/70 transition-colors"
                    >
                      {aim}
                    </button>
                  )}

                  {/* Editable milestone */}
                  {editingMilestone === globalIndex ? (
                    <input
                      type="text"
                      value={editDraft}
                      onChange={(e) => setEditDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          onUpdateMilestone(aim, editDraft);
                          setEditingMilestone(null);
                        }
                      }}
                      onBlur={() => {
                        onUpdateMilestone(aim, editDraft);
                        setEditingMilestone(null);
                      }}
                      autoFocus
                      placeholder="What does progress look like?"
                      className="text-[0.78rem] text-ink/35 leading-snug w-full bg-transparent outline-none border-b border-ink/10 pb-0.5"
                    />
                  ) : (
                    <button
                      onClick={() => {
                        setEditDraft(milestones[aim] || "");
                        setEditingMilestone(globalIndex);
                      }}
                      className="text-[0.78rem] text-ink/35 leading-snug text-left hover:text-ink/50 transition-colors"
                    >
                      {milestones[aim] || "+ add a milestone"}
                    </button>
                  )}
                </div>
              </div>

              {/* Related tasks */}
              {relatedTasks.length > 0 && (
                <div className="border-t border-ink/[0.05] pt-3 mb-3">
                  <div className="font-mono-upper text-[0.42rem] text-ink/25 mb-2">This week</div>
                  <div className="space-y-1.5">
                    {relatedTasks.map((task, ti) => (
                      <div key={ti} className="flex items-center gap-2.5 text-[0.82rem] text-ink">
                        <span className="font-mono text-[0.48rem] text-ink/30 tracking-wide min-w-[28px]">{dayLabel(task.day)}</span>
                        <div className={`w-[5px] h-[5px] rounded-full ${typeDot[task.type] || "bg-ink/15"}`} />
                        <span className="leading-snug">{task.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {relatedTasks.length === 0 && (
                <div className="border-t border-ink/[0.05] pt-3 mb-3">
                  <p className="font-display italic text-[0.78rem] text-ink/20">No tasks linked this week</p>
                </div>
              )}

              {/* Complete aim button */}
              <button
                onClick={() => onCompleteAim(aim)}
                className="font-mono-upper text-[0.48rem] text-ink/20 hover:text-pink transition-colors"
              >
                mark complete
              </button>
            </div>
          );
        })}
      </div>

      {/* Add new aim */}
      {showAddAim ? (
        <div className="glass rounded-2xl p-5 mt-4">
          <div className="font-mono-upper text-[0.48rem] text-ink/30 mb-3">New aim</div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newAimName}
              onChange={(e) => setNewAimName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && newAimName.trim()) {
                  onAddAim(newAimName.trim());
                  setNewAimName("");
                  setShowAddAim(false);
                }
              }}
              placeholder="What are you putting energy toward?"
              autoFocus
              className="flex-1 py-2.5 px-3 border-[1.5px] border-ink/[0.08] rounded-xl text-[0.88rem] text-ink bg-white/60 outline-none focus:border-pink transition-colors"
            />
            <button
              onClick={() => {
                if (newAimName.trim()) {
                  onAddAim(newAimName.trim());
                  setNewAimName("");
                  setShowAddAim(false);
                }
              }}
              disabled={!newAimName.trim()}
              className="w-9 h-9 rounded-lg bg-ink text-white flex items-center justify-center shrink-0 disabled:opacity-20"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
          </div>
          <button onClick={() => setShowAddAim(false)} className="font-mono-upper text-[0.48rem] text-ink/25 mt-2">
            cancel
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowAddAim(true)}
          className="glass rounded-2xl p-4 mt-4 w-full text-center font-mono-upper text-[0.5rem] text-ink/30 hover:text-ink/50 transition-colors"
        >
          + add an aim
        </button>
      )}

      {/* Completed aims */}
      {doneAims.length > 0 && (
        <div className="mt-8">
          <div className="font-mono-upper text-[0.48rem] text-ink/20 mb-3">Completed</div>
          <div className="space-y-2">
            {doneAims.map((aim, i) => (
              <div key={i} className="glass rounded-xl p-4 opacity-50">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-md bg-pink/20 flex items-center justify-center">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="text-pink">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <span className="text-[0.88rem] text-ink/40 line-through">{aim}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
