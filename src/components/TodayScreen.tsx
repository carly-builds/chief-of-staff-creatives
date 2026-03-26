"use client";

import { useState, useRef, useCallback, useEffect } from "react";
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

type Slot = {
  id: string;
  startMin: number;
  endMin: number;
};

function buildSlots(events: CalendarEvent[]): { events: (CalendarEvent & { startMin: number; endMin: number })[], slots: Slot[] } {
  const sorted = [...events].sort((a, b) => parseTime(a.time) - parseTime(b.time));
  const parsedEvents = sorted.map(e => ({
    ...e,
    startMin: parseTime(e.time),
    endMin: parseTime(e.endTime),
  }));

  const slots: Slot[] = [];
  let cursor = 8 * 60;
  let slotIdx = 0;

  for (const ev of parsedEvents) {
    if (ev.startMin > cursor) {
      slots.push({ id: `slot-${slotIdx++}`, startMin: cursor, endMin: ev.startMin });
    }
    cursor = Math.max(cursor, ev.endMin);
  }
  if (cursor < 18 * 60) {
    slots.push({ id: `slot-${slotIdx}`, startMin: cursor, endMin: 18 * 60 });
  }

  return { events: parsedEvents, slots };
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
  const { events: parsedEvents, slots } = buildSlots(todayEvents);
  const hasTimeline = todayEvents.length > 0;

  // Track task-to-slot assignment
  const [taskSlots, setTaskSlots] = useState<Record<string, string>>({});

  // Initialize task assignments on first render
  useEffect(() => {
    const incomp = tasks.filter(t => !completedTasks.has(t.title));
    if (slots.length > 0 && incomp.length > 0) {
      setTaskSlots(prev => {
        const next = { ...prev };
        let needsUpdate = false;
        incomp.forEach((task, idx) => {
          if (!next[task.title]) {
            next[task.title] = slots[idx % slots.length].id;
            needsUpdate = true;
          }
        });
        return needsUpdate ? next : prev;
      });
    }
  }, [tasks, slots, completedTasks]);

  const getTasksForSlot = (slotId: string) => {
    return tasks.filter(t => !completedTasks.has(t.title) && taskSlots[t.title] === slotId);
  };

  // Drag state
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);

  const handleDragStart = (taskTitle: string) => {
    setDragging(taskTitle);
  };

  const handleDragEnd = () => {
    setDragging(null);
    setDragOver(null);
  };

  const handleDrop = useCallback((slotId: string) => {
    if (dragging) {
      setTaskSlots(prev => ({ ...prev, [dragging]: slotId }));
    }
    setDragging(null);
    setDragOver(null);
  }, [dragging]);

  // Touch drag support
  const touchTask = useRef<string | null>(null);
  const touchStartY = useRef(0);
  const [touchDragging, setTouchDragging] = useState(false);

  const handleTouchStart = (taskTitle: string, e: React.TouchEvent) => {
    touchTask.current = taskTitle;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchTask.current) return;
    const diff = Math.abs(e.touches[0].clientY - touchStartY.current);
    if (diff > 10) setTouchDragging(true);

    // Find which slot we're over
    const touch = e.touches[0];
    const elements = document.elementsFromPoint(touch.clientX, touch.clientY);
    const slotEl = elements.find(el => el.getAttribute("data-slot-id"));
    if (slotEl) {
      setDragOver(slotEl.getAttribute("data-slot-id"));
    }
  };

  const handleTouchEnd = () => {
    if (touchTask.current && dragOver && touchDragging) {
      setTaskSlots(prev => ({ ...prev, [touchTask.current!]: dragOver }));
    }
    touchTask.current = null;
    setTouchDragging(false);
    setDragOver(null);
  };

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
    recognition.continuous = false; recognition.interimResults = false; recognition.lang = "en-US";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput((prev) => prev + (prev ? " " : "") + transcript.trim());
    };
    recognition.onerror = () => { setIsListening(false); };
    recognition.onend = () => setIsListening(false);
    recognition.start(); recognitionRef.current = recognition; setIsListening(true);
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

  const doneTasks = tasks.filter((t) => completedTasks.has(t.title));

  // Build interleaved timeline: events + slots in time order
  const timelineItems: { type: "event" | "slot"; startMin: number; endMin: number; event?: CalendarEvent & { startMin: number; endMin: number }; slot?: Slot }[] = [];
  let eIdx = 0, sIdx = 0;
  while (eIdx < parsedEvents.length || sIdx < slots.length) {
    const ev = parsedEvents[eIdx];
    const sl = slots[sIdx];
    if (ev && (!sl || ev.startMin <= sl.startMin)) {
      timelineItems.push({ type: "event", startMin: ev.startMin, endMin: ev.endMin, event: ev });
      eIdx++;
    } else if (sl) {
      timelineItems.push({ type: "slot", startMin: sl.startMin, endMin: sl.endMin, slot: sl });
      sIdx++;
    }
  }

  return (
    <div className="animate-fade-up" onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
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

      {/* Timeline */}
      {hasTimeline && (
        <div className="glass rounded-2xl p-5 mb-4">
          <div className="font-mono-upper text-[0.48rem] text-ink/30 mb-4">Your day</div>
          <div className="space-y-1">
            {timelineItems.map((item, i) => {
              if (item.type === "event" && item.event) {
                const durationMin = item.endMin - item.startMin;
                const height = Math.max(44, durationMin * 0.7);
                return (
                  <div key={`ev-${i}`} className="flex gap-3">
                    <div className="w-[48px] shrink-0 pt-2.5">
                      <span className="font-mono text-[0.48rem] text-ink/25 tracking-wide">{item.event.time}</span>
                    </div>
                    <div
                      className="flex-1 rounded-lg px-3.5 py-2.5 border-l-[3px] border-l-blue"
                      style={{ minHeight: height, background: "var(--blue-pale)", opacity: 0.65 }}
                    >
                      <div className="text-[0.8rem] text-ink/60 leading-snug">{item.event.title}</div>
                      <div className="font-mono text-[0.42rem] text-ink/20 tracking-wide mt-0.5">
                        {item.event.time} - {item.event.endTime}
                      </div>
                    </div>
                  </div>
                );
              }

              if (item.type === "slot" && item.slot) {
                const slotTasks = getTasksForSlot(item.slot.id);
                const isDropTarget = dragOver === item.slot.id;
                const gapMin = item.endMin - item.startMin;

                return (
                  <div
                    key={item.slot.id}
                    data-slot-id={item.slot.id}
                    className={`flex gap-3 transition-all duration-150 ${isDropTarget ? "scale-[1.01]" : ""}`}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(item.slot!.id); }}
                    onDragLeave={() => setDragOver(null)}
                    onDrop={(e) => { e.preventDefault(); handleDrop(item.slot!.id); }}
                  >
                    <div className="w-[48px] shrink-0 pt-2.5">
                      <span className="font-mono text-[0.48rem] text-ink/15 tracking-wide">{formatHour(item.startMin)}</span>
                    </div>
                    <div
                      className={`flex-1 rounded-lg py-1 min-h-[40px] transition-all duration-150 ${
                        isDropTarget
                          ? "bg-pink/[0.06] border border-dashed border-pink/20"
                          : slotTasks.length === 0
                          ? "border border-dashed border-ink/[0.05]"
                          : ""
                      }`}
                      data-slot-id={item.slot.id}
                    >
                      {slotTasks.length === 0 && gapMin >= 30 && (
                        <div className="flex items-center justify-center h-full py-3" data-slot-id={item.slot.id}>
                          <span className="font-display italic text-[0.72rem] text-ink/12">
                            {isDropTarget ? "Drop here" : "Open time"}
                          </span>
                        </div>
                      )}
                      {slotTasks.map((task) => (
                        <div
                          key={task.title}
                          draggable
                          onDragStart={() => handleDragStart(task.title)}
                          onDragEnd={handleDragEnd}
                          onTouchStart={(e) => handleTouchStart(task.title, e)}
                          className={`flex items-start gap-2.5 py-2 px-3 rounded-lg cursor-grab active:cursor-grabbing transition-all ${
                            dragging === task.title ? "opacity-40 scale-95" : "hover:bg-white/40"
                          }`}
                        >
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleComplete(task.title); }}
                            className="w-[16px] h-[16px] rounded-md border-[1.5px] border-ink/15 mt-0.5 shrink-0 hover:border-ink/30 transition-colors"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-[0.8rem] text-ink/75 leading-snug">{task.title}</div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <div className={`w-[4px] h-[4px] rounded-full ${typeDot[task.type] || "bg-ink/15"}`} />
                              {task.aim && (
                                <span className="font-mono text-[0.4rem] text-ink/20 tracking-wide">{task.aim}</span>
                              )}
                            </div>
                          </div>
                          {/* Drag handle */}
                          <div className="shrink-0 mt-1 text-ink/10">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                              <circle cx="9" cy="6" r="1.5" /><circle cx="15" cy="6" r="1.5" />
                              <circle cx="9" cy="12" r="1.5" /><circle cx="15" cy="12" r="1.5" />
                              <circle cx="9" cy="18" r="1.5" /><circle cx="15" cy="18" r="1.5" />
                            </svg>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }

              return null;
            })}
          </div>
        </div>
      )}

      {/* Simple list fallback when no calendar */}
      {!hasTimeline && tasks.filter(t => !completedTasks.has(t.title)).length > 0 && (
        <div className="glass rounded-2xl p-5 mb-4">
          <div className="font-mono-upper text-[0.48rem] text-ink/30 mb-3">To do</div>
          <div className="space-y-1">
            {tasks.filter(t => !completedTasks.has(t.title)).map((task, i) => (
              <button key={task.title + i} onClick={() => toggleComplete(task.title)} className="flex items-start gap-3 w-full text-left py-2.5 px-1 rounded-lg hover:bg-white/30 transition-colors">
                <div className="w-[18px] h-[18px] rounded-md border-[1.5px] border-ink/15 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-[0.88rem] text-ink/80 leading-snug">{task.title}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className={`w-[5px] h-[5px] rounded-full ${typeDot[task.type] || "bg-ink/15"}`} />
                    <span className="font-mono text-[0.42rem] text-ink/25 tracking-wide">{task.type}</span>
                    {task.aim && (<><span className="text-ink/10">&middot;</span><span className="font-mono text-[0.42rem] text-ink/25 tracking-wide">{task.aim}</span></>)}
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
        <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addTask()} placeholder="Add a task..." className="flex-1 py-2.5 px-3 text-[0.85rem] text-ink bg-transparent outline-none font-body" />
        <button onClick={toggleListening} className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-all ${isListening ? "bg-pink text-white animate-pulse" : "bg-ink/[0.05] text-ink/30 hover:bg-ink/[0.1]"}`}><MicIcon /></button>
        <button onClick={addTask} disabled={!input.trim() || isAdding} className="w-9 h-9 rounded-lg bg-ink text-white flex items-center justify-center shrink-0 transition-all disabled:opacity-20">
          {isAdding ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>}
        </button>
      </div>
    </div>
  );
}
