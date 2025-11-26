import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Apple, Calendar, Target, TrendingUp, CheckCircle, Sparkles } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  const benefits = [
    {
      icon: Target,
      title: "Cá nhân hóa 100%",
      description: "Thực đơn được thiết kế riêng dựa trên thể chất, mục tiêu và sức khỏe của bạn"
    },
    {
      icon: Apple,
      title: "Dinh dưỡng khoa học",
      description: "Tính toán chính xác BMR, TDEE và macro phù hợp với từng giai đoạn"
    },
    {
      icon: Calendar,
      title: "Lộ trình 90 ngày",
      description: "Kế hoạch chi tiết từng ngày, dễ dàng theo dõi và thực hiện"
    },
    {
      icon: TrendingUp,
      title: "Theo dõi tiến độ",
      description: "Dashboard trực quan giúp bạn nắm rõ hành trình của mình"
    }
  ];

  const steps = [
    "Hoàn thành bài khảo sát nhanh (3 phút)",
    "Nhận phân tích dinh dưỡng cá nhân",
    "Xem lộ trình 90 ngày chi tiết",
    "Bắt đầu hành trình lành mạnh"
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-hero overflow-hidden">
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full mb-6 border border-primary/20">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-semibold">Chương trình dinh dưỡng khoa học</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            90 Ngày Thay Đổi<br />
            <span className="text-transparent bg-clip-text bg-gradient-primary">
              Sức Khỏe & Vóc Dáng
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Lộ trình dinh dưỡng được cá nhân hóa hoàn toàn, giúp bạn đạt mục tiêu một cách khoa học và bền vững
          </p>
          
          <Button 
            size="lg" 
            onClick={() => navigate('/survey')}
            className="bg-gradient-primary text-lg px-8 py-6 shadow-large hover:shadow-xl transition-smooth"
          >
            Bắt đầu ngay - Miễn phí
          </Button>
          
          <p className="text-sm text-muted-foreground mt-4">
            ✨ Không cần thẻ tín dụng • Kết quả ngay lập tức
          </p>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Tại sao chọn chương trình của chúng tôi?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Không chỉ là một thực đơn, đây là hệ thống quản lý sức khỏe toàn diện
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, idx) => (
              <Card key={idx} className="p-6 shadow-medium hover:shadow-large transition-smooth">
                <benefit.icon className="h-10 w-10 text-primary mb-4" />
                <h3 className="text-lg font-bold mb-2">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">{benefit.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Cách thức hoạt động
            </h2>
            <p className="text-lg text-muted-foreground">
              Chỉ 4 bước đơn giản để bắt đầu
            </p>
          </div>

          <div className="space-y-4">
            {steps.map((step, idx) => (
              <Card key={idx} className="p-6 shadow-soft flex items-center gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <p className="text-lg font-semibold">{step}</p>
                </div>
                <CheckCircle className="h-6 w-6 text-primary" />
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button 
              size="lg"
              onClick={() => navigate('/survey')}
              className="bg-gradient-primary px-8 py-6 text-lg shadow-medium"
            >
              Bắt đầu khảo sát ngay
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Sẵn sàng thay đổi cuộc sống?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Hàng ngàn người đã thành công với chương trình của chúng tôi
          </p>
          <Button 
            size="lg"
            variant="secondary"
            onClick={() => navigate('/survey')}
            className="px-8 py-6 text-lg"
          >
            Khám phá lộ trình của bạn
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
