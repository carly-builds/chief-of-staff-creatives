"use client";

import { useState, useRef } from "react";

export type ParsedTask = {
  title: string;
  day: string;
  aim: string | null;
  type: "focus" | "flow" | "admin";
};

export type OnboardingData = {
  aims: string[];
  currentAimInput: string;
  milestones: Record<string, string>;
  tasks: string;
  parsedTasks: ParsedTask[];
  calendarConnected: boolean;
  calendarSkipped: boolean;
};

const totalSteps = 6;

const dayName = (dateStr: string) =>
  new Date(dateStr + "T12:00:00").toLocaleDateString("en-US", { weekday: "short" });

const typeDot: Record<string, string> = {
  focus: "bg-blue",
  flow: "bg-pink",
  admin: "bg-ink/20",
};

export default function Onboarding({
  onComplete,
}: {
  onComplete: (data: OnboardingData) => void;
}) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingData>({
    aims: [],
    currentAimInput: "",
    milestones: {},
    tasks: "",
    parsedTasks: [],
    calendarConnected: false,
    calendarSkipped: false,
  });
  const [isParsing, setIsParsing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  const next = () => setStep((s) => Math.min(s + 1, totalSteps + 1));
  const back = () => setStep((s) => Math.max(s - 1, 1));

  const addAim = () => {
    const trimmed = data.currentAimInput.trim();
    if (trimmed && data.aims.length < 3) {
      setData({
        ...data,
        aims: [...data.aims, trimmed],
        currentAimInput: "",
      });
    }
  };

  const removeAim = (index: number) => {
    setData({
      ...data,
      aims: data.aims.filter((_, i) => i !== index),
    });
  };

  // Voice input
  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice input isn't supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    let finalTranscript = data.tasks;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += (finalTranscript ? "\n" : "") + transcript.trim();
          setData((d) => ({ ...d, tasks: finalTranscript }));
        }
      }
    };

    recognition.onerror = () => { setIsListening(false); };
    recognition.onend = () => setIsListening(false);

    recognition.start();
    recognitionRef.current = recognition;
    setIsListening(true);
  };

  // Parse tasks with AI
  const parseTasks = async () => {
    setIsParsing(true);
    next(); // Move to step 4 (the loading/result screen)

    try {
      const res = await fetch("/api/parse-tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawTasks: data.tasks,
          aims: data.aims,
          milestones: data.milestones,
        }),
      });
      const result = await res.json();
      if (result.tasks) {
        setData((d) => ({ ...d, parsedTasks: result.tasks }));
      }
    } catch (err) {
      console.error("Failed to parse tasks:", err);
    } finally {
      setIsParsing(false);
    }
  };

  const moveTask = (taskIndex: number, newDay: string) => {
    setData((d) => ({
      ...d,
      parsedTasks: d.parsedTasks.map((t, i) =>
        i === taskIndex ? { ...t, day: newDay } : t
      ),
    }));
  };

  // Get available days for the week
  const getWeekDays = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const sunday = new Date(today);
    sunday.setDate(today.getDate() - dayOfWeek);
    const days: { name: string; date: string; isPast: boolean }[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(sunday);
      d.setDate(sunday.getDate() + i);
      days.push({
        name: d.toLocaleDateString("en-US", { weekday: "short" }),
        date: d.toISOString().split("T")[0],
        isPast: d < today && d.toDateString() !== today.toDateString(),
      });
    }
    return days;
  };

  const [editingTask, setEditingTask] = useState<number | null>(null);

  const aimColors = ["bg-pink/20", "bg-blue/20", "bg-pink-light/30"];
  const aimDotColors = ["bg-pink", "bg-blue", "bg-pink-light"];

  return (
    <div className="relative z-[2] min-h-screen flex flex-col items-center justify-center px-5 py-12">
      <div className="glass rounded-3xl p-8 w-full max-w-[380px] text-center animate-fade-up">
        {/* Step indicator */}
        <div className="flex gap-1 justify-center mb-6">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`h-[3px] rounded-full transition-all duration-300 ${
                i < step
                  ? "w-7 bg-pink"
                  : i === step
                  ? "w-7 bg-pink-light"
                  : "w-7 bg-ink/[0.08]"
              }`}
            />
          ))}
        </div>

        {/* Step 1: Aims */}
        {step === 1 && (
          <div key="step1" className="animate-fade-in">
            <p className="font-mono-upper text-[0.48rem] text-pink mb-4">
              Step 1 of {totalSteps}
            </p>
            <h2 className="font-display text-[1.35rem] text-ink mb-2 leading-snug">
              What are you putting your energy toward?
            </h2>
            <p className="text-[0.85rem] text-ink/45 mb-6 leading-relaxed">
              Name 1 to 3 things you&apos;re trying to make real right now. A
              project, a goal, a dream.
            </p>
            <div className="flex items-center gap-0 border-[1.5px] border-ink/[0.08] rounded-xl bg-white/60 transition-colors focus-within:border-pink overflow-hidden">
              <input
                type="text"
                value={data.currentAimInput}
                onChange={(e) =>
                  setData({ ...data, currentAimInput: e.target.value })
                }
                onKeyDown={(e) => e.key === "Enter" && addAim()}
                placeholder={
                  data.aims.length === 0
                    ? "My first album..."
                    : data.aims.length < 3
                    ? "Add another..."
                    : "You've got 3!"
                }
                disabled={data.aims.length >= 3}
                className="flex-1 py-3.5 pl-4 pr-2 font-display text-[1.05rem] text-ink bg-transparent text-center outline-none border-none disabled:opacity-40"
              />
              <button
                onClick={addAim}
                disabled={!data.currentAimInput.trim() || data.aims.length >= 3}
                className="flex items-center justify-center w-10 h-10 mr-1 rounded-lg bg-ink text-white transition-all disabled:opacity-0 disabled:scale-75 opacity-100 scale-100 shrink-0"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </button>
            </div>
            {data.aims.length > 0 && (
              <div className="flex flex-wrap gap-2 justify-center mt-4">
                {data.aims.map((aim, i) => (
                  <button
                    key={i}
                    onClick={() => removeAim(i)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-[0.8rem] text-ink ${aimColors[i]} transition-all hover:opacity-70`}
                  >
                    <span className={`w-[7px] h-[7px] rounded-full ${aimDotColors[i]}`} />
                    {aim}
                    <span className="text-ink/25 ml-1">&times;</span>
                  </button>
                ))}
              </div>
            )}
            <button
              onClick={next}
              disabled={data.aims.length === 0}
              className="font-mono-upper text-[0.6rem] bg-ink text-white px-9 py-3.5 rounded-xl mt-6 transition-opacity disabled:opacity-20 hover:opacity-85"
            >
              continue
            </button>
          </div>
        )}

        {/* Step 2: Milestones */}
        {step === 2 && (
          <div key="step2" className="animate-fade-in">
            <p className="font-mono-upper text-[0.48rem] text-pink mb-4">
              Step 2 of {totalSteps}
            </p>
            <h2 className="font-display text-[1.35rem] text-ink mb-2 leading-snug">
              What would progress look like this month?
            </h2>
            <p className="text-[0.85rem] text-ink/45 mb-6 leading-relaxed">
              For each aim, describe what forward looks like. A number, a
              milestone, a feeling.
            </p>
            <div className="space-y-3">
              {data.aims.map((aim, i) => (
                <div key={i} className="text-left">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`w-[7px] h-[7px] rounded-full ${aimDotColors[i]}`} />
                    <span className="text-[0.78rem] text-ink">{aim}</span>
                  </div>
                  <input
                    type="text"
                    value={data.milestones[aim] || ""}
                    onChange={(e) =>
                      setData({
                        ...data,
                        milestones: { ...data.milestones, [aim]: e.target.value },
                      })
                    }
                    placeholder="e.g., Finish 3 chapters, Sign 2 clients..."
                    className="w-full py-3 px-4 border-[1.5px] border-ink/[0.08] rounded-xl text-[0.88rem] text-ink bg-white/60 outline-none focus:border-pink transition-colors"
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-3 justify-center mt-6">
              <button onClick={back} className="font-mono-upper text-[0.55rem] text-ink/40 px-4 py-3">
                back
              </button>
              <button
                onClick={next}
                className="font-mono-upper text-[0.6rem] bg-ink text-white px-9 py-3.5 rounded-xl transition-opacity hover:opacity-85"
              >
                continue
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Brain dump with voice */}
        {step === 3 && (
          <div key="step3" className="animate-fade-in">
            <p className="font-mono-upper text-[0.48rem] text-pink mb-4">
              Step 3 of {totalSteps}
            </p>
            <h2 className="font-display text-[1.35rem] text-ink mb-2 leading-snug">
              What&apos;s on your plate this week?
            </h2>
            <p className="text-[0.85rem] text-ink/45 mb-6 leading-relaxed">
              Type it out or tap the mic and talk. We&apos;ll sort it.
            </p>
            <div className="relative">
              <textarea
                value={data.tasks}
                onChange={(e) => setData({ ...data, tasks: e.target.value })}
                placeholder={"Email Sarah about the collab\nFinish the landing page\nPost on Instagram\nSend invoice to Maya..."}
                rows={6}
                className="w-full py-3 px-4 pr-14 border-[1.5px] border-ink/[0.08] rounded-xl text-[0.88rem] text-ink bg-white/60 outline-none focus:border-pink transition-colors resize-none leading-relaxed"
              />
              {/* Voice button */}
              <button
                onClick={toggleListening}
                className={`absolute right-3 bottom-3 w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                  isListening
                    ? "bg-pink text-white animate-pulse"
                    : "bg-ink/[0.06] text-ink/40 hover:bg-ink/[0.12] hover:text-ink/60"
                }`}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" y1="19" x2="12" y2="23" />
                  <line x1="8" y1="23" x2="16" y2="23" />
                </svg>
              </button>
            </div>
            {isListening && (
              <p className="font-mono-upper text-[0.48rem] text-pink mt-2 animate-pulse">
                Listening...
              </p>
            )}
            <div className="flex gap-3 justify-center mt-6">
              <button onClick={back} className="font-mono-upper text-[0.55rem] text-ink/40 px-4 py-3">
                back
              </button>
              <button
                onClick={parseTasks}
                disabled={!data.tasks.trim()}
                className="font-mono-upper text-[0.6rem] bg-ink text-white px-9 py-3.5 rounded-xl transition-opacity disabled:opacity-20 hover:opacity-85"
              >
                organize my week
              </button>
            </div>
          </div>
        )}

        {/* Step 4: AI organizing / week preview */}
        {step === 4 && (
          <div key="step4" className="animate-fade-in">
            {isParsing ? (
              <div className="py-8">
                <div className="w-12 h-12 mx-auto mb-5 rounded-full border-2 border-pink/30 border-t-pink animate-spin" />
                <h2 className="font-display text-[1.2rem] text-ink mb-2">
                  Organizing your week...
                </h2>
                <p className="text-[0.8rem] text-ink/35 italic">
                  Matching tasks to your aims, finding the right days.
                </p>
              </div>
            ) : (
              <>
                <p className="font-mono-upper text-[0.48rem] text-pink mb-4">
                  Step 4 of {totalSteps}
                </p>
                <h2 className="font-display text-[1.2rem] text-ink mb-2 leading-snug">
                  Here&apos;s your week.
                </h2>
                <p className="text-[0.78rem] text-ink/40 mb-5">
                  Tap a day label to move a task.
                </p>

                {/* Mini week view of parsed tasks */}
                <div className="text-left space-y-2 max-h-[340px] overflow-y-auto scroll-hide">
                  {getWeekDays()
                    .filter((d) => !d.isPast)
                    .map((day) => {
                      const dayTasks = data.parsedTasks.filter(
                        (t) => t.day === day.date
                      );
                      if (dayTasks.length === 0) return null;
                      return (
                        <div key={day.date} className="mb-3">
                          <div className="font-mono-upper text-[0.48rem] text-ink/35 mb-1.5">
                            {day.name} {new Date(day.date + "T12:00:00").getDate()}
                          </div>
                          {dayTasks.map((task, ti) => {
                            const globalIndex = data.parsedTasks.indexOf(task);
                            const isEditing = editingTask === globalIndex;
                            return (
                              <div
                                key={ti}
                                className="rounded-lg bg-white/40 mb-1 overflow-hidden"
                              >
                                <button
                                  onClick={() =>
                                    setEditingTask(isEditing ? null : globalIndex)
                                  }
                                  className="flex items-start gap-2.5 py-2 px-3 w-full text-left"
                                >
                                  <div
                                    className={`w-[6px] h-[6px] rounded-full mt-1.5 shrink-0 ${
                                      typeDot[task.type] || "bg-ink/20"
                                    }`}
                                  />
                                  <div className="flex-1 min-w-0">
                                    <div className="text-[0.82rem] text-ink leading-snug">
                                      {task.title}
                                    </div>
                                    {task.aim && (
                                      <div className="font-mono text-[0.45rem] text-ink/30 tracking-wide mt-0.5">
                                        {task.aim}
                                      </div>
                                    )}
                                  </div>
                                  <div className="font-mono text-[0.5rem] text-ink/30 px-1.5 py-0.5 rounded bg-ink/[0.04] shrink-0">
                                    {dayName(task.day)}
                                  </div>
                                </button>
                                {/* Inline day picker - slides open below */}
                                {isEditing && (
                                  <div className="flex gap-1 px-3 pb-2.5 pt-0.5 animate-fade-in">
                                    <span className="font-mono text-[0.42rem] text-ink/25 self-center mr-1">
                                      move to:
                                    </span>
                                    {getWeekDays()
                                      .filter((d) => !d.isPast)
                                      .map((d) => (
                                        <button
                                          key={d.date}
                                          onClick={() => {
                                            moveTask(globalIndex, d.date);
                                            setEditingTask(null);
                                          }}
                                          className={`font-mono text-[0.5rem] px-2 py-1 rounded transition-colors ${
                                            d.date === task.day
                                              ? "bg-pink/25 text-ink"
                                              : "text-ink/35 bg-ink/[0.03] hover:bg-ink/[0.06]"
                                          }`}
                                        >
                                          {d.name}
                                        </button>
                                      ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                </div>

                <div className="flex gap-3 justify-center mt-5">
                  <button
                    onClick={() => {
                      setStep(3);
                      setData((d) => ({ ...d, parsedTasks: [] }));
                    }}
                    className="font-mono-upper text-[0.55rem] text-ink/40 px-4 py-3"
                  >
                    redo
                  </button>
                  <button
                    onClick={next}
                    className="font-mono-upper text-[0.6rem] bg-ink text-white px-9 py-3.5 rounded-xl transition-opacity hover:opacity-85"
                  >
                    looks good
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Step 5: Google Calendar */}
        {step === 5 && (
          <div key="step5" className="animate-fade-in">
            <p className="font-mono-upper text-[0.48rem] text-pink mb-4">
              Step 5 of {totalSteps}
            </p>
            <h2 className="font-display text-[1.35rem] text-ink mb-2 leading-snug">
              Want to connect your calendar?
            </h2>
            <p className="text-[0.85rem] text-ink/45 mb-6 leading-relaxed">
              We&apos;ll pull in your schedule so you can see what time you
              actually have. Totally optional.
            </p>
            <button
              onClick={() => {
                setData({ ...data, calendarConnected: true });
                next();
              }}
              className="font-mono-upper text-[0.6rem] bg-ink text-white px-9 py-3.5 rounded-xl transition-opacity hover:opacity-85 w-full"
            >
              connect google calendar
            </button>
            <button
              onClick={() => {
                setData({ ...data, calendarSkipped: true });
                next();
              }}
              className="font-mono-upper text-[0.55rem] text-ink/35 px-4 py-3 mt-3 block mx-auto hover:text-ink/50 transition-colors"
            >
              skip for now
            </button>
            <div className="flex gap-3 justify-center mt-4">
              <button onClick={back} className="font-mono-upper text-[0.55rem] text-ink/40 px-4 py-3">
                back
              </button>
            </div>
          </div>
        )}

        {/* Step 6: Let's go */}
        {step === 6 && (
          <div key="step6" className="animate-fade-in">
            <p className="font-mono-upper text-[0.48rem] text-pink mb-4">
              Step 6 of {totalSteps}
            </p>
            <h2 className="font-display text-[1.35rem] text-ink mb-2 leading-snug">
              Let&apos;s find your one thing.
            </h2>
            <p className="text-[0.85rem] text-ink/45 mb-6 leading-relaxed">
              If you could only move one thing forward today, what would it be?
              We&apos;ll help you decide.
            </p>
            <button
              onClick={() => onComplete(data)}
              className="font-mono-upper text-[0.6rem] bg-ink text-white px-9 py-3.5 rounded-xl transition-opacity hover:opacity-85"
            >
              let&apos;s go
            </button>
            <div className="flex gap-3 justify-center mt-4">
              <button onClick={back} className="font-mono-upper text-[0.55rem] text-ink/40 px-4 py-3">
                back
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
