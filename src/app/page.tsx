"use client";

import { useState } from "react";
import CollageBackground from "@/components/CollageBackground";
import BottomNav, { TabId } from "@/components/BottomNav";
import Onboarding, { ParsedTask } from "@/components/Onboarding";
import FocusScreen from "@/components/FocusScreen";
import TodayScreen from "@/components/TodayScreen";
import WeekScreen from "@/components/WeekScreen";
import AimsScreen from "@/components/AimsScreen";

export default function Home() {
  const [onboarded, setOnboarded] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("focus");
  const [tasks, setTasks] = useState<ParsedTask[]>([]);
  const [aims, setAims] = useState<string[]>([]);
  const [milestones, setMilestones] = useState<Record<string, string>>({});
  const [completedAims, setCompletedAims] = useState<Set<string>>(new Set());
  const [oneThing, setOneThing] = useState<ParsedTask | null>(null);
  const [weekIntention, setWeekIntention] = useState("");

  if (!onboarded) {
    return (
      <main className="max-w-[430px] mx-auto min-h-screen relative overflow-hidden">
        <CollageBackground />
        <Onboarding
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

  const addTask = (task: ParsedTask) => {
    setTasks((prev) => [...prev, task]);
  };

  const linkTaskToAim = (taskIndex: number, aim: string | null) => {
    setTasks((prev) =>
      prev.map((t, i) => (i === taskIndex ? { ...t, aim } : t))
    );
  };

  const updateAim = (index: number, newName: string) => {
    if (!newName.trim()) return;
    const oldName = aims[index];
    setAims((prev) => prev.map((a, i) => (i === index ? newName.trim() : a)));
    // Update tasks that reference the old aim name
    setTasks((prev) =>
      prev.map((t) =>
        t.aim && t.aim.toLowerCase() === oldName.toLowerCase()
          ? { ...t, aim: newName.trim() }
          : t
      )
    );
    // Update milestones
    if (milestones[oldName]) {
      setMilestones((prev) => {
        const next = { ...prev };
        next[newName.trim()] = next[oldName];
        delete next[oldName];
        return next;
      });
    }
  };

  const updateMilestone = (aim: string, milestone: string) => {
    setMilestones((prev) => ({ ...prev, [aim]: milestone }));
  };

  const addAim = (name: string) => {
    if (aims.length < 5) {
      setAims((prev) => [...prev, name]);
    }
  };

  const completeAim = (aim: string) => {
    setCompletedAims((prev) => { const next = new Set(prev); next.add(aim); return next; });
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
            onUpdateAim={updateAim}
            onUpdateMilestone={updateMilestone}
            onAddAim={addAim}
            onCompleteAim={completeAim}
          />
        )}
      </div>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </main>
  );
}
