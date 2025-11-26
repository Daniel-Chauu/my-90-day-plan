import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2, Save, Mail } from "lucide-react";
import type { User } from "@supabase/supabase-js";

const Settings = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [notificationEmail, setNotificationEmail] = useState("");
  const [notificationTime, setNotificationTime] = useState("08:00");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const loadSettings = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      setUser(session.user);

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("email_notifications_enabled, notification_email, notification_time")
        .eq("id", session.user.id)
        .maybeSingle();

      if (error) {
        console.error("Error loading settings:", error);
      } else if (profile) {
        setEmailEnabled(profile.email_notifications_enabled || false);
        setNotificationEmail(profile.notification_email || session.user.email || "");
        setNotificationTime(profile.notification_time?.slice(0, 5) || "08:00");
      } else {
        setNotificationEmail(session.user.email || "");
      }

      setLoading(false);
    };

    loadSettings();
  }, [navigate]);

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          email_notifications_enabled: emailEnabled,
          notification_email: notificationEmail,
          notification_time: notificationTime + ":00",
        })
        .eq("id", user.id);

      if (error) {
        console.error("Error saving settings:", error);
        toast({
          title: "Lỗi",
          description: "Không thể lưu cài đặt. Vui lòng thử lại.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Đã lưu!",
        description: "Cài đặt email đã được cập nhật thành công.",
      });
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-hero">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-4xl font-bold text-primary">Cài đặt</h1>
        </div>

        <Card className="p-6 shadow-large">
          <div className="flex items-center gap-3 mb-6">
            <Mail className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">Thông báo Email</h2>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Gửi thực đơn hàng ngày</Label>
                <p className="text-sm text-muted-foreground">
                  Nhận email với thực đơn được tạo tự động mỗi ngày
                </p>
              </div>
              <Switch
                checked={emailEnabled}
                onCheckedChange={setEmailEnabled}
              />
            </div>

            {emailEnabled && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="email">Email nhận thông báo</Label>
                  <Input
                    id="email"
                    type="email"
                    value={notificationEmail}
                    onChange={(e) => setNotificationEmail(e.target.value)}
                    placeholder="your@email.com"
                  />
                  <p className="text-xs text-muted-foreground">
                    Thực đơn sẽ được gửi đến email này
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time">Giờ gửi email</Label>
                  <Input
                    id="time"
                    type="time"
                    value={notificationTime}
                    onChange={(e) => setNotificationTime(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Email sẽ được gửi tự động vào giờ này mỗi ngày
                  </p>
                </div>

                <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                  <p className="text-sm">
                    <strong>💡 Lưu ý:</strong> Thực đơn sẽ được tự động tạo và gửi mỗi ngày. 
                    Nếu bạn không hài lòng với món ăn, có thể chat với AI để thay đổi.
                  </p>
                </div>
              </>
            )}

            <Button
              onClick={handleSave}
              disabled={saving || (emailEnabled && !notificationEmail)}
              className="w-full bg-gradient-primary"
              size="lg"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Lưu cài đặt
                </>
              )}
            </Button>
          </div>
        </Card>

        <Card className="p-6 shadow-medium">
          <h3 className="font-bold mb-3">Cách hoạt động</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>✅ Thực đơn được tạo tự động mỗi ngày dựa trên thông tin của bạn</li>
            <li>📧 Email sẽ được gửi vào giờ bạn chọn</li>
            <li>🤖 Sử dụng AI chat để thay đổi món ăn nếu cần</li>
            <li>💾 Tất cả thực đơn được lưu lại để xem lại sau</li>
          </ul>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
