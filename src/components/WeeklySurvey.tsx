import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface WeeklySurveyProps {
  open: boolean;
  onComplete: () => void;
  weekNumber: number;
  userId: string;
  currentWeight: number;
  currentActivityLevel: string;
}

const WeeklySurvey = ({ open, onComplete, weekNumber, userId, currentWeight, currentActivityLevel }: WeeklySurveyProps) => {
  const [weight, setWeight] = useState(currentWeight.toString());
  const [activityLevel, setActivityLevel] = useState(currentActivityLevel);
  const [bodyFeeling, setBodyFeeling] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!weight || !activityLevel || !bodyFeeling) {
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng điền đầy đủ các thông tin",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      // Save weekly health tracking
      const { error: trackingError } = await supabase
        .from("weekly_health_tracking")
        .insert({
          user_id: userId,
          week_number: weekNumber,
          weight: parseFloat(weight),
          activity_level: activityLevel,
          body_feeling: bodyFeeling,
        });

      if (trackingError) throw trackingError;

      // Update profile with latest data
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          weight: parseFloat(weight),
          activity_level: activityLevel,
        })
        .eq("id", userId);

      if (profileError) throw profileError;

      toast({
        title: "✅ Đã lưu",
        description: "Cảm ơn bạn đã cập nhật thông tin sức khỏe!",
      });

      onComplete();
    } catch (error) {
      console.error("Error saving weekly survey:", error);
      toast({
        title: "Lỗi",
        description: "Không thể lưu thông tin. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[500px]" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-2xl">🩺 Khảo sát sức khỏe tuần {weekNumber}</DialogTitle>
          <DialogDescription>
            Cập nhật thông tin để chúng tôi điều chỉnh chương trình phù hợp hơn với bạn
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="weight">Cân nặng hiện tại (kg)</Label>
            <Input
              id="weight"
              type="number"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="Ví dụ: 65.5"
            />
          </div>

          <div className="space-y-2">
            <Label>Mức độ vận động hằng ngày</Label>
            <RadioGroup value={activityLevel} onValueChange={setActivityLevel}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="sedentary" id="sedentary" />
                <Label htmlFor="sedentary" className="font-normal cursor-pointer">
                  Ít vận động (ngồi nhiều)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="light" id="light" />
                <Label htmlFor="light" className="font-normal cursor-pointer">
                  Vận động nhẹ (1-3 ngày/tuần)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="moderate" id="moderate" />
                <Label htmlFor="moderate" className="font-normal cursor-pointer">
                  Vận động trung bình (3-5 ngày/tuần)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="active" id="active" />
                <Label htmlFor="active" className="font-normal cursor-pointer">
                  Vận động nhiều (6-7 ngày/tuần)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="very-active" id="very-active" />
                <Label htmlFor="very-active" className="font-normal cursor-pointer">
                  Vận động rất nhiều (vận động viên)
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label>Cảm giác cơ thể</Label>
            <RadioGroup value={bodyFeeling} onValueChange={setBodyFeeling}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="tired" id="tired" />
                <Label htmlFor="tired" className="font-normal cursor-pointer">
                  😴 Mệt mỏi, thiếu năng lượng
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="normal" id="normal" />
                <Label htmlFor="normal" className="font-normal cursor-pointer">
                  😊 Bình thường, cảm thấy ổn
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="energetic" id="energetic" />
                <Label htmlFor="energetic" className="font-normal cursor-pointer">
                  💪 Tràn đầy năng lượng, khỏe mạnh
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="stressed" id="stressed" />
                <Label htmlFor="stressed" className="font-normal cursor-pointer">
                  😰 Căng thẳng, stress
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-gradient-primary"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang lưu...
              </>
            ) : (
              "Hoàn thành"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WeeklySurvey;