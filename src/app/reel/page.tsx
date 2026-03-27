"use client";

import { useState, useEffect, useCallback } from "react";
import confetti from "canvas-confetti";
import CollageBackground from "@/components/CollageBackground";
import { usePalette } from "@/lib/PaletteContext";
import { palettes } from "@/lib/palettes";

// Pre-built data
const todayTasks = [
  { title: "Film module 3 intro", aim: "Launch my course", type: "focus" },
  { title: "Write newsletter about burnout", aim: "Grow newsletter to 10K", type: "focus" },
  { title: "Research Valencia neighborhoods", aim: "Move to Spain", type: "flow" },
  { title: "Send overdue invoices", aim: null, type: "admin" },
];

const weekData = [
  { day: "S", items: 0 },
  { day: "M", items: 2 },
  { day: "T", items: 3 },
  { day: "W", items: 0 },
  { day: "T", items: 5, isToday: true },
  { day: "F", items: 3 },
  { day: "S", items: 1 },
];

const typeDot: Record<string, string> = {
  focus: "bg-blue",
  flow: "bg-pink",
  admin: "bg-ink/20",
};

function barHeight(n: number) {
  if (n === 0) return "h-1.5";
  if (n === 1) return "h-3";
  if (n === 2) return "h-5";
  if (n === 3) return "h-8";
  if (n === 4) return "h-10";
  return "h-12";
}

function barColor(n: number) {
  if (n >= 4) return "bg-pink";
  if (n >= 2) return "bg-pink-light";
  return "bg-blue-light";
}

type Scene = "triage" | "triage-pick" | "one-thing" | "today" | "week" | "review" | "end";

const TIMINGS: Record<Scene, number> = {
  "triage": 2500,
  "triage-pick": 800,
  "one-thing": 3500,
  "today": 4000,
  "week": 3500,
  "review": 4500,
  "end": 3000,
};

export default function ReelPage() {
  const [scene, setScene] = useState<Scene>("triage");
  const [started, setStarted] = useState(false);
  const { setPalette } = usePalette();

  // Set palette to Dear Reader for the reel
  useEffect(() => {
    setPalette(palettes[1]); // Dear Reader
  }, [setPalette]);

  const fireConfetti = useCallback(() => {
    const colors = palettes[1].confetti;
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.5 }, colors });
    setTimeout(() => confetti({ particleCount: 50, spread: 90, origin: { y: 0.45, x: 0.4 }, colors }), 200);
    setTimeout(() => confetti({ particleCount: 40, spread: 80, origin: { y: 0.5, x: 0.6 }, colors }), 400);
  }, []);

  const advance = useCallback((from: Scene) => {
    const order: Scene[] = ["triage", "triage-pick", "one-thing", "today", "week", "review", "end"];
    const idx = order.indexOf(from);
    if (idx < order.length - 1) {
      const nextScene = order[idx + 1];
      setScene(nextScene);
      if (nextScene === "one-thing") {
        setTimeout(fireConfetti, 300);
      }
    }
  }, [fireConfetti]);

  // Auto-advance
  useEffect(() => {
    if (!started) return;
    const timer = setTimeout(() => advance(scene), TIMINGS[scene]);
    return () => clearTimeout(timer);
  }, [scene, started, advance]);

  const start = () => {
    setScene("triage");
    setStarted(true);
  };

  return (
    <main className="max-w-[430px] mx-auto min-h-screen relative overflow-hidden">
      <CollageBackground />
      <div className="relative z-[2] px-5 pt-7 pb-8 min-h-screen flex flex-col">

        {/* Not started - tap to begin */}
        {!started && (
          <button onClick={start} className="flex-1 flex flex-col items-center justify-center animate-fade-up">
            <h1 className="font-display text-3xl text-ink mb-3 text-center">Chief of Staff</h1>
            <p className="font-mono-upper text-[0.5rem] text-ink/30 tracking-widest mb-8">for creatives</p>
            <div className="font-mono-upper text-[0.5rem] text-ink/20 animate-pulse">tap to play</div>
          </button>
        )}

        {/* Scene: Triage */}
        {started && scene === "triage" && (
          <div className="animate-fade-up">
            <h2 className="font-display text-2xl text-ink mb-1">Focus</h2>
            <p className="font-mono-upper text-[0.5rem] text-ink/40 mb-8">Which would you do first?</p>
            <div className="space-y-3">
              <div className="glass rounded-2xl p-6">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full mt-1.5 bg-blue" />
                  <div>
                    <div className="text-[0.95rem] text-ink leading-snug mb-1">Film module 3 intro</div>
                    <span className="font-mono text-[0.48rem] text-ink/30">focus &middot; Launch my course</span>
                  </div>
                </div>
              </div>
              <div className="text-center"><span className="font-mono text-[0.5rem] text-ink/15 tracking-widest">or</span></div>
              <div className="glass rounded-2xl p-6">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full mt-1.5 bg-pink" />
                  <div>
                    <div className="text-[0.95rem] text-ink leading-snug mb-1">Write newsletter about burnout</div>
                    <span className="font-mono text-[0.48rem] text-ink/30">focus &middot; Grow newsletter to 10K</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Scene: Triage pick animation */}
        {started && scene === "triage-pick" && (
          <div className="animate-fade-up">
            <h2 className="font-display text-2xl text-ink mb-1">Focus</h2>
            <p className="font-mono-upper text-[0.5rem] text-ink/40 mb-8">Which would you do first?</p>
            <div className="space-y-3">
              <div className="glass rounded-2xl p-6 scale-[1.02] shadow-lg transition-all">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full mt-1.5 bg-blue" />
                  <div>
                    <div className="text-[0.95rem] text-ink leading-snug mb-1">Film module 3 intro</div>
                    <span className="font-mono text-[0.48rem] text-ink/30">focus &middot; Launch my course</span>
                  </div>
                </div>
              </div>
              <div className="text-center"><span className="font-mono text-[0.5rem] text-ink/15 tracking-widest">or</span></div>
              <div className="glass rounded-2xl p-6 opacity-30 scale-95 transition-all">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full mt-1.5 bg-pink" />
                  <div>
                    <div className="text-[0.95rem] text-ink leading-snug mb-1">Write newsletter about burnout</div>
                    <span className="font-mono text-[0.48rem] text-ink/30">focus &middot; Grow newsletter to 10K</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Scene: One Thing */}
        {started && scene === "one-thing" && (
          <div className="animate-fade-up">
            <h2 className="font-display text-2xl text-ink mb-1">Focus</h2>
            <p className="font-mono-upper text-[0.5rem] text-ink/40 mb-8">Your one thing for today</p>
            <div className="glass rounded-2xl p-8 text-center mb-4">
              <div className="font-mono-upper text-[0.45rem] text-pink mb-4 tracking-widest">Your one thing</div>
              <h3 className="font-display text-xl text-ink mb-3">Film module 3 intro</h3>
              <div className="flex items-center justify-center gap-2">
                <div className="w-[6px] h-[6px] rounded-full bg-blue" />
                <span className="font-mono text-[0.5rem] text-ink/35">focus &middot; Launch my course</span>
              </div>
            </div>
            <p className="font-display italic text-ink/30 text-[0.88rem] text-center">Do this first. Everything else can wait.</p>
          </div>
        )}

        {/* Scene: Today Timeline */}
        {started && scene === "today" && (
          <div className="animate-fade-up">
            <h2 className="font-display text-2xl text-ink mb-1">Today</h2>
            <p className="font-mono-upper text-[0.5rem] text-ink/40 mb-6">Thursday, March 27</p>

            <div className="glass rounded-2xl p-5 mb-4 border-l-[3px] border-l-pink">
              <div className="font-mono-upper text-[0.42rem] text-pink mb-2 tracking-widest">Your one thing</div>
              <div className="text-[0.95rem] text-ink leading-snug">Film module 3 intro</div>
            </div>

            <div className="glass rounded-2xl p-5">
              <div className="font-mono-upper text-[0.48rem] text-ink/30 mb-4">Your day</div>
              <div className="space-y-1">
                {/* 8 AM - task */}
                <div className="flex gap-3">
                  <div className="w-[48px] shrink-0 pt-2.5"><span className="font-mono text-[0.48rem] text-ink/20">8 AM</span></div>
                  <div className="flex-1 py-2 px-3">
                    <div className="flex items-start gap-2.5">
                      <div className="w-[16px] h-[16px] rounded-md border-[1.5px] border-ink/15 mt-0.5 shrink-0" />
                      <div className="text-[0.8rem] text-ink/75">Film module 3 intro</div>
                    </div>
                  </div>
                </div>
                {/* 9 AM - event */}
                <div className="flex gap-3">
                  <div className="w-[48px] shrink-0 pt-2.5"><span className="font-mono text-[0.48rem] text-ink/25">9:00 AM</span></div>
                  <div className="flex-1 rounded-lg px-3.5 py-2.5 border-l-[3px] border-l-blue" style={{ background: "var(--blue-pale)", opacity: 0.65, minHeight: 56 }}>
                    <div className="text-[0.8rem] text-ink/60">Content batching block</div>
                    <div className="font-mono text-[0.42rem] text-ink/20 mt-0.5">9:00 AM - 11:30 AM</div>
                  </div>
                </div>
                {/* 11:30 - task */}
                <div className="flex gap-3">
                  <div className="w-[48px] shrink-0 pt-2.5"><span className="font-mono text-[0.48rem] text-ink/20">11 AM</span></div>
                  <div className="flex-1 py-2 px-3">
                    <div className="flex items-start gap-2.5">
                      <div className="w-[16px] h-[16px] rounded-md border-[1.5px] border-ink/15 mt-0.5 shrink-0" />
                      <div className="text-[0.8rem] text-ink/75">Write newsletter about burnout</div>
                    </div>
                  </div>
                </div>
                {/* 12 PM - event */}
                <div className="flex gap-3">
                  <div className="w-[48px] shrink-0 pt-2.5"><span className="font-mono text-[0.48rem] text-ink/25">12:00</span></div>
                  <div className="flex-1 rounded-lg px-3.5 py-2.5 border-l-[3px] border-l-blue" style={{ background: "var(--blue-pale)", opacity: 0.65, minHeight: 36 }}>
                    <div className="text-[0.8rem] text-ink/60">Client call - Sarah</div>
                    <div className="font-mono text-[0.42rem] text-ink/20 mt-0.5">12:00 - 12:45 PM</div>
                  </div>
                </div>
                {/* 2 PM - event */}
                <div className="flex gap-3">
                  <div className="w-[48px] shrink-0 pt-2.5"><span className="font-mono text-[0.48rem] text-ink/25">2:00 PM</span></div>
                  <div className="flex-1 rounded-lg px-3.5 py-2.5 border-l-[3px] border-l-blue" style={{ background: "var(--blue-pale)", opacity: 0.65, minHeight: 64 }}>
                    <div className="text-[0.8rem] text-ink/60">Coworking with Jess</div>
                    <div className="font-mono text-[0.42rem] text-ink/20 mt-0.5">2:00 - 5:00 PM</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Scene: Week View */}
        {started && scene === "week" && (
          <div className="animate-fade-up">
            <div className="flex items-baseline justify-between mb-1">
              <h2 className="font-display text-2xl text-ink">This Week</h2>
              <span className="font-mono-upper text-[0.48rem] text-ink/35">Mar 22 - 28</span>
            </div>
            <div className="glass rounded-lg px-4 py-2.5 mb-6 mt-2 border-l-[3px] border-l-blue">
              <span className="font-display italic text-[0.88rem] text-ink/45">&ldquo;This is the week I finish module 3.&rdquo;</span>
            </div>

            <div className="flex gap-1.5 items-end h-20 mb-6">
              {weekData.map((d, i) => (
                <div key={i} className={`flex-1 flex flex-col items-center gap-1.5 ${i < 2 ? "opacity-30" : ""}`}>
                  <div className="w-full flex flex-col justify-end items-center h-[52px]">
                    <div className={`w-full rounded-t-lg rounded-b-sm ${barColor(d.items)} ${barHeight(d.items)} transition-all ${d.isToday ? "shadow-md" : ""}`} />
                  </div>
                  <span className={`font-mono text-[0.52rem] uppercase tracking-widest ${d.isToday ? "text-ink font-medium" : "text-ink/30"}`}>{d.day}</span>
                  {d.isToday && <div className="w-1 h-1 rounded-full bg-blue -mt-1" />}
                </div>
              ))}
            </div>

            <div className="glass rounded-2xl p-5">
              <div className="flex items-baseline justify-between mb-4">
                <h3 className="font-display text-lg text-ink">Thursday, March 27</h3>
                <span className="font-mono-upper text-[0.45rem] px-2 py-1 rounded-md bg-pink/15 text-pink">packed</span>
              </div>
              <div className="space-y-2">
                {todayTasks.map((t, i) => (
                  <div key={i} className="flex items-start gap-2.5 py-1.5">
                    <div className={`w-[7px] h-[7px] rounded-full mt-1.5 shrink-0 ${typeDot[t.type] || "bg-ink/15"}`} />
                    <div>
                      <div className="text-[0.85rem] text-ink leading-snug">{t.title}</div>
                      {t.aim && <div className="font-mono text-[0.45rem] text-ink/30 tracking-wide mt-0.5">{t.aim}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Scene: Weekly Review */}
        {started && scene === "review" && (
          <div className="animate-fade-up">
            <p className="font-mono-upper text-[0.48rem] text-pink mb-4 tracking-widest">Weekly review</p>
            <h2 className="font-display text-[1.6rem] text-ink leading-snug mb-8">Solid progress. Not everything, but enough.</h2>

            <div className="text-center mb-8">
              <div className="inline-flex items-baseline gap-1">
                <span className="font-display text-[2.5rem] text-ink">9</span>
                <span className="font-display text-[1.2rem] text-ink/20">/ 14</span>
              </div>
              <div className="font-mono-upper text-[0.45rem] text-ink/25 tracking-widest mt-1">tasks completed</div>
            </div>

            <div className="glass rounded-2xl p-5 mb-4">
              <div className="font-mono-upper text-[0.45rem] text-ink/25 mb-5 tracking-widest">By aim</div>
              <div className="space-y-5">
                {[
                  { name: "Launch my course", done: 4, total: 5, color: "var(--blue)" },
                  { name: "Grow newsletter to 10K", done: 3, total: 5, color: "var(--pink)" },
                  { name: "Move to Spain", done: 2, total: 4, color: "var(--blue-light)" },
                ].map((aim) => (
                  <div key={aim.name}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[0.85rem] text-ink/70">{aim.name}</span>
                      <span className="font-mono text-[0.5rem] text-ink/25">{aim.done}/{aim.total}</span>
                    </div>
                    <div className="w-full h-[3px] rounded-full bg-ink/[0.04] overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${(aim.done / aim.total) * 100}%`, background: aim.color, opacity: 0.6 }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Scene: End */}
        {started && scene === "end" && (
          <div className="flex-1 flex flex-col items-center justify-center animate-fade-up">
            <h2 className="font-display text-2xl text-ink mb-2 text-center">Your chief of staff.</h2>
            <p className="font-display italic text-ink/35 text-[0.95rem] text-center mb-6">Built for how creatives actually work.</p>
            <div className="font-mono-upper text-[0.48rem] text-ink/25 tracking-widest">Coming soon</div>
          </div>
        )}

        {/* Replay button (visible on end scene) */}
        {started && scene === "end" && (
          <button
            onClick={() => { setStarted(false); setScene("triage"); }}
            className="font-mono-upper text-[0.48rem] text-ink/20 tracking-widest text-center pb-8 hover:text-ink/40 transition-colors"
          >
            replay
          </button>
        )}
      </div>
    </main>
  );
}
