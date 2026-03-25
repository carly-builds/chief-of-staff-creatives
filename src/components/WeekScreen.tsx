"use client";

import { useState } from "react";
import { ParsedTask } from "./Onboarding";

const typeDot: Record<string, string> = {
  focus: "bg-blue",
  flow: "bg-pink",
  admin: "bg-ink/20",
};

function barColor(count: number) {
  if (count >= 4) return "bg-pink";
  if (count >= 2) return "bg-pink-light";
  return "bg-blue-light";
}

function barHeight(count: number) {
  if (count === 0) return "h-1.5";
  if (count === 1) return "h-3";
  if (count === 2) return "h-5";
  if (count === 3) return "h-7";
  if (count === 4) return "h-9";
  if (count === 5) return "h-11";
  return "h-12";
}

function badgeClass(count: number) {
  if (count >= 4) return "bg-pink/15 text-pink";
  if (count >= 2) return "bg-pink-light/30 text-ink/50";
  return "bg-blue-light/30 text-ink/40";
}

function badgeLabel(count: number) {
  if (count >= 4) return "packed";
  if (count >= 2) return "medium";
  return "open";
}

type DayData = {
  dayName: string;
  dateNum: number;
  dateStr: string;
  fullDate: string;
  isToday: boolean;
  isPast: boolean;
  tasks: ParsedTask[];
  itemCount: number;
};

export default function WeekScreen({
  tasks,
  aims,
  weekIntention,
  onSetIntention,
  onAddTask,
  onLinkTaskToAim,
}: {
  tasks: ParsedTask[];
  aims: string[];
  weekIntention: string;
  onSetIntention: (val: string) => void;
  onAddTask: (task: ParsedTask) => void;
  onLinkTaskToAim: (taskIndex: number, aim: string | null) => void;
}) {
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const dayOfWeek = today.getDay();
  const sunday = new Date(today);
  sunday.setDate(today.getDate() - dayOfWeek);

  const days: DayData[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(sunday);
    d.setDate(sunday.getDate() + i);
    const dateStr = d.toISOString().split("T")[0];
    const isToday = dateStr === todayStr;
    const isPast = d < today && !isToday;
    const dayTasks = tasks.filter((t) => t.day === dateStr);

    days.push({
      dayName: d.toLocaleDateString("en-US", { weekday: "long" }),
      dateNum: d.getDate(),
      dateStr,
      fullDate: d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }),
      isToday,
      isPast,
      tasks: dayTasks,
      itemCount: dayTasks.length,
    });
  }

  const todayIndex = days.findIndex((d) => d.isToday);
  const defaultDay = todayIndex >= 0 ? todayIndex : days.findIndex((d) => !d.isPast) || 0;
  const [selectedDay, setSelectedDay] = useState(defaultDay);
  const [editingIntention, setEditingIntention] = useState(false);
  const [intentionDraft, setIntentionDraft] = useState(weekIntention);
  const [taskInput, setTaskInput] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [linkingTask, setLinkingTask] = useState<number | null>(null);

  const selected = days[selectedDay];

  const start = new Date(sunday);
  const end = new Date(sunday);
  end.setDate(sunday.getDate() + 6);
  const headerDate = `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${end.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;

  const addTaskToDay = async () => {
    if (!taskInput.trim()) return;
    setIsAdding(true);
    try {
      const res = await fetch("/api/parse-tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawTasks: taskInput,
          aims,
          milestones: {},
        }),
      });
      const result = await res.json();
      if (result.tasks && result.tasks.length > 0) {
        result.tasks.forEach((t: ParsedTask) => {
          onAddTask({ ...t, day: selected.dateStr });
        });
      }
      setTaskInput("");
    } catch (err) {
      console.error("Failed to add task:", err);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="animate-fade-up">
      <div className="flex items-baseline justify-between mb-1">
        <h2 className="font-display text-2xl text-ink">This Week</h2>
        <span className="font-mono-upper text-[0.48rem] text-ink/35">{headerDate}</span>
      </div>

      {/* Weekly intention */}
      {editingIntention ? (
        <div className="flex items-center gap-2 mb-6 mt-2">
          <input
            type="text"
            value={intentionDraft}
            onChange={(e) => setIntentionDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                onSetIntention(intentionDraft);
                setEditingIntention(false);
              }
            }}
            placeholder="What's this week about?"
            autoFocus
            className="flex-1 py-2 px-3 glass rounded-lg font-display italic text-[0.88rem] text-ink/50 outline-none border-l-[3px] border-l-blue"
          />
          <button
            onClick={() => { onSetIntention(intentionDraft); setEditingIntention(false); }}
            className="font-mono text-[0.5rem] text-ink/30 hover:text-ink/50 px-2"
          >
            save
          </button>
        </div>
      ) : weekIntention ? (
        <button
          onClick={() => setEditingIntention(true)}
          className="glass rounded-lg px-4 py-2.5 mb-6 mt-2 w-full text-left border-l-[3px] border-l-blue hover:bg-white/60 transition-colors"
        >
          <span className="font-display italic text-[0.88rem] text-ink/45">
            &ldquo;{weekIntention}&rdquo;
          </span>
        </button>
      ) : (
        <button
          onClick={() => setEditingIntention(true)}
          className="font-mono-upper text-[0.48rem] text-ink/25 hover:text-ink/40 transition-colors mb-6 mt-2 block"
        >
          + set a weekly intention
        </button>
      )}

      {/* Bar chart */}
      <div className="flex gap-1.5 items-end h-20 mb-6">
        {days.map((day, i) => (
          <button
            key={day.dateStr}
            onClick={() => setSelectedDay(i)}
            className={`flex-1 flex flex-col items-center gap-1.5 transition-transform duration-200 ${
              day.isPast && i !== selectedDay ? "opacity-30" : ""
            } ${i === selectedDay ? "scale-[1.04]" : "active:scale-95"}`}
          >
            <div className="w-full flex flex-col justify-end items-center h-[52px]">
              <div
                className={`w-full rounded-t-lg rounded-b-sm ${barColor(day.itemCount)} ${barHeight(day.itemCount)} transition-all duration-300 ${
                  i === selectedDay ? "shadow-md" : ""
                }`}
              />
            </div>
            <span
              className={`font-mono text-[0.52rem] uppercase tracking-widest transition-all ${
                i === selectedDay ? "text-ink font-medium" : "text-ink/30"
              }`}
            >
              {day.dayName.slice(0, 1)}
            </span>
            {day.isToday && <div className="w-1 h-1 rounded-full bg-blue -mt-1" />}
          </button>
        ))}
      </div>

      {/* Selected day detail */}
      <div key={selected.dateStr} className="glass rounded-2xl p-5 mb-4 animate-fade-up">
        <div className="flex items-baseline justify-between mb-4">
          <h3 className="font-display text-lg text-ink">{selected.fullDate}</h3>
          <span className={`font-mono-upper text-[0.45rem] px-2 py-1 rounded-md ${badgeClass(selected.itemCount)}`}>
            {badgeLabel(selected.itemCount)}
          </span>
        </div>

        {selected.tasks.length === 0 && !taskInput ? (
          <div className="text-center py-5">
            <p className="font-display italic text-ink/20 text-[0.92rem]">
              White space. Protect it.
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {selected.tasks.map((task, i) => {
              const globalIndex = tasks.indexOf(task);
              const isLinking = linkingTask === globalIndex;

              return (
                <div key={i} className="rounded-lg overflow-hidden">
                  <div className="flex items-start gap-2.5 py-2 px-1">
                    <div className={`w-[7px] h-[7px] rounded-full mt-1.5 shrink-0 ${typeDot[task.type] || "bg-ink/15"}`} />
                    <div className="flex-1 min-w-0">
                      <div className="text-[0.85rem] text-ink leading-snug">{task.title}</div>
                      {task.aim ? (
                        <button
                          onClick={() => setLinkingTask(isLinking ? null : globalIndex)}
                          className="font-mono text-[0.45rem] text-ink/30 tracking-wide mt-0.5 hover:text-ink/50 transition-colors"
                        >
                          {task.aim}
                        </button>
                      ) : (
                        <button
                          onClick={() => setLinkingTask(isLinking ? null : globalIndex)}
                          className="font-mono text-[0.45rem] text-ink/20 tracking-wide mt-0.5 hover:text-ink/40 transition-colors"
                        >
                          + link to aim
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Aim picker */}
                  {isLinking && (
                    <div className="flex flex-wrap gap-1.5 px-1 pb-2.5 animate-fade-in">
                      {aims.map((aim) => (
                        <button
                          key={aim}
                          onClick={() => {
                            onLinkTaskToAim(globalIndex, task.aim === aim ? null : aim);
                            setLinkingTask(null);
                          }}
                          className={`font-mono text-[0.48rem] px-2.5 py-1 rounded-full transition-colors ${
                            task.aim === aim
                              ? "bg-pink/20 text-ink"
                              : "bg-ink/[0.03] text-ink/35 hover:bg-ink/[0.06]"
                          }`}
                        >
                          {aim}
                        </button>
                      ))}
                      {task.aim && (
                        <button
                          onClick={() => {
                            onLinkTaskToAim(globalIndex, null);
                            setLinkingTask(null);
                          }}
                          className="font-mono text-[0.48rem] px-2.5 py-1 rounded-full text-ink/20 hover:text-ink/40 transition-colors"
                        >
                          remove
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Add task to this day */}
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-ink/[0.04]">
          <input
            type="text"
            value={taskInput}
            onChange={(e) => setTaskInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTaskToDay()}
            placeholder={`Add to ${selected.dayName.toLowerCase()}...`}
            className="flex-1 py-2 px-2 text-[0.82rem] text-ink bg-transparent outline-none font-body"
          />
          <button
            onClick={addTaskToDay}
            disabled={!taskInput.trim() || isAdding}
            className="w-8 h-8 rounded-lg bg-ink text-white flex items-center justify-center shrink-0 transition-all disabled:opacity-15"
          >
            {isAdding ? (
              <div className="w-3.5 h-3.5 border-[1.5px] border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
