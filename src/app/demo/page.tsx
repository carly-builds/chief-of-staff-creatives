"use client";

import { useState } from "react";
import CollageBackground from "@/components/CollageBackground";
import BottomNav, { TabId } from "@/components/BottomNav";
import { ParsedTask, CalendarEvent } from "@/components/Onboarding";
import Onboarding from "@/components/Onboarding";
import FocusScreen from "@/components/FocusScreen";
import TodayScreen from "@/components/TodayScreen";
import WeekScreen from "@/components/WeekScreen";
import AimsScreen from "@/components/AimsScreen";
import WeeklyReview from "@/components/WeeklyReview";

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

function buildDemoEvents() {
  const dates = getWeekDates();
  const today = new Date().toISOString().split("T")[0];
  const todayIdx = dates.indexOf(today);
  const d = (offset: number) => dates[Math.max(0, Math.min(6, todayIdx + offset))];

  const events: CalendarEvent[] = [
    { title: "Content batching block", time: "9:00 AM", endTime: "11:30 AM", day: d(0) },
    { title: "Client call - Sarah", time: "12:00 PM", endTime: "12:45 PM", day: d(0) },
    { title: "Coworking with Jess", time: "2:00 PM", endTime: "5:00 PM", day: d(0) },
    { title: "Gym", time: "7:00 AM", endTime: "8:00 AM", day: d(1) },
    { title: "Discovery call - Loom", time: "11:00 AM", endTime: "11:30 AM", day: d(1) },
    { title: "Video editing block", time: "1:00 PM", endTime: "4:00 PM", day: d(1) },
    { title: "Writing block", time: "9:00 AM", endTime: "12:00 PM", day: d(2) },
    { title: "Lunch with Alex", time: "12:30 PM", endTime: "1:30 PM", day: d(2) },
    { title: "Filming block", time: "10:00 AM", endTime: "2:00 PM", day: d(3) },
    { title: "Therapy", time: "4:00 PM", endTime: "5:00 PM", day: d(3) },
    { title: "Mentor session", time: "11:00 AM", endTime: "12:00 PM", day: d(4) },
    { title: "Free afternoon", time: "1:00 PM", endTime: "5:00 PM", day: d(4) },
  ];

  return events;
}

export default function DemoPage() {
  const [onboarded, setOnboarded] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("focus");
  const [tasks, setTasks] = useState<ParsedTask[]>([]);
  const [aims, setAims] = useState<string[]>([]);
  const [milestones, setMilestones] = useState<Record<string, string>>({});
  const [events] = useState(buildDemoEvents);
  const [completedAims] = useState<Set<string>>(new Set());
  const [completedTasks] = useState<Set<string>>(new Set());
  const [oneThing, setOneThing] = useState<ParsedTask | null>(null);
  const [weekIntention, setWeekIntention] = useState("");
  const [showReview, setShowReview] = useState(false);

  if (!onboarded) {
    return (
      <main className="max-w-[430px] mx-auto min-h-screen relative overflow-hidden">
        <CollageBackground />
        <Onboarding
          skipCalendarStep
          onComplete={(data) => {
            setTasks(data.parsedTasks);
            setAims(data.aims);
            setMilestones(data.milestones);
            setOnboarded(true);
            setActiveTab("focus");
          }}
        />
      </main>
    );
  }

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
            onOpenReview={() => setShowReview(true)}
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

      {showReview && (
        <WeeklyReview
          tasks={tasks}
          completedTasks={completedTasks}
          aims={aims}
          weekIntention={weekIntention}
          onClose={() => setShowReview(false)}
          onSetNextIntention={(val) => setWeekIntention(val)}
        />
      )}
    </main>
  );
}
