"use client";

import { useState } from "react";
import CollageBackground from "@/components/CollageBackground";
import BottomNav, { TabId } from "@/components/BottomNav";
import { ParsedTask } from "@/components/Onboarding";
import FocusScreen from "@/components/FocusScreen";
import TodayScreen from "@/components/TodayScreen";
import WeekScreen from "@/components/WeekScreen";
import AimsScreen from "@/components/AimsScreen";

// Build this week's dates (Sun - Sat)
function getWeekDates() {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const sunday = new Date(today);
  sunday.setDate(today.getDate() - dayOfWeek);
  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(sunday);
    d.setDate(sunday.getDate() + i);
    dates.push(d.toISOString().split("T")[0]);
  }
  return dates;
}

function buildDemoData() {
  const dates = getWeekDates();
  const today = new Date().toISOString().split("T")[0];
  const todayIdx = dates.indexOf(today);

  // Spread tasks across the week relative to today
  const d = (offset: number) => dates[Math.max(0, Math.min(6, todayIdx + offset))];

  const aims = [
    "Finish my EP",
    "Launch Substack",
    "Book 5 freelance clients",
  ];

  const milestones: Record<string, string> = {
    "Finish my EP": "Mix and master 4 tracks by end of month",
    "Launch Substack": "First 3 posts written, landing page live",
    "Book 5 freelance clients": "Send 10 cold emails, 3 discovery calls booked",
  };

  const tasks: ParsedTask[] = [
    // Today
    { title: "Record vocals for track 3", day: d(0), aim: "Finish my EP", type: "focus" },
    { title: "Write Substack post #2", day: d(0), aim: "Launch Substack", type: "focus" },
    { title: "Reply to Maia about collab", day: d(0), aim: null, type: "flow" },
    { title: "Send invoice to Blue Room Studio", day: d(0), aim: null, type: "admin" },

    // Tomorrow
    { title: "Mix track 1 with Jake", day: d(1), aim: "Finish my EP", type: "focus" },
    { title: "Design Substack landing page", day: d(1), aim: "Launch Substack", type: "flow" },
    { title: "Cold email 5 potential clients", day: d(1), aim: "Book 5 freelance clients", type: "focus" },

    // Day after
    { title: "Studio session - track 4 drums", day: d(2), aim: "Finish my EP", type: "focus" },
    { title: "Post Instagram reel from session", day: d(2), aim: null, type: "flow" },
    { title: "Discovery call with Nora", day: d(2), aim: "Book 5 freelance clients", type: "flow" },

    // 3 days out
    { title: "Write Substack post #3", day: d(3), aim: "Launch Substack", type: "focus" },
    { title: "Follow up with Sarah re: collab", day: d(3), aim: null, type: "admin" },

    // 4 days out
    { title: "Review final mix - tracks 1 & 2", day: d(4), aim: "Finish my EP", type: "focus" },
    { title: "Send proposal to Loom Studio", day: d(4), aim: "Book 5 freelance clients", type: "flow" },

    // Yesterday (past)
    { title: "Brainstorm EP artwork", day: d(-1), aim: "Finish my EP", type: "flow" },
    { title: "Set up Substack account", day: d(-1), aim: "Launch Substack", type: "admin" },
  ];

  return { aims, milestones, tasks };
}

export default function DemoPage() {
  const demo = buildDemoData();
  const [activeTab, setActiveTab] = useState<TabId>("focus");
  const [tasks, setTasks] = useState<ParsedTask[]>(demo.tasks);
  const [aims] = useState(demo.aims);
  const [milestones] = useState(demo.milestones);
  const [completedAims] = useState<Set<string>>(new Set());
  const [oneThing, setOneThing] = useState<ParsedTask | null>(null);
  const [weekIntention, setWeekIntention] = useState("This is the week I finish tracking vocals.");

  const today = new Date().toISOString().split("T")[0];
  const todayTasks = tasks.filter((t) => t.day === today);

  const addTask = (task: ParsedTask) => setTasks((prev) => [...prev, task]);
  const linkTaskToAim = (taskIndex: number, aim: string | null) => {
    setTasks((prev) => prev.map((t, i) => (i === taskIndex ? { ...t, aim } : t)));
  };

  return (
    <main className="max-w-[430px] mx-auto min-h-screen relative overflow-hidden">
      <CollageBackground />
      <div className="relative z-[2] px-5 pt-7 pb-28">
        {activeTab === "focus" && (
          <FocusScreen
            tasks={todayTasks}
            oneThing={oneThing}
            onComplete={(winner) => setOneThing(winner)}
            onReset={() => setOneThing(null)}
          />
        )}

        {activeTab === "today" && (
          <TodayScreen
            tasks={todayTasks}
            oneThing={oneThing}
            aims={aims}
            onAddTask={addTask}
          />
        )}

        {activeTab === "week" && (
          <WeekScreen
            tasks={tasks}
            aims={aims}
            weekIntention={weekIntention}
            onSetIntention={setWeekIntention}
            onAddTask={addTask}
            onLinkTaskToAim={linkTaskToAim}
          />
        )}

        {activeTab === "aims" && (
          <AimsScreen
            aims={aims}
            milestones={milestones}
            tasks={tasks}
            completedAims={completedAims}
            onUpdateAim={() => {}}
            onUpdateMilestone={() => {}}
            onAddAim={() => {}}
            onCompleteAim={() => {}}
          />
        )}
      </div>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </main>
  );
}
