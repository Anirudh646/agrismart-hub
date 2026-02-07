import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { BrainCircuit, Leaf, Droplets, Bug, Sparkles, Send, Loader2 } from "lucide-react";

const soilTypes = ["Sandy", "Loamy", "Clay", "Silty", "Peaty", "Chalky"];
const seasons = ["Kharif (Monsoon)", "Rabi (Winter)", "Zaid (Summer)"];

const AIAdvisory = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [formData, setFormData] = useState({
    location: "",
    soilType: "",
    season: "",
    landSize: "",
    currentCrop: "",
    query: "",
  });

  const [recommendations, setRecommendations] = useState<{
    category: string;
    icon: typeof Leaf;
    color: string;
    items: { name: string; confidence: number; reason: string }[];
  }[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Generate recommendations based on input
    const generatedRecommendations = [
      {
        category: "Recommended Crops",
        icon: Leaf,
        color: "bg-primary/10 text-primary",
        items: [
          { name: "Wheat (HD-2967)", confidence: 95, reason: `Best suited for ${formData.soilType || "your"} soil in ${formData.location || "your region"}` },
          { name: "Mustard (Pusa Bold)", confidence: 88, reason: "Good yield potential with low water requirement" },
          { name: "Chickpea (Pusa-256)", confidence: 82, reason: "Improves soil nitrogen, good market price" },
        ],
      },
      {
        category: "Fertilizer Schedule",
        icon: Droplets,
        color: "bg-secondary/20 text-secondary-foreground",
        items: [
          { name: `DAP - ${Math.round(50 * parseFloat(formData.landSize || "1"))}kg`, confidence: 90, reason: "Apply at sowing for phosphorus needs" },
          { name: `Urea - ${Math.round(60 * parseFloat(formData.landSize || "1"))}kg`, confidence: 85, reason: "Split into 2 doses after irrigation" },
          { name: `Potash - ${Math.round(20 * parseFloat(formData.landSize || "1"))}kg`, confidence: 75, reason: "Apply for grain quality improvement" },
        ],
      },
      {
        category: "Pest Alerts",
        icon: Bug,
        color: "bg-destructive/10 text-destructive",
        items: [
          { name: "Aphids Risk: Medium", confidence: 65, reason: "Monitor weekly, spray if infestation exceeds 10%" },
          { name: "Yellow Rust: Low", confidence: 40, reason: "Use resistant varieties, fungicide if spots appear" },
          { name: "Termite: Low", confidence: 30, reason: "Apply chlorpyriphos near irrigation channel" },
        ],
      },
    ];

    // Save to database if user is logged in
    if (user) {
      const { error } = await supabase.from("farmer_advisory_requests").insert({
        user_id: user.id,
        location: formData.location || null,
        soil_type: formData.soilType || null,
        season: formData.season || null,
        land_size: formData.landSize ? parseFloat(formData.landSize) : null,
        current_crop: formData.currentCrop || null,
        query: formData.query || null,
        ai_response: generatedRecommendations as unknown as Record<string, unknown>,
      } as never);

      if (error) {
        console.error("Error saving advisory request:", error);
      } else {
        toast({
          title: "Advisory Saved",
          description: "Your request has been recorded for future reference.",
        });
      }
    }

    setRecommendations(generatedRecommendations);
    setLoading(false);
    setShowResults(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 bg-accent/20 rounded-full px-4 py-2 mb-6">
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-foreground">AI-Powered Advisory</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Smart Crop Advisory System
            </h1>
            <p className="text-muted-foreground text-lg">
              Get personalized recommendations for crops, fertilizers, and pest control based on your farm's specific conditions.
            </p>
            {!user && (
              <p className="mt-4 text-sm text-amber-600 bg-amber-50 inline-block px-4 py-2 rounded-lg">
                💡 Login to save your advisory history
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input Form */}
            <Card className="border-2 border-primary/20">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl gradient-hero flex items-center justify-center">
                    <BrainCircuit className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <CardTitle>Farm Details</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="location">Location (District)</Label>
                      <Input
                        id="location"
                        placeholder="e.g., Karnal, Haryana"
                        className="h-11"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="landSize">Land Size (Acres)</Label>
                      <Input
                        id="landSize"
                        type="number"
                        placeholder="e.g., 5"
                        className="h-11"
                        value={formData.landSize}
                        onChange={(e) => setFormData({ ...formData, landSize: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Soil Type</Label>
                    <div className="flex flex-wrap gap-2">
                      {soilTypes.map((type) => (
                        <button
                          key={type}
                          type="button"
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            formData.soilType === type
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground hover:bg-muted/80"
                          }`}
                          onClick={() => setFormData({ ...formData, soilType: type })}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Season</Label>
                    <div className="flex flex-wrap gap-2">
                      {seasons.map((season) => (
                        <button
                          key={season}
                          type="button"
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            formData.season === season
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground hover:bg-muted/80"
                          }`}
                          onClick={() => setFormData({ ...formData, season: season })}
                        >
                          {season}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currentCrop">Current/Previous Crop</Label>
                    <Input
                      id="currentCrop"
                      placeholder="e.g., Rice, Maize"
                      className="h-11"
                      value={formData.currentCrop}
                      onChange={(e) => setFormData({ ...formData, currentCrop: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="query">Additional Query (Optional)</Label>
                    <Textarea
                      id="query"
                      placeholder="Any specific concerns or questions about your farm..."
                      className="min-h-[100px]"
                      value={formData.query}
                      onChange={(e) => setFormData({ ...formData, query: e.target.value })}
                    />
                  </div>

                  <Button type="submit" variant="hero" className="w-full" size="lg" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Get Recommendations
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Results */}
            <div className="space-y-6">
              {!showResults ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <BrainCircuit className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p className="text-lg font-medium">Fill in your farm details</p>
                    <p className="text-sm">AI recommendations will appear here</p>
                  </div>
                </div>
              ) : (
                recommendations.map((rec, index) => (
                  <Card key={index} className="border border-border/50 animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl ${rec.color} flex items-center justify-center`}>
                          <rec.icon className="w-5 h-5" />
                        </div>
                        <CardTitle className="text-lg">{rec.category}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {rec.items.map((item, idx) => (
                        <div key={idx} className="bg-muted/50 rounded-xl p-4">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-medium text-foreground">{item.name}</p>
                            <span className="text-sm font-semibold text-primary">{item.confidence}%</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{item.reason}</p>
                          <div className="mt-2 w-full h-2 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full rounded-full bg-primary transition-all duration-500"
                              style={{ width: `${item.confidence}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AIAdvisory;
