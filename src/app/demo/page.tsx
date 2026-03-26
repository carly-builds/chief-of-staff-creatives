"use client";

import { useState } from "react";
import CollageBackground from "@/components/CollageBackground";
import BottomNav, { TabId } from "@/components/BottomNav";
import { ParsedTask, CalendarEvent } from "@/components/Onboarding";
import FocusScreen from "@/components/FocusScreen";
import TodayScreen from "@/components/TodayScreen";
import WeekScreen from "@/components/WeekScreen";
import AimsScreen from "@/components/AimsScreen";

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
  const d = (offset: number) => dates[Math.max(0, Math.min(6, todayIdx + offset))];

  const aims = ["Launch the course", "Grow newsletter to 2K", "Land 3 brand deals"];

  const milestones: Record<string, string> = {
    "Launch the course": "Sales page live, 3 modules filmed, email sequence written",
    "Grow newsletter to 2K": "Post weekly, optimize signup page, 2 collabs",
    "Land 3 brand deals": "Pitch 10 brands, media kit updated, 1 signed",
  };

  const tasks: ParsedTask[] = [
    // Today
    { title: "Film module 2 intro", day: d(0), aim: "Launch the course", type: "focus" },
    { title: "Write this week's newsletter", day: d(0), aim: "Grow newsletter to 2K", type: "focus" },
    { title: "Reply to brand pitch from Notion", day: d(0), aim: "Land 3 brand deals", type: "flow" },
    { title: "Send overdue invoices", day: d(0), aim: null, type: "admin" },
    // Tomorrow
    { title: "Edit module 1 video", day: d(1), aim: "Launch the course", type: "focus" },
    { title: "Design newsletter signup page", day: d(1), aim: "Grow newsletter to 2K", type: "flow" },
    { title: "Prep for discovery call with Loom", day: d(1), aim: "Land 3 brand deals", type: "flow" },
    // Day after
    { title: "Write course sales page copy", day: d(2), aim: "Launch the course", type: "focus" },
    { title: "Instagram carousel - 5 tips post", day: d(2), aim: "Grow newsletter to 2K", type: "flow" },
    { title: "Follow up with Canva partnership", day: d(2), aim: "Land 3 brand deals", type: "admin" },
    // 3 days out
    { title: "Film module 3", day: d(3), aim: "Launch the course", type: "focus" },
    { title: "Reach out to 3 newsletter collabs", day: d(3), aim: "Grow newsletter to 2K", type: "flow" },
    // 4 days out
    { title: "Review sales page with mentor", day: d(4), aim: "Launch the course", type: "focus" },
    { title: "Update media kit with new stats", day: d(4), aim: "Land 3 brand deals", type: "admin" },
    // Yesterday (past)
    { title: "Outline module 2 content", day: d(-1), aim: "Launch the course", type: "focus" },
    { title: "Schedule newsletter for next week", day: d(-1), aim: "Grow newsletter to 2K", type: "admin" },
  ];

  const events: CalendarEvent[] = [
    // Today
    { title: "Content batching block", time: "9:00 AM", endTime: "11:30 AM", day: d(0) },
    { title: "Client call - Sarah", time: "12:00 PM", endTime: "12:45 PM", day: d(0) },
    { title: "Coworking with Jess", time: "2:00 PM", endTime: "5:00 PM", day: d(0) },
    // Tomorrow
    { title: "Gym", time: "7:00 AM", endTime: "8:00 AM", day: d(1) },
    { title: "Discovery call - Loom", time: "11:00 AM", endTime: "11:30 AM", day: d(1) },
    { title: "Video editing block", time: "1:00 PM", endTime: "4:00 PM", day: d(1) },
    // Day after
    { title: "Writing block", time: "9:00 AM", endTime: "12:00 PM", day: d(2) },
    { title: "Lunch with Alex", time: "12:30 PM", endTime: "1:30 PM", day: d(2) },
    // 3 days out
    { title: "Filming block", time: "10:00 AM", endTime: "2:00 PM", day: d(3) },
    { title: "Therapy", time: "4:00 PM", endTime: "5:00 PM", day: d(3) },
    // 4 days out
    { title: "Mentor session", time: "11:00 AM", endTime: "12:00 PM", day: d(4) },
    { title: "Free afternoon", time: "1:00 PM", endTime: "5:00 PM", day: d(4) },
  ];

  return { aims, milestones, tasks, events };
}

export default function DemoPage() {
  const demo = buildDemoData();
  const [activeTab, setActiveTab] = useState<TabId>("focus");
  const [tasks, setTasks] = useState<ParsedTask[]>(demo.tasks);
  const [aims] = useState(demo.aims);
  const [milestones] = useState(demo.milestones);
  const [events] = useState(demo.events);
  const [completedAims] = useState<Set<string>>(new Set());
  const [oneThing, setOneThing] = useState<ParsedTask | null>(null);
  const [weekIntention, setWeekIntention] = useState("This is the week I finish module 2 and get the sales page up.");

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
            events={events}
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
