import { Card, CardContent } from "@/components/ui/card";
import { 
  FileText, 
  TrendingUp, 
  Cloud, 
  BrainCircuit, 
  MessageCircleQuestion, 
  Shield 
} from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "Government Schemes",
    description: "Access all agricultural schemes, subsidies, and training programs in one place with easy application process.",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: TrendingUp,
    title: "Market Prices",
    description: "Real-time crop prices from mandis across the country. Make informed selling decisions with price trends.",
    color: "bg-secondary/20 text-secondary-foreground",
  },
  {
    icon: Cloud,
    title: "Weather Forecasts",
    description: "Accurate weather predictions and alerts to plan irrigation, sowing, and harvesting activities effectively.",
    color: "bg-weather/10 text-weather",
  },
  {
    icon: BrainCircuit,
    title: "AI Crop Advisory",
    description: "Get personalized recommendations for crops, fertilizers, and pest control based on your soil and region.",
    color: "bg-accent/20 text-accent-foreground",
  },
  {
    icon: MessageCircleQuestion,
    title: "Expert Support",
    description: "Submit queries and get responses from agricultural experts and department officials.",
    color: "bg-leaf/10 text-primary",
  },
  {
    icon: Shield,
    title: "Secure Platform",
    description: "Your data is protected with government-grade security. Access your personalized dashboard anytime.",
    color: "bg-soil/10 text-soil",
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Everything You Need in One Portal
          </h2>
          <p className="text-muted-foreground text-lg">
            A comprehensive digital platform designed to empower farmers with information, resources, and support for better agricultural outcomes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="card-hover border-0 shadow-card bg-card"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-6">
                <div className={`w-14 h-14 rounded-2xl ${feature.color} flex items-center justify-center mb-4`}>
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
