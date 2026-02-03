import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BrainCircuit, Leaf, Droplets, Bug, ArrowRight, Sparkles } from "lucide-react";

const AIAdvisoryPreview = () => {
  const [activeTab, setActiveTab] = useState("crop");

  const tabs = [
    { id: "crop", label: "Crop Selection", icon: Leaf },
    { id: "fertilizer", label: "Fertilizer Guide", icon: Droplets },
    { id: "pest", label: "Pest Control", icon: Bug },
  ];

  const recommendations = {
    crop: {
      title: "Recommended Crops for Your Region",
      items: [
        { name: "Wheat", score: 95, reason: "Ideal soil pH and climate conditions" },
        { name: "Mustard", score: 88, reason: "Good water availability for Rabi season" },
        { name: "Chickpea", score: 82, reason: "Nitrogen-fixing, improves soil health" },
      ],
    },
    fertilizer: {
      title: "Fertilizer Recommendations",
      items: [
        { name: "DAP", score: 90, reason: "Low phosphorus detected in soil" },
        { name: "Urea", score: 85, reason: "Apply 60kg/acre after first irrigation" },
        { name: "Potash", score: 70, reason: "Moderate potassium levels" },
      ],
    },
    pest: {
      title: "Pest Risk Alerts",
      items: [
        { name: "Aphids", score: 75, reason: "High risk due to humidity levels" },
        { name: "Stem Borer", score: 60, reason: "Monitor wheat fields weekly" },
        { name: "Rust", score: 55, reason: "Apply fungicide if spots appear" },
      ],
    },
  };

  const current = recommendations[activeTab as keyof typeof recommendations];

  return (
    <section className="py-20 bg-card">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div>
            <div className="inline-flex items-center gap-2 bg-accent/20 rounded-full px-4 py-2 mb-6">
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-foreground">AI-Powered</span>
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Smart Crop Advisory System
            </h2>
            <p className="text-muted-foreground text-lg mb-6 leading-relaxed">
              Get personalized recommendations powered by AI. Our system analyzes your soil type, location, season, and weather patterns to suggest the best crops, fertilizers, and pest control measures.
            </p>

            <ul className="space-y-4 mb-8">
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Leaf className="w-4 h-4 text-primary" />
                </div>
                <span className="text-foreground">Crop variety recommendations based on soil</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Droplets className="w-4 h-4 text-primary" />
                </div>
                <span className="text-foreground">Personalized fertilizer schedules</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bug className="w-4 h-4 text-primary" />
                </div>
                <span className="text-foreground">Early pest and disease detection alerts</span>
              </li>
            </ul>

            <Button variant="hero" size="lg">
              Try AI Advisory
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>

          {/* Right - Interactive Demo */}
          <div>
            <Card className="border-2 border-primary/20 shadow-glow">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl gradient-hero flex items-center justify-center">
                    <BrainCircuit className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <CardTitle className="text-xl">AI Advisory Demo</CardTitle>
                </div>
                
                {/* Tabs */}
                <div className="flex gap-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        activeTab === tab.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      <tab.icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  ))}
                </div>
              </CardHeader>
              
              <CardContent>
                <h4 className="font-semibold text-foreground mb-4">{current.title}</h4>
                <div className="space-y-3">
                  {current.items.map((item, index) => (
                    <div
                      key={index}
                      className="bg-muted/50 rounded-xl p-4 flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium text-foreground">{item.name}</p>
                        <p className="text-sm text-muted-foreground">{item.reason}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary transition-all duration-500"
                            style={{ width: `${item.score}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-primary w-10">{item.score}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AIAdvisoryPreview;
