"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Brain,
  Calendar,
  Activity,
  Sun,
  Moon,
  Heart,
  Trophy,
  Bell,
  AlertCircle,
  PhoneCall,
  Sparkles,
  MessageSquare,
  BrainCircuit,
  ArrowRight,
  X,
  Loader2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils";

import { MoodForm } from "@/components/mood/mood-form";
import { AnxietyGames } from "@/components/games/anxiety-games";

import {
  getUserActivities,
  saveMoodData,
  logActivity,
} from "@/lib/static-dashboard-data";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useRouter, useSearchParams } from "next/navigation";
import {
  addDays,
  format,
  subDays,
  startOfDay,
  isWithinInterval,
} from "date-fns";

import { ActivityLogger } from "@/components/activities/activity-logger";
import { useSession } from "@/lib/contexts/session-context";
import { getAllChatSessions } from "@/lib/api/chat";

// Add this type definition
type ActivityLevel = "none" | "low" | "medium" | "high";

interface DayActivity {
  date: Date;
  level: ActivityLevel;
  activities: {
    type: string;
    name: string;
    completed: boolean;
    time?: string;
  }[];
}

// Add this interface near the top with other interfaces
interface Activity {
  id: string;
  userId: string | null;
  type: string;
  name: string;
  description: string | null;
  timestamp: Date;
  duration: number | null;
  completed: boolean;
  moodScore: number | null;
  moodNote: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Add this interface for stats
interface DailyStats {
  moodScore: number | null;
  completionRate: number;
  mindfulnessCount: number;
  totalActivities: number;
  lastUpdated: Date;
}



// Update the calculateDailyStats function to show correct stats
const calculateDailyStats = async (activities: Activity[]): Promise<DailyStats> => {
  const today = startOfDay(new Date());
  const todaysActivities = activities.filter((activity) =>
    isWithinInterval(new Date(activity.timestamp), {
      start: today,
      end: addDays(today, 1),
    })
  );

  // Calculate REAL completion rate

const completedActivities = todaysActivities.filter(a => 
  a.completed === true // Add other possible completion indicators
);
// In calculateDailyStats function, replace the completion calculation:

const completionRate = todaysActivities.length > 0 ? 100 : 0;

console.log("Auto-completion: All", todaysActivities.length, "activities marked as completed");

console.log("Completion calculation:", {
  total: todaysActivities.length,
  completed: completedActivities.length,
  rate: completionRate
});

  // Fetch today's mood from API

// Fetch today's mood from API
let moodScore = null;
try {
  const token = localStorage.getItem("token");
  const moodResponse = await fetch(
    "https://ai-therepist-agent-backend-api.onrender.com/api/mood/today",
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
    }
  );

  if (moodResponse.ok) {
    const moodData = await moodResponse.json();
    console.log("Today's mood data:", moodData);
    
    // FIX: Handle array response - get the first mood entry
    if (Array.isArray(moodData) && moodData.length > 0) {
      moodScore = moodData[0].score; // Get score from first item in array
      console.log("Found mood score:", moodScore);
    } else if (moodData && typeof moodData.score === 'number') {
      // Fallback for single object response
      moodScore = moodData.score;
    } else {
      console.log("No valid mood score found");
      moodScore = null;
    }
  } else {
    console.log("Mood API response not OK:", moodResponse.status);
  }
} catch (error) {
  console.error("Error fetching mood data:", error);
}

  // Count therapy sessions
  const therapySessions = activities.filter((a) => a.type === "therapy").length;

  return {
    moodScore: moodScore,
    completionRate: completionRate, // Use calculated value
    mindfulnessCount: therapySessions,
    totalActivities: todaysActivities.length,
    lastUpdated: new Date(),
  };
};

// Rename the function

const generateInsights = (activities: Activity[], dailyStats: DailyStats) => {
  console.log("Generating insights with:", { activities, dailyStats });
  
  const insights: {
    title: string;
    description: string;
    icon: any;
    priority: "low" | "medium" | "high";
  }[] = [];

  // ALWAYS show at least one insight for debugging
  insights.push({
    title: "Welcome to Your Wellness Journey",
    description: "Start by tracking your mood or trying a therapy session to receive personalized insights.",
    icon: Sparkles,
    priority: "medium",
  });

  // Mood insight
  if (dailyStats.moodScore === null || dailyStats.moodScore === undefined) {
    insights.push({
      title: "Track Your First Mood",
      description: "Log your mood today to get personalized insights and track your emotional wellbeing.",
      icon: Brain,
      priority: "high",
    });
  } else if (dailyStats.moodScore < 50) {
    insights.push({
      title: "Mood Support Available",
      description: "Your mood could use some support. Try a calming activity or therapy session.",
      icon: Heart,
      priority: "high",
    });
  }

  // Activity insight
  if (dailyStats.totalActivities === 0) {
    insights.push({
      title: "Start with Activities",
      description: "Try logging your first activity to build healthy habits and track your progress.",
      icon: Activity,
      priority: "medium",
    });
  }

  if (dailyStats.mindfulnessCount > 0) {
    insights.push({
      title: "Therapy Progress",
      description: `You've completed ${dailyStats.mindfulnessCount} therapy sessions! That's great consistency.`,
      icon: Trophy,
      priority: "high",
    });
  }

  // Add insight about activities
  if (dailyStats.totalActivities > 0 && dailyStats.completionRate === 0) {
    insights.push({
      title: "Complete Your Activities",
      description: `You have ${dailyStats.totalActivities} activities planned. Try completing one to boost your progress!`,
      icon: Activity,
      priority: "medium",
    });
  }

  // Return top 3 insights
  return insights.slice(0, 3);
};
export default function Dashboard() {
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const router = useRouter();
  const { user } = useSession();

  // Rename the state variable
  const [insights, setInsights] = useState<
    {
      title: string;
      description: string;
      icon: any;
      priority: "low" | "medium" | "high";
    }[]
  >([]);

  // New states for activities and wearables
  const [activities, setActivities] = useState<Activity[]>([]);
  const [showMoodModal, setShowMoodModal] = useState(false);
  const [showCheckInChat, setShowCheckInChat] = useState(false);
  const [activityHistory, setActivityHistory] = useState<DayActivity[]>([]);
  const [showActivityLogger, setShowActivityLogger] = useState(false);
  const [isSavingActivity, setIsSavingActivity] = useState(false);
  const [isSavingMood, setIsSavingMood] = useState(false);
  const [dailyStats, setDailyStats] = useState<DailyStats>({
    moodScore: null,
    completionRate: 100,
    mindfulnessCount: 0,
    totalActivities: 0,
    lastUpdated: new Date(),
  });

  // Add this function to transform activities into day activity format
  const transformActivitiesToDayActivity = (
    activities: Activity[]
  ): DayActivity[] => {
    const days: DayActivity[] = [];
    const today = new Date();

    // Create array for last 28 days
    for (let i = 27; i >= 0; i--) {
      const date = startOfDay(subDays(today, i));
      const dayActivities = activities.filter((activity) =>
        isWithinInterval(new Date(activity.timestamp), {
          start: date,
          end: addDays(date, 1),
        })
      );

      // Determine activity level based on number of activities
      let level: ActivityLevel = "none";
      if (dayActivities.length > 0) {
        if (dayActivities.length <= 2) level = "low";
        else if (dayActivities.length <= 4) level = "medium";
        else level = "high";
      }

      days.push({
        date,
        level,
        activities: dayActivities.map((activity) => ({
          type: activity.type,
          name: activity.name,
          completed: activity.completed,
          time: format(new Date(activity.timestamp), "h:mm a"),
        })),
      });
    }

    return days;
  };

  // Modify the loadActivities function to use a default user ID
  const loadActivities = useCallback(async () => {
    try {
      const userActivities = await getUserActivities("default-user");
      setActivities(userActivities);
      setActivityHistory(transformActivitiesToDayActivity(userActivities));
    } catch (error) {
      console.error("Error loading activities:", error);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Add this effect to update stats when activities change
 // Update stats when activities change
useEffect(() => {
  const updateStats = async () => {
    if (activities.length > 0) {
      const stats = await calculateDailyStats(activities);
      setDailyStats(stats);
    }
  };
  updateStats();
}, [activities]);

  // Update the effect
  // Update insights when activities or dailyStats change
  useEffect(() => {
    if (activities.length > 0 || dailyStats.totalActivities > 0) {
      setInsights(generateInsights(activities, dailyStats));
    }
}, [activities, dailyStats]);

// Add this debug effect near your other useEffects
useEffect(() => {
  console.log("=== DEBUG DASHBOARD DATA ===");
  console.log("Activities:", activities);
  console.log("Daily Stats:", dailyStats);
  console.log("Insights:", insights);
  console.log("Mood Score in Stats:", dailyStats.moodScore);
  console.log("Completion Rate in Stats:", dailyStats.completionRate);
}, [activities, dailyStats, insights]);

  // Add function to fetch daily stats

// Update your fetchDailyStats to also reload activities
const fetchDailyStats = useCallback(async () => {
  try {
    console.log("Refreshing dashboard data...");
    
    // Reload activities first
    await loadActivities();
    
    // Then fetch fresh stats
    const sessions = await getAllChatSessions();
    const token = localStorage.getItem("token");

    const activitiesResponse = await fetch(
      "https://ai-therepist-agent-backend-api.onrender.com/api/activity/today",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      }
    );

    let activities = [];
    if (activitiesResponse.ok) {
      activities = await activitiesResponse.json();
      console.log("Refreshed activities:", activities);
    }

    const stats = await calculateDailyStats(activities);
    
    setDailyStats({
      ...stats,
      mindfulnessCount: sessions.length,
    });

    console.log("Refresh completed");
  } catch (error) {
    console.error("Error refreshing dashboard:", error);
  }
}, [loadActivities]);

  // Fetch stats on mount and every 5 minutes
  useEffect(() => {
    fetchDailyStats();
    const interval = setInterval(fetchDailyStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchDailyStats]);

  // Update wellness stats to reflect the changes
 
const wellnessStats = [
  {
    title: "Mood Score",
    value: dailyStats.moodScore !== null && dailyStats.moodScore !== undefined 
      ? `${dailyStats.moodScore}%` 
      : "No data",
    icon: Brain,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    description: dailyStats.moodScore !== null ? "Today's mood" : "Log your mood today",
  },
  {
    title: "Completion Rate",
    value: `${dailyStats.completionRate}%`,
    icon: Trophy,
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
    description: "Activity completion rate",
  },
  {
    title: "Therapy Sessions",
    value: `${dailyStats.mindfulnessCount} sessions`,
    icon: Heart,
    color: "text-rose-500",
    bgColor: "bg-rose-500/10",
    description: "Total sessions completed",
  },
  {
    title: "Today's Activities",
    value: dailyStats.totalActivities.toString(),
    icon: Activity,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    description: "Activities for today",
  },
];

  // Load activities on mount
  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  // Add these action handlers
  const handleStartTherapy = () => {
    router.push("/therapy/new");
  };

  const handleMoodSubmit = async (data: { moodScore: number }) => {
    setIsSavingMood(true);
    try {
      await saveMoodData({
        userId: "default-user",
        mood: data.moodScore,
        note: "",
      });
      setShowMoodModal(false);
    } catch (error) {
      console.error("Error saving mood:", error);
    } finally {
      setIsSavingMood(false);
    }
  };

  const handleAICheckIn = () => {
    setShowActivityLogger(true);
  };

  // Add handler for game activities
  const handleGamePlayed = useCallback(
    async (gameName: string, description: string) => {
      try {
        await logActivity({
          userId: "default-user",
          type: "game",
          name: gameName,
          description: description,
          duration: 0,
        });

        // Refresh activities after logging
        loadActivities();
      } catch (error) {
        console.error("Error logging game activity:", error);
      }
    },
    [loadActivities]
  );

  // Simple loading state
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Container className="pt-20 pb-8 space-y-6">
        {/* Header Section */}
        <div className="flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-2"
          >
            <h1 className="text-3xl font-bold text-foreground">
              Welcome back, {user?.name || "there"}
            </h1>
            <p className="text-muted-foreground">
              {currentTime.toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </p>
          </motion.div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Main Grid Layout */}
        <div className="space-y-6">
          {/* Top Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Quick Actions Card */}
            <Card className="border-primary/10 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-primary/10 to-transparent" />
              <CardContent className="p-6 relative">
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Quick Actions</h3>
                      <p className="text-sm text-muted-foreground">
                        Start your wellness journey
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-3">
                    <Button
                      variant="default"
                      className={cn(
                        "w-full justify-between items-center p-6 h-auto group/button",
                        "bg-gradient-to-r from-primary/90 to-primary hover:from-primary hover:to-primary/90",
                        "transition-all duration-200 group-hover:translate-y-[-2px]"
                      )}
                      onClick={handleStartTherapy}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                          <MessageSquare className="w-4 h-4 text-white" />
                        </div>
                        <div className="text-left">
                          <div className="font-semibold text-white">
                            Start Therapy
                          </div>
                          <div className="text-xs text-white/80">
                            Begin a new session
                          </div>
                        </div>
                      </div>
                      <div className="opacity-0 group-hover/button:opacity-100 transition-opacity">
                        <ArrowRight className="w-5 h-5 text-white" />
                      </div>
                    </Button>

                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        variant="outline"
                        className={cn(
                          "flex flex-col h-[120px] px-4 py-3 group/mood hover:border-primary/50",
                          "justify-center items-center text-center",
                          "transition-all duration-200 group-hover:translate-y-[-2px]"
                        )}
                        onClick={() => setShowMoodModal(true)}
                      >
                        <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center mb-2">
                          <Heart className="w-5 h-5 text-rose-500" />
                        </div>
                        <div>
                          <div className="font-medium text-sm">Track Mood</div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            How are you feeling?
                          </div>
                        </div>
                      </Button>

                      <Button
                        variant="outline"
                        className={cn(
                          "flex flex-col h-[120px] px-4 py-3 group/ai hover:border-primary/50",
                          "justify-center items-center text-center",
                          "transition-all duration-200 group-hover:translate-y-[-2px]"
                        )}
                        onClick={handleAICheckIn}
                      >
                        <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center mb-2">
                          <BrainCircuit className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                          <div className="font-medium text-sm">Check-in</div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            Quick wellness check
                          </div>
                        </div>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Today's Overview Card */}
            <Card className="border-primary/10">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Today's Overview</CardTitle>
                    <CardDescription>
                      Your wellness metrics for{" "}
                      {format(new Date(), "MMMM d, yyyy")}
                    </CardDescription>
                  </div>
                 <Button
                    variant="ghost"
                    size="icon"
                    onClick={fetchDailyStats}
                    className="h-8 w-8"
                  >
                    <Loader2 className={cn("h-4 w-4")} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {wellnessStats.map((stat) => (
                    <div
                      key={stat.title}
                      className={cn(
                        "p-4 rounded-lg transition-all duration-200 hover:scale-[1.02]",
                        stat.bgColor
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <stat.icon className={cn("w-5 h-5", stat.color)} />
                        <p className="text-sm font-medium">{stat.title}</p>
                      </div>
                      <p className="text-2xl font-bold mt-2">{stat.value}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {stat.description}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-xs text-muted-foreground text-right">
                  Last updated: {format(dailyStats.lastUpdated, "h:mm a")}
                </div>
              </CardContent>
            </Card>

            {/* Insights Card */}
            <Card className="border-primary/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BrainCircuit className="w-5 h-5 text-primary" />
                  Insights
                </CardTitle>
                <CardDescription>
                  Personalized recommendations based on your activity patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {insights.length > 0 ? (
                    insights.map((insight, index) => (
                      <div
                        key={index}
                        className={cn(
                          "p-4 rounded-lg space-y-2 transition-all hover:scale-[1.02]",
                          insight.priority === "high"
                            ? "bg-primary/10"
                            : insight.priority === "medium"
                            ? "bg-primary/5"
                            : "bg-muted"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <insight.icon className="w-5 h-5 text-primary" />
                          <p className="font-medium">{insight.title}</p>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {insight.description}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      <Activity className="w-8 h-8 mx-auto mb-3 opacity-50" />
                      <p>
                        Complete more activities to receive personalized
                        insights
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left side - Spans 2 columns */}
            <div className="lg:col-span-3 space-y-6">
              {/* Anxiety Games - Now directly below Fitbit */}
              <AnxietyGames onGamePlayed={handleGamePlayed} />
            </div>
          </div>
        </div>
      </Container>

      {/* Mood tracking modal */}
      <Dialog open={showMoodModal} onOpenChange={setShowMoodModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>How are you feeling?</DialogTitle>
            <DialogDescription>
              Move the slider to track your current mood
            </DialogDescription>
          </DialogHeader>
          <MoodForm onSuccess={() => setShowMoodModal(false)} />
        </DialogContent>
      </Dialog>

      {/* AI check-in chat */}
      {showCheckInChat && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50">
          <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-background border-l shadow-lg">
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between px-4 py-3 border-b">
                <h3 className="font-semibold">AI Check-in</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowCheckInChat(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto p-4"></div>
            </div>
          </div>
        </div>
      )}

      <ActivityLogger
        open={showActivityLogger}
        onOpenChange={setShowActivityLogger}
        onActivityLogged={loadActivities}
      />
    </div>
  );
}
