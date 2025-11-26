import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, ChevronLeft, ChevronRight, Loader2, LogOut, Apple, Flame, CheckCircle, Lock } from "lucide-react";
import MealSuggestions from "@/components/MealSuggestions";
import ChatWithAI from "@/components/ChatWithAI";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@supabase/supabase-js";

const Dashboard = () => {
  const [currentWeek, setCurrentWeek] = useState(1);
  const [currentDay, setCurrentDay] = useState(1);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [completingDay, setCompletingDay] = useState(false);
  const [currentMeals, setCurrentMeals] = useState<any[]>([]);
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

  const handleDayClick = (dayNumber: number) => {
    // Chỉ cho phép click vào ngày hiện tại (tiến độ thực tế) hoặc các ngày đã hoàn thành
    const completedDays = profile?.completed_days || [];
    const progressDay = profile?.current_day || 1;
    const canAccess = dayNumber <= progressDay || completedDays.includes(dayNumber);
    
    if (!canAccess) {
      toast({
        title: "Ngày chưa mở khóa",
        description: "Hãy hoàn thành ngày hiện tại để mở khóa ngày tiếp theo!",
        variant: "destructive",
      });
      return;
    }

    setCurrentDay(dayNumber);
  };

  const handleCompleteDay = async () => {
    if (!user || !profile) return;

    setCompletingDay(true);

    try {
      const completedDays = profile.completed_days || [];
      
      // Kiểm tra xem ngày này đã hoàn thành chưa
      if (completedDays.includes(currentDay)) {
        toast({
          title: "Đã hoàn thành",
          description: "Ngày này đã được đánh dấu hoàn thành rồi!",
        });
        setCompletingDay(false);
        return;
      }

      const newCompletedDays = [...completedDays, currentDay];
      const nextDay = Math.min(currentDay + 1, 90);
      const newStreak = profile.streak_days + 1;

      const { error } = await supabase
        .from("profiles")
        .update({
          completed_days: newCompletedDays,
          current_day: nextDay,
          streak_days: newStreak,
          last_active_date: new Date().toISOString().split('T')[0],
        })
        .eq("id", user.id);

      if (error) {
        console.error("Error completing day:", error);
        toast({
          title: "Lỗi",
          description: "Không thể hoàn thành ngày. Vui lòng thử lại.",
          variant: "destructive",
        });
        return;
      }

      // Cập nhật profile local
      setProfile({
        ...profile,
        completed_days: newCompletedDays,
        current_day: nextDay,
        streak_days: newStreak,
      });

      setCurrentDay(nextDay);

      toast({
        title: "🎉 Chúc mừng!",
        description: `Bạn đã hoàn thành ngày ${currentDay}! Hãy tiếp tục phấn đấu!`,
      });
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setCompletingDay(false);
    }
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

  const completedDays = profile?.completed_days || [];
  const isDayCompleted = completedDays.includes(currentDay);

  return (
    <div className="min-h-screen bg-gradient-hero py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold text-primary">Dashboard của tôi</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/settings")}>
              Cài đặt
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Đăng xuất
            </Button>
          </div>
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
            <p className="text-xs text-muted-foreground mt-2">
              {completedDays.length} ngày đã hoàn thành
            </p>
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
              const isCompleted = completedDays.includes(dayNumber);
              const progressDay = profile?.current_day || 1;
              const isLocked = dayNumber > progressDay && !isCompleted;
              
              return (
                <Card
                  key={idx}
                  onClick={() => handleDayClick(dayNumber)}
                  className={`p-4 cursor-pointer transition-smooth text-center relative ${
                    isSelected ? 'border-primary bg-primary/5 shadow-medium' : ''
                  } ${isLocked ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary'}`}
                >
                  {isCompleted && (
                    <div className="absolute top-2 right-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  {isLocked && (
                    <div className="absolute top-2 right-2">
                      <Lock className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                  <p className="font-semibold mb-2">{day}</p>
                  <p className="text-sm text-muted-foreground">Ngày {dayNumber}</p>
                  <div className={`mt-2 h-2 rounded-full ${
                    isCompleted ? 'bg-primary' : 
                    isSelected ? 'bg-gradient-primary' : 
                    'bg-primary/20'
                  }`} />
                </Card>
              );
            })}
          </div>

          {!isDayCompleted && (
            <div className="mt-6 text-center">
              <Button
                onClick={handleCompleteDay}
                disabled={completingDay}
                className="bg-gradient-primary px-8"
                size="lg"
              >
                {completingDay ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-5 w-5" />
                    Hoàn thành ngày {currentDay}
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                Đánh dấu hoàn thành để mở khóa ngày tiếp theo
              </p>
            </div>
          )}
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          <MealSuggestions 
            surveyData={surveyData} 
            currentDay={currentDay}
          />

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

      <ChatWithAI surveyData={surveyData} currentMeals={currentMeals} />
    </div>
  );
};

export default Dashboard;
