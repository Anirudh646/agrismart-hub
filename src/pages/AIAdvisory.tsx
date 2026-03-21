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
import { BrainCircuit, Sparkles, Send, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

const soilTypes = ["Sandy", "Loamy", "Clay", "Silty", "Peaty", "Chalky"];
const seasons = ["Kharif (Monsoon)", "Rabi (Winter)", "Zaid (Summer)"];

const AIAdvisory = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [aiResponse, setAiResponse] = useState("");
  const [formData, setFormData] = useState({
    location: "",
    soilType: "",
    season: "",
    landSize: "",
    currentCrop: "",
    query: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAiResponse("");
    setShowResults(false);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("crop-advisory", {
        body: {
          cropName: formData.currentCrop,
          soilType: formData.soilType,
          location: formData.location,
          season: formData.season,
          area: formData.landSize,
          currentCrops: formData.currentCrop ? [formData.currentCrop] : [],
        },
      });

      if (fnError) throw fnError;

      const advice = data?.advice || "No recommendations available. Please try again.";
      setAiResponse(advice);
      setShowResults(true);

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
          ai_response: { advice } as unknown as Record<string, unknown>,
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
    } catch (error) {
      console.error("AI Advisory error:", error);
      toast({
        title: "Error",
        description: "Failed to get recommendations. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
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
                        Analyzing with AI...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Get AI Recommendations
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
                <Card className="border border-border/50 animate-fade-in-up">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                        <BrainCircuit className="w-5 h-5" />
                      </div>
                      <CardTitle className="text-lg">AI Recommendations</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-foreground prose-p:text-muted-foreground prose-li:text-muted-foreground prose-strong:text-foreground">
                      <ReactMarkdown>{aiResponse}</ReactMarkdown>
                    </div>
                  </CardContent>
                </Card>
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
