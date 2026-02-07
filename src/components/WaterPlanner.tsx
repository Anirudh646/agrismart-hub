import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Droplets, Loader2, Calendar, Waves } from "lucide-react";

const crops = ["Wheat", "Rice", "Cotton", "Maize", "Sugarcane", "Mustard", "Soybean", "Potato", "Onion", "Tomato"];
const soilTypes = ["Sandy", "Loamy", "Clay", "Silty", "Black Cotton"];
const irrigationTypes = ["Flood", "Drip", "Sprinkler", "Furrow", "Basin"];

const cropWaterRequirements: Record<string, { totalWater: number; frequency: string; critical: string }> = {
  Wheat: { totalWater: 400, frequency: "Every 20-25 days", critical: "Crown root initiation, Flowering" },
  Rice: { totalWater: 1200, frequency: "Continuous flooding", critical: "Transplanting, Flowering, Grain filling" },
  Cotton: { totalWater: 700, frequency: "Every 15-20 days", critical: "Flowering, Boll formation" },
  Maize: { totalWater: 500, frequency: "Every 10-15 days", critical: "Tasseling, Silking, Grain filling" },
  Sugarcane: { totalWater: 2000, frequency: "Every 7-10 days", critical: "Tillering, Grand growth" },
  Mustard: { totalWater: 300, frequency: "Every 30-40 days", critical: "Flowering, Pod formation" },
  Soybean: { totalWater: 450, frequency: "Every 15-20 days", critical: "Flowering, Pod filling" },
  Potato: { totalWater: 500, frequency: "Every 7-10 days", critical: "Tuber initiation, Bulking" },
  Onion: { totalWater: 550, frequency: "Every 7-10 days", critical: "Bulb development" },
  Tomato: { totalWater: 600, frequency: "Every 5-7 days", critical: "Flowering, Fruit setting" },
};

export function WaterPlanner() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    totalWater: number;
    schedule: { phase: string; water: number; frequency: string }[];
    tips: string[];
  } | null>(null);
  
  const [formData, setFormData] = useState({
    crop: "",
    landArea: "",
    soilType: "",
    irrigationType: "",
  });

  const calculateWaterPlan = async () => {
    if (!formData.crop || !formData.landArea) {
      toast({ title: "Error", description: "Please fill crop and land area", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    
    const area = parseFloat(formData.landArea);
    const cropData = cropWaterRequirements[formData.crop] || cropWaterRequirements.Wheat;
    
    // Adjust for irrigation type efficiency
    let efficiency = 1;
    if (formData.irrigationType === "Drip") efficiency = 0.6;
    else if (formData.irrigationType === "Sprinkler") efficiency = 0.75;
    else if (formData.irrigationType === "Flood") efficiency = 1.3;
    
    // Adjust for soil type
    let soilFactor = 1;
    if (formData.soilType === "Sandy") soilFactor = 1.3;
    else if (formData.soilType === "Clay") soilFactor = 0.85;
    
    const totalWater = Math.round(cropData.totalWater * area * efficiency * soilFactor);
    
    const schedule = [
      { phase: "Germination/Establishment", water: Math.round(totalWater * 0.15), frequency: "Light irrigation" },
      { phase: "Vegetative Growth", water: Math.round(totalWater * 0.35), frequency: cropData.frequency },
      { phase: "Flowering/Reproductive", water: Math.round(totalWater * 0.35), frequency: "Critical - don't skip" },
      { phase: "Maturity", water: Math.round(totalWater * 0.15), frequency: "Reduce frequency" },
    ];
    
    const tips = [
      `Critical stages for ${formData.crop}: ${cropData.critical}`,
      formData.irrigationType === "Drip" ? "Drip saves 40% water - excellent choice!" : "Consider drip irrigation to save water",
      formData.soilType === "Sandy" ? "Sandy soil needs more frequent, lighter irrigation" : "",
      "Irrigate early morning or evening to reduce evaporation",
    ].filter(Boolean);

    // Save to database
    if (user) {
      await supabase.from("water_plans").insert({
        user_id: user.id,
        crop_name: formData.crop,
        land_area: area,
        soil_type: formData.soilType || null,
        irrigation_type: formData.irrigationType || null,
        water_schedule: schedule as unknown as Record<string, unknown>,
        total_water_requirement: totalWater,
        unit: "mm",
      } as never);
    }

    setResult({ totalWater, schedule, tips });
    setIsLoading(false);
    
    toast({ title: "Plan Created", description: "Your water plan has been generated" });
  };

  return (
    <Card className="border-2 border-blue-200">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
            <Droplets className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <CardTitle className="text-lg">Water Planner</CardTitle>
            <CardDescription>Plan irrigation for optimal crop growth</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="crop">Crop *</Label>
            <Select value={formData.crop} onValueChange={(v) => setFormData({ ...formData, crop: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Select crop" />
              </SelectTrigger>
              <SelectContent>
                {crops.map(crop => (
                  <SelectItem key={crop} value={crop}>{crop}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="area">Land Area (acres) *</Label>
            <Input
              id="area"
              type="number"
              placeholder="e.g., 5"
              value={formData.landArea}
              onChange={(e) => setFormData({ ...formData, landArea: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="soil">Soil Type</Label>
            <Select value={formData.soilType} onValueChange={(v) => setFormData({ ...formData, soilType: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Select soil" />
              </SelectTrigger>
              <SelectContent>
                {soilTypes.map(soil => (
                  <SelectItem key={soil} value={soil}>{soil}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="irrigation">Irrigation Type</Label>
            <Select value={formData.irrigationType} onValueChange={(v) => setFormData({ ...formData, irrigationType: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {irrigationTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button onClick={calculateWaterPlan} disabled={isLoading} className="w-full">
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Generate Water Plan"}
        </Button>

        {result && (
          <div className="mt-4 space-y-4">
            <div className="p-4 bg-blue-50 rounded-xl">
              <div className="flex items-center gap-3 mb-3">
                <Waves className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold text-blue-700">{result.totalWater.toLocaleString()} mm</p>
                  <p className="text-sm text-muted-foreground">Total Water Requirement (Season)</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Irrigation Schedule
              </h4>
              {result.schedule.map((phase, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg text-sm">
                  <div>
                    <p className="font-medium">{phase.phase}</p>
                    <p className="text-xs text-muted-foreground">{phase.frequency}</p>
                  </div>
                  <span className="text-blue-600 font-semibold">{phase.water} mm</span>
                </div>
              ))}
            </div>

            <div className="p-3 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">💡 Tips</h4>
              <ul className="text-sm text-green-700 space-y-1">
                {result.tips.map((tip, index) => (
                  <li key={index}>• {tip}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
