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
  const dateLabel = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const todayEvents = events.filter((e) => e.day === todayStr);

  const toggleComplete = (taskTitle: string) => {
    setCompletedTasks((prev) => {
      const next = new Set(prev);
      if (next.has(taskTitle)) { next.delete(taskTitle); } else { next.add(taskTitle); }
      return next;
    });
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }
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
        result.tasks.forEach((t: ParsedTask) => {
          onAddTask({ ...t, day: todayStr });
        });
      }
      setInput("");
    } catch (err) {
      console.error("Failed to add task:", err);
    } finally {
      setIsAdding(false);
    }
  };

  const incompleteTasks = tasks.filter((t) => !completedTasks.has(t.title));
  const doneTasks = tasks.filter((t) => completedTasks.has(t.title));

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

      {/* Calendar events */}
      {todayEvents.length > 0 && (
        <div className="glass rounded-2xl p-5 mb-4">
          <div className="font-mono-upper text-[0.48rem] text-ink/30 mb-3">Schedule</div>
          <div className="space-y-2.5">
            {todayEvents.map((event, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="font-mono text-[0.52rem] text-ink/30 tracking-wide min-w-[52px] mt-0.5">{event.time}</span>
                <div className="flex-1">
                  <div className="text-[0.85rem] text-ink/70 leading-snug">{event.title}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Task list */}
      {incompleteTasks.length > 0 && (
        <div className="glass rounded-2xl p-5 mb-4">
          <div className="font-mono-upper text-[0.48rem] text-ink/30 mb-3">To do</div>
          <div className="space-y-1">
            {incompleteTasks.map((task, i) => {
              const isOneThing = oneThing?.title === task.title;
              return (
                <button
                  key={task.title + i}
                  onClick={() => toggleComplete(task.title)}
                  className="flex items-start gap-3 w-full text-left py-2.5 px-1 rounded-lg hover:bg-white/30 transition-colors"
                >
                  <div className="w-[18px] h-[18px] rounded-md border-[1.5px] border-ink/15 mt-0.5 shrink-0 flex items-center justify-center transition-colors hover:border-ink/30" />
                  <div className="flex-1 min-w-0">
                    <div className={`text-[0.88rem] leading-snug ${isOneThing ? "text-ink font-normal" : "text-ink/80"}`}>{task.title}</div>
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
              );
            })}
          </div>
        </div>
      )}

      {/* Completed tasks */}
      {doneTasks.length > 0 && (
        <div className="glass rounded-2xl p-5 mb-4 opacity-60">
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
      {tasks.length === 0 && todayEvents.length === 0 && (
        <div className="glass rounded-2xl p-8 mb-4 text-center">
          <p className="font-display italic text-ink/25 text-base mb-2">Nothing scheduled for today.</p>
          <p className="text-[0.8rem] text-ink/30">Add a task below or check your week view.</p>
        </div>
      )}

      {/* Task entry with mic */}
      <div className="glass rounded-2xl p-3 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTask()}
          placeholder="Add a task..."
          className="flex-1 py-2.5 px-3 text-[0.85rem] text-ink bg-transparent outline-none font-body"
        />
        <button
          onClick={toggleListening}
          className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-all ${
            isListening ? "bg-pink text-white animate-pulse" : "bg-ink/[0.05] text-ink/30 hover:bg-ink/[0.1]"
          }`}
        >
          <MicIcon />
        </button>
        <button
          onClick={addTask}
          disabled={!input.trim() || isAdding}
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
