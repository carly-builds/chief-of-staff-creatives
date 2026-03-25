"use client";

import { useState, useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import { ParsedTask } from "./Onboarding";

const typeDot: Record<string, string> = {
  focus: "bg-blue",
  flow: "bg-pink",
  admin: "bg-ink/20",
};

// Shuffle array for bracket seeding
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function FocusScreen({
  tasks,
  oneThing,
  onComplete,
  onReset,
}: {
  tasks: ParsedTask[];
  oneThing: ParsedTask | null;
  onComplete: (winner: ParsedTask) => void;
  onReset: () => void;
}) {
  const [bracket, setBracket] = useState<ParsedTask[]>([]);
  const [round, setRound] = useState(0);
  const [matchIndex, setMatchIndex] = useState(0);
  const [winners, setWinners] = useState<ParsedTask[]>([]);
  const [animDir, setAnimDir] = useState<"left" | "right" | null>(null);
  const [started, setStarted] = useState(false);

  // Initialize bracket
  useEffect(() => {
    if (tasks.length > 0 && !started && !oneThing) {
      setBracket(shuffle(tasks));
    }
  }, [tasks, started, oneThing]);

  const startTriage = () => {
    setBracket(shuffle(tasks));
    setRound(0);
    setMatchIndex(0);
    setWinners([]);
    setStarted(true);
  };

  const currentPair = started
    ? [bracket[matchIndex * 2], bracket[matchIndex * 2 + 1]]
    : [null, null];

  const pick = (chosen: ParsedTask, direction: "left" | "right") => {
    setAnimDir(direction);
    const newWinners = [...winners, chosen];

    setTimeout(() => {
      setAnimDir(null);
      const nextMatch = matchIndex + 1;
      const totalMatches = Math.floor(bracket.length / 2);

      if (nextMatch < totalMatches) {
        // More matches in this round
        setMatchIndex(nextMatch);
        setWinners(newWinners);
      } else {
        // Handle odd one out (bye)
        let roundWinners = [...newWinners];
        if (bracket.length % 2 === 1) {
          roundWinners.push(bracket[bracket.length - 1]);
        }

        if (roundWinners.length === 1) {
          // We have a winner!
          onComplete(roundWinners[0]);
          setStarted(false);
        } else {
          // Next round
          setBracket(roundWinners);
          setRound((r) => r + 1);
          setMatchIndex(0);
          setWinners([]);
        }
      }
    }, 350);
  };

  // Fire confetti when one thing is found
  const confettiFired = useRef(false);
  useEffect(() => {
    if (oneThing && !confettiFired.current) {
      confettiFired.current = true;
      // First burst
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#f2b8c6", "#9dcde3", "#f8d5de", "#c5e3ee", "#dceef5"],
      });
      // Second burst slightly delayed
      setTimeout(() => {
        confetti({
          particleCount: 50,
          spread: 90,
          origin: { y: 0.5, x: 0.4 },
          colors: ["#f2b8c6", "#9dcde3", "#f8d5de", "#c5e3ee"],
        });
      }, 200);
      setTimeout(() => {
        confetti({
          particleCount: 40,
          spread: 80,
          origin: { y: 0.55, x: 0.6 },
          colors: ["#f2b8c6", "#9dcde3", "#dceef5"],
        });
      }, 400);
    }
    if (!oneThing) {
      confettiFired.current = false;
    }
  }, [oneThing]);

  // === ONE THING FOUND ===
  if (oneThing) {
    return (
      <div className="animate-fade-up">
        <h2 className="font-display text-2xl text-ink mb-1">Focus</h2>
        <p className="font-mono-upper text-[0.5rem] text-ink/40 mb-8">
          Your one thing for today
        </p>

        <div className="glass rounded-2xl p-8 text-center mb-4">
          <div className="font-mono-upper text-[0.45rem] text-pink mb-4 tracking-widest">
            Your one thing
          </div>
          <h3 className="font-display text-xl text-ink mb-3 leading-snug">
            {oneThing.title}
          </h3>
          <div className="flex items-center justify-center gap-2">
            <div className={`w-[6px] h-[6px] rounded-full ${typeDot[oneThing.type] || "bg-ink/20"}`} />
            <span className="font-mono text-[0.5rem] text-ink/35 tracking-wide">
              {oneThing.type}
            </span>
            {oneThing.aim && (
              <>
                <span className="text-ink/15">&middot;</span>
                <span className="font-mono text-[0.5rem] text-ink/35 tracking-wide">
                  {oneThing.aim}
                </span>
              </>
            )}
          </div>
        </div>

        <p className="font-display italic text-ink/30 text-[0.88rem] text-center mb-6">
          Do this first. Everything else can wait.
        </p>

        <button
          onClick={onReset}
          className="font-mono-upper text-[0.5rem] text-ink/30 hover:text-ink/50 transition-colors block mx-auto"
        >
          re-triage
        </button>
      </div>
    );
  }

  // === NOT ENOUGH TASKS ===
  if (tasks.length === 0) {
    return (
      <div className="animate-fade-up">
        <h2 className="font-display text-2xl text-ink mb-1">Focus</h2>
        <p className="font-mono-upper text-[0.5rem] text-ink/40 mb-6">
          Find your one thing
        </p>
        <div className="glass rounded-2xl p-8 text-center">
          <p className="font-display italic text-ink/25 text-base mb-2">
            No tasks for today yet.
          </p>
          <p className="text-[0.8rem] text-ink/30">
            Add tasks to today and come back to find your focus.
          </p>
        </div>
      </div>
    );
  }

  if (tasks.length === 1) {
    return (
      <div className="animate-fade-up">
        <h2 className="font-display text-2xl text-ink mb-1">Focus</h2>
        <p className="font-mono-upper text-[0.5rem] text-ink/40 mb-8">
          Your one thing for today
        </p>
        <div className="glass rounded-2xl p-8 text-center">
          <div className="font-mono-upper text-[0.45rem] text-pink mb-4 tracking-widest">
            Your one thing
          </div>
          <h3 className="font-display text-xl text-ink mb-3 leading-snug">
            {tasks[0].title}
          </h3>
          <p className="font-display italic text-ink/30 text-[0.88rem]">
            Only one thing on your plate. Go get it.
          </p>
        </div>
      </div>
    );
  }

  // === PRE-TRIAGE ===
  if (!started) {
    return (
      <div className="animate-fade-up">
        <h2 className="font-display text-2xl text-ink mb-1">Focus</h2>
        <p className="font-mono-upper text-[0.5rem] text-ink/40 mb-8">
          Find your one thing
        </p>

        <div className="glass rounded-2xl p-8 text-center">
          <h3 className="font-display text-lg text-ink mb-3">
            You have {tasks.length} things to do today.
          </h3>
          <p className="text-[0.85rem] text-ink/40 mb-6 leading-relaxed">
            Let&apos;s figure out which one matters most.
            I&apos;ll show you two at a time. Pick the one you&apos;d do first.
          </p>
          <button
            onClick={startTriage}
            className="font-mono-upper text-[0.6rem] bg-ink text-white px-9 py-3.5 rounded-xl transition-opacity hover:opacity-85"
          >
            start triage
          </button>
        </div>
      </div>
    );
  }

  // === TRIAGE IN PROGRESS ===
  const totalInRound = Math.floor(bracket.length / 2);
  const progress = `${matchIndex + 1} of ${totalInRound}`;

  return (
    <div className="animate-fade-up">
      <h2 className="font-display text-2xl text-ink mb-1">Focus</h2>
      <div className="flex items-center justify-between mb-8">
        <p className="font-mono-upper text-[0.5rem] text-ink/40">
          Which would you do first?
        </p>
        <p className="font-mono text-[0.48rem] text-ink/25 tracking-wide">
          {progress}
        </p>
      </div>

      <div className="space-y-3">
        {/* Option A (left) */}
        {currentPair[0] && (
          <button
            onClick={() => pick(currentPair[0]!, "left")}
            className={`glass rounded-2xl p-6 w-full text-left transition-all active:scale-[0.98] ${
              animDir === "left"
                ? "animate-slide-left opacity-100"
                : animDir === "right"
                ? "opacity-30 scale-95 transition-all duration-300"
                : "animate-fade-in"
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${typeDot[currentPair[0].type] || "bg-ink/20"}`} />
              <div>
                <div className="text-[0.95rem] text-ink leading-snug mb-1">
                  {currentPair[0].title}
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[0.48rem] text-ink/30 tracking-wide">
                    {currentPair[0].type}
                  </span>
                  {currentPair[0].aim && (
                    <>
                      <span className="text-ink/15">&middot;</span>
                      <span className="font-mono text-[0.48rem] text-ink/30 tracking-wide">
                        {currentPair[0].aim}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </button>
        )}

        {/* VS divider */}
        <div className="text-center">
          <span className="font-mono text-[0.5rem] text-ink/15 tracking-widest">or</span>
        </div>

        {/* Option B (right) */}
        {currentPair[1] && (
          <button
            onClick={() => pick(currentPair[1]!, "right")}
            className={`glass rounded-2xl p-6 w-full text-left transition-all active:scale-[0.98] ${
              animDir === "right"
                ? "animate-slide-right opacity-100"
                : animDir === "left"
                ? "opacity-30 scale-95 transition-all duration-300"
                : "animate-fade-in"
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${typeDot[currentPair[1].type] || "bg-ink/20"}`} />
              <div>
                <div className="text-[0.95rem] text-ink leading-snug mb-1">
                  {currentPair[1].title}
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[0.48rem] text-ink/30 tracking-wide">
                    {currentPair[1].type}
                  </span>
                  {currentPair[1].aim && (
                    <>
                      <span className="text-ink/15">&middot;</span>
                      <span className="font-mono text-[0.48rem] text-ink/30 tracking-wide">
                        {currentPair[1].aim}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </button>
        )}
      </div>
    </div>
  );
}
