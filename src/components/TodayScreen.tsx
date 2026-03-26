"use client";

import { useState, useRef } from "react";
import { ParsedTask, CalendarEvent } from "./Onboarding";

const typeDot: Record<string, string> = {
  focus: "bg-blue",
  flow: "bg-pink",
  admin: "bg-ink/20",
};

const MicIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="23" />
    <line x1="8" y1="23" x2="16" y2="23" />
  </svg>
);

function parseTime(timeStr: string): number {
  const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return 0;
  let hours = parseInt(match[1]);
  const minutes = parseInt(match[2]);
  const period = match[3].toUpperCase();
  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

function formatHour(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const period = h >= 12 ? "PM" : "AM";
  const hour = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${hour} ${period}`;
}

type TimelineItem = {
  type: "event" | "task-slot";
  startMin: number;
  endMin: number;
  event?: CalendarEvent;
  tasks?: ParsedTask[];
};

function buildTimeline(events: CalendarEvent[], tasks: ParsedTask[]): TimelineItem[] {
  // Sort events by start time
  const sorted = [...events].sort((a, b) => parseTime(a.time) - parseTime(b.time));

  const items: TimelineItem[] = [];
  let cursor = 8 * 60; // Start at 8 AM

  for (const event of sorted) {
    const start = parseTime(event.time);
    const end = parseTime(event.endTime);

    // Gap before this event = task slot
    if (start > cursor) {
      items.push({
        type: "task-slot",
        startMin: cursor,
        endMin: start,
        tasks: [],
      });
    }

    items.push({
      type: "event",
      startMin: start,
      endMin: end,
      event,
    });

    cursor = Math.max(cursor, end);
  }

  // Remaining time after last event
  if (cursor < 18 * 60) {
    items.push({
      type: "task-slot",
      startMin: cursor,
      endMin: 18 * 60,
      tasks: [],
    });
  }

  // Distribute tasks into available slots (round-robin into gaps)
  const slots = items.filter((i) => i.type === "task-slot");
  tasks.forEach((task, idx) => {
    if (slots.length > 0) {
      const slot = slots[idx % slots.length];
      if (!slot.tasks) slot.tasks = [];
      slot.tasks.push(task);
    }
  });

  return items;
}

export default function TodayScreen({
  tasks,
  events = [],
  oneThing,
  aims,
  onAddTask,
}: {
  tasks: ParsedTask[];
  events?: CalendarEvent[];
  oneThing: ParsedTask | null;
  aims: string[];
  onAddTask: (task: ParsedTask) => void;
}) {
  const [input, setInput] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [isListening, setIsListening] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());

  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const dateLabel = today.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  const todayEvents = events.filter((e) => e.day === todayStr);
  const incompleteTasks = tasks.filter((t) => !completedTasks.has(t.title));
  const doneTasks = tasks.filter((t) => completedTasks.has(t.title));

  const timeline = buildTimeline(todayEvents, incompleteTasks);

  const toggleComplete = (taskTitle: string) => {
    setCompletedTasks((prev) => {
      const next = new Set(prev);
      if (next.has(taskTitle)) { next.delete(taskTitle); } else { next.add(taskTitle); }
      return next;
    });
  };

  const toggleListening = () => {
    if (isListening) { recognitionRef.current?.stop(); setIsListening(false); return; }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput((prev) => prev + (prev ? " " : "") + transcript.trim());
    };
    recognition.onerror = () => { setIsListening(false); };
    recognition.onend = () => setIsListening(false);
    recognition.start();
    recognitionRef.current = recognition;
    setIsListening(true);
  };

  const addTask = async () => {
    if (!input.trim()) return;
    setIsAdding(true);
    try {
      const res = await fetch("/api/parse-tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawTasks: input, aims, milestones: {} }),
      });
      const result = await res.json();
      if (result.tasks && result.tasks.length > 0) {
        result.tasks.forEach((t: ParsedTask) => { onAddTask({ ...t, day: todayStr }); });
      }
      setInput("");
    } catch (err) { console.error("Failed to add task:", err); }
    finally { setIsAdding(false); }
  };

  const hasTimeline = todayEvents.length > 0;

  return (
    <div className="animate-fade-up">
      <h2 className="font-display text-2xl text-ink mb-1">Today</h2>
      <p className="font-mono-upper text-[0.5rem] text-ink/40 mb-6">{dateLabel}</p>

      {/* One thing banner */}
      {oneThing && !completedTasks.has(oneThing.title) && (
        <div className="glass rounded-2xl p-5 mb-4 border-l-[3px] border-l-pink">
          <div className="font-mono-upper text-[0.42rem] text-pink mb-2 tracking-widest">Your one thing</div>
          <div className="text-[0.95rem] text-ink leading-snug">{oneThing.title}</div>
          {oneThing.aim && (
            <div className="font-mono text-[0.48rem] text-ink/30 tracking-wide mt-1">{oneThing.aim}</div>
          )}
        </div>
      )}

      {/* Timeline view (when calendar events exist) */}
      {hasTimeline && (
        <div className="glass rounded-2xl p-5 mb-4">
          <div className="font-mono-upper text-[0.48rem] text-ink/30 mb-4">Your day</div>
          <div className="space-y-0">
            {timeline.map((item, i) => {
              if (item.type === "event") {
                const durationMin = item.endMin - item.startMin;
                const height = Math.max(48, durationMin * 0.8);
                return (
                  <div key={`ev-${i}`} className="flex gap-3 mb-1">
                    {/* Time column */}
                    <div className="w-[52px] shrink-0 pt-2">
                      <span className="font-mono text-[0.5rem] text-ink/30 tracking-wide">{item.event!.time}</span>
                    </div>
                    {/* Event block */}
                    <div
                      className="flex-1 rounded-xl px-4 py-3 border-l-[3px] border-l-blue"
                      style={{
                        minHeight: height,
                        background: "var(--blue-pale)",
                        opacity: 0.7,
                      }}
                    >
                      <div className="text-[0.82rem] text-ink/70 leading-snug">{item.event!.title}</div>
                      <div className="font-mono text-[0.45rem] text-ink/25 tracking-wide mt-1">
                        {item.event!.time} - {item.event!.endTime}
                      </div>
                    </div>
                  </div>
                );
              }

              // Task slot
              if (!item.tasks || item.tasks.length === 0) {
                const gapMin = item.endMin - item.startMin;
                if (gapMin < 30) return null;
                return (
                  <div key={`gap-${i}`} className="flex gap-3 mb-1">
                    <div className="w-[52px] shrink-0 pt-2">
                      <span className="font-mono text-[0.5rem] text-ink/15 tracking-wide">{formatHour(item.startMin)}</span>
                    </div>
                    <div className="flex-1 py-3 px-4 rounded-xl border border-dashed border-ink/[0.06]">
                      <span className="font-display italic text-[0.78rem] text-ink/15">Open time</span>
                    </div>
                  </div>
                );
              }

              return (
                <div key={`tasks-${i}`} className="flex gap-3 mb-1">
                  <div className="w-[52px] shrink-0 pt-2.5">
                    <span className="font-mono text-[0.5rem] text-ink/20 tracking-wide">{formatHour(item.startMin)}</span>
                  </div>
                  <div className="flex-1 space-y-1 py-1">
                    {item.tasks.map((task, ti) => (
                      <button
                        key={ti}
                        onClick={() => toggleComplete(task.title)}
                        className="flex items-start gap-2.5 w-full text-left py-2 px-3 rounded-lg hover:bg-white/40 transition-colors"
                      >
                        <div className="w-[16px] h-[16px] rounded-md border-[1.5px] border-ink/15 mt-0.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-[0.82rem] text-ink/80 leading-snug">{task.title}</div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <div className={`w-[4px] h-[4px] rounded-full ${typeDot[task.type] || "bg-ink/15"}`} />
                            {task.aim && (
                              <span className="font-mono text-[0.4rem] text-ink/20 tracking-wide">{task.aim}</span>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Fallback: simple task list when no calendar */}
      {!hasTimeline && incompleteTasks.length > 0 && (
        <div className="glass rounded-2xl p-5 mb-4">
          <div className="font-mono-upper text-[0.48rem] text-ink/30 mb-3">To do</div>
          <div className="space-y-1">
            {incompleteTasks.map((task, i) => (
              <button
                key={task.title + i}
                onClick={() => toggleComplete(task.title)}
                className="flex items-start gap-3 w-full text-left py-2.5 px-1 rounded-lg hover:bg-white/30 transition-colors"
              >
                <div className="w-[18px] h-[18px] rounded-md border-[1.5px] border-ink/15 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-[0.88rem] text-ink/80 leading-snug">{task.title}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className={`w-[5px] h-[5px] rounded-full ${typeDot[task.type] || "bg-ink/15"}`} />
                    <span className="font-mono text-[0.42rem] text-ink/25 tracking-wide">{task.type}</span>
                    {task.aim && (
                      <>
                        <span className="text-ink/10">&middot;</span>
                        <span className="font-mono text-[0.42rem] text-ink/25 tracking-wide">{task.aim}</span>
                      </>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Completed */}
      {doneTasks.length > 0 && (
        <div className="glass rounded-2xl p-5 mb-4 opacity-50">
          <div className="font-mono-upper text-[0.48rem] text-ink/25 mb-3">Done</div>
          <div className="space-y-1">
            {doneTasks.map((task, i) => (
              <button key={task.title + i} onClick={() => toggleComplete(task.title)} className="flex items-start gap-3 w-full text-left py-2 px-1 rounded-lg hover:bg-white/30 transition-colors">
                <div className="w-[18px] h-[18px] rounded-md bg-pink/20 mt-0.5 shrink-0 flex items-center justify-center">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-pink"><polyline points="20 6 9 17 4 12" /></svg>
                </div>
                <span className="text-[0.88rem] text-ink/40 line-through leading-snug">{task.title}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!hasTimeline && tasks.length === 0 && (
        <div className="glass rounded-2xl p-8 mb-4 text-center">
          <p className="font-display italic text-ink/25 text-base mb-2">Nothing scheduled for today.</p>
          <p className="text-[0.8rem] text-ink/30">Add a task below or check your week view.</p>
        </div>
      )}

      {/* Task entry with mic */}
      <div className="glass rounded-2xl p-3 flex items-center gap-2">
        <input
          type="text" value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTask()}
          placeholder="Add a task..."
          className="flex-1 py-2.5 px-3 text-[0.85rem] text-ink bg-transparent outline-none font-body"
        />
        <button
          onClick={toggleListening}
          className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-all ${isListening ? "bg-pink text-white animate-pulse" : "bg-ink/[0.05] text-ink/30 hover:bg-ink/[0.1]"}`}
        >
          <MicIcon />
        </button>
        <button
          onClick={addTask} disabled={!input.trim() || isAdding}
          className="w-9 h-9 rounded-lg bg-ink text-white flex items-center justify-center shrink-0 transition-all disabled:opacity-20"
        >
          {isAdding ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          )}
        </button>
      </div>
    </div>
  );
}
