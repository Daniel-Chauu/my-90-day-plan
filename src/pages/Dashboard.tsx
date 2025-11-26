import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, TrendingUp, Award, ChevronLeft, ChevronRight, Loader2, LogOut, Apple, Flame } from "lucide-react";
import MealSuggestions from "@/components/MealSuggestions";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@supabase/supabase-js";

const Dashboard = () => {
  const [currentWeek, setCurrentWeek] = useState(1);
  const [currentDay, setCurrentDay] = useState(1);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const totalWeeks = 13; // 90 days ≈ 13 weeks
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      setUser(session.user);

      // Fetch user profile
      const { data: profileData, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching profile:", error);
      } else if (profileData) {
        setProfile(profileData);
        setCurrentDay(profileData?.current_day || 1);
      }

      setLoading(false);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleDayClick = (dayIndex: number) => {
    const day = (currentWeek - 1) * 7 + dayIndex + 1;
    setCurrentDay(day);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Đã đăng xuất",
      description: "Hẹn gặp lại bạn!",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-hero">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Mock survey data - will be replaced with actual profile data
  const surveyData = {
    weight: profile?.weight || "70",
    height: profile?.height || "170",
    age: profile?.age || "28",
    gender: profile?.gender || "male",
    activityLevel: profile?.activity_level || "moderate",
    allergies: profile?.allergies || [],
    healthIssues: profile?.health_issues || [],
    goal: profile?.goal_type || "lose"
  };

  return (
    <div className="min-h-screen bg-gradient-hero py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold text-primary">Dashboard của tôi</h1>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Đăng xuất
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="p-6 shadow-medium">
            <div className="flex items-center gap-3 mb-3">
              <Calendar className="h-6 w-6 text-primary" />
              <h3 className="font-semibold">Tiến độ</h3>
            </div>
            <p className="text-3xl font-bold text-primary mb-2">Ngày {currentDay}/90</p>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-gradient-primary" style={{ width: `${(currentDay / 90) * 100}%` }} />
            </div>
          </Card>

          <Card className="p-6 shadow-medium">
            <div className="flex items-center gap-3 mb-3">
              <Flame className="h-6 w-6 text-accent" />
              <h3 className="font-semibold">Streak</h3>
            </div>
            <p className="text-3xl font-bold text-accent mb-2">{profile?.streak_days || 0} ngày</p>
            <p className="text-sm text-muted-foreground">Cố gắng giữ vững nhé!</p>
          </Card>

          <Card className="p-6 shadow-medium">
            <div className="flex items-center gap-3 mb-3">
              <Apple className="h-6 w-6 text-secondary" />
              <h3 className="font-semibold">Hôm nay</h3>
            </div>
            <p className="text-3xl font-bold text-secondary mb-2">1,450</p>
            <p className="text-sm text-muted-foreground">/ 1,800 calories</p>
          </Card>
        </div>

        <Card className="p-6 shadow-large">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Tuần {currentWeek}</h2>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentWeek(Math.max(1, currentWeek - 1))}
                disabled={currentWeek === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentWeek(Math.min(totalWeeks, currentWeek + 1))}
                disabled={currentWeek === totalWeeks}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid md:grid-cols-7 gap-3">
            {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((day, idx) => {
              const dayNumber = (currentWeek - 1) * 7 + idx + 1;
              const isSelected = dayNumber === currentDay;
              return (
                <Card
                  key={idx}
                  onClick={() => handleDayClick(idx)}
                  className={`p-4 cursor-pointer hover:border-primary transition-smooth text-center ${
                    isSelected ? 'border-primary bg-primary/5' : ''
                  }`}
                >
                  <p className="font-semibold mb-2">{day}</p>
                  <p className="text-sm text-muted-foreground">Ngày {dayNumber}</p>
                  <div className={`mt-2 h-2 rounded-full ${isSelected ? 'bg-gradient-primary' : 'bg-primary/20'}`} />
                </Card>
              );
            })}
          </div>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          <MealSuggestions surveyData={surveyData} currentDay={currentDay} />

          <Card className="p-6 shadow-medium">
            <h3 className="text-xl font-bold mb-4">Lời khuyên hôm nay</h3>
            <div className="space-y-3">
              <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                <p className="font-semibold mb-1">💧 Uống đủ nước</p>
                <p className="text-sm text-muted-foreground">Mục tiêu: 2 lít/ngày</p>
              </div>
              <div className="p-4 bg-secondary/10 rounded-lg border border-secondary/20">
                <p className="font-semibold mb-1">🏃 Vận động nhẹ</p>
                <p className="text-sm text-muted-foreground">30 phút đi bộ</p>
              </div>
              <div className="p-4 bg-accent/10 rounded-lg border border-accent/20">
                <p className="font-semibold mb-1">😴 Ngủ đủ giấc</p>
                <p className="text-sm text-muted-foreground">7-8 giờ mỗi đêm</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
