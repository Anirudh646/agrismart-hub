import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Scale, Plus, X, Loader2, TrendingUp, Droplets, Calendar, IndianRupee } from "lucide-react";

interface CropData {
  name: string;
  yield: number;
  waterNeed: string;
  duration: string;
  pricePerQuintal: number;
  profitPerAcre: number;
  risk: "Low" | "Medium" | "High";
}

const mockCropData: Record<string, CropData> = {
  wheat: { name: "Wheat", yield: 20, waterNeed: "Medium", duration: "120-150 days", pricePerQuintal: 2125, profitPerAcre: 25000, risk: "Low" },
  rice: { name: "Rice", yield: 25, waterNeed: "High", duration: "100-150 days", pricePerQuintal: 2040, profitPerAcre: 30000, risk: "Medium" },
  cotton: { name: "Cotton", yield: 8, waterNeed: "Medium", duration: "150-180 days", pricePerQuintal: 6620, profitPerAcre: 35000, risk: "High" },
  mustard: { name: "Mustard", yield: 8, waterNeed: "Low", duration: "110-140 days", pricePerQuintal: 5050, profitPerAcre: 22000, risk: "Low" },
  sugarcane: { name: "Sugarcane", yield: 350, waterNeed: "Very High", duration: "10-12 months", pricePerQuintal: 315, profitPerAcre: 80000, risk: "Medium" },
  maize: { name: "Maize", yield: 25, waterNeed: "Medium", duration: "90-120 days", pricePerQuintal: 1962, profitPerAcre: 28000, risk: "Low" },
  soybean: { name: "Soybean", yield: 12, waterNeed: "Medium", duration: "90-120 days", pricePerQuintal: 4600, profitPerAcre: 32000, risk: "Medium" },
  groundnut: { name: "Groundnut", yield: 15, waterNeed: "Low", duration: "100-130 days", pricePerQuintal: 5850, profitPerAcre: 45000, risk: "Medium" },
};

export function CropComparisonTool() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [crops, setCrops] = useState<string[]>(["", ""]);
  const [results, setResults] = useState<CropData[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const addCrop = () => {
    if (crops.length < 4) {
      setCrops([...crops, ""]);
    }
  };

  const removeCrop = (index: number) => {
    if (crops.length > 2) {
      setCrops(crops.filter((_, i) => i !== index));
    }
  };

  const updateCrop = (index: number, value: string) => {
    const newCrops = [...crops];
    newCrops[index] = value;
    setCrops(newCrops);
  };

  const handleCompare = async () => {
    const validCrops = crops.filter(c => c.trim()).map(c => c.toLowerCase().trim());
    if (validCrops.length < 2) {
      toast({ title: "Error", description: "Please enter at least 2 crops to compare", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    
    // Get comparison data
    const comparisonResults = validCrops.map(crop => {
      return mockCropData[crop] || {
        name: crop.charAt(0).toUpperCase() + crop.slice(1),
        yield: Math.floor(Math.random() * 20) + 10,
        waterNeed: ["Low", "Medium", "High"][Math.floor(Math.random() * 3)],
        duration: `${Math.floor(Math.random() * 60) + 90}-${Math.floor(Math.random() * 60) + 120} days`,
        pricePerQuintal: Math.floor(Math.random() * 4000) + 2000,
        profitPerAcre: Math.floor(Math.random() * 30000) + 20000,
        risk: ["Low", "Medium", "High"][Math.floor(Math.random() * 3)] as "Low" | "Medium" | "High",
      };
    });

    // Save to database
    if (user) {
      await supabase.from("crop_comparisons").insert({
        user_id: user.id,
        crops_compared: validCrops,
        comparison_result: comparisonResults as unknown as Record<string, unknown>,
      } as never);
    }

    setResults(comparisonResults);
    setIsLoading(false);
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "Low": return "bg-green-100 text-green-800";
      case "Medium": return "bg-yellow-100 text-yellow-800";
      case "High": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Scale className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">Crop Comparison Tool</CardTitle>
            <CardDescription>Compare crops for profitability and requirements</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {crops.map((crop, index) => (
            <div key={index} className="flex gap-2">
              <div className="flex-1">
                <Label className="sr-only">Crop {index + 1}</Label>
                <Input
                  placeholder={`Crop ${index + 1} (e.g., Wheat, Rice)`}
                  value={crop}
                  onChange={(e) => updateCrop(index, e.target.value)}
                />
              </div>
              {crops.length > 2 && (
                <Button variant="ghost" size="icon" onClick={() => removeCrop(index)}>
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          {crops.length < 4 && (
            <Button variant="outline" size="sm" onClick={addCrop} className="gap-1">
              <Plus className="w-4 h-4" /> Add Crop
            </Button>
          )}
          <Button onClick={handleCompare} disabled={isLoading} className="flex-1">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Compare Crops"}
          </Button>
        </div>

        {results && (
          <div className="mt-6 space-y-4">
            <h3 className="font-semibold text-foreground">Comparison Results</h3>
            <div className="grid gap-4">
              {results.map((crop, index) => (
                <div key={index} className="bg-muted/50 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-lg">{crop.name}</h4>
                    <Badge className={getRiskColor(crop.risk)}>{crop.risk} Risk</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <span>Yield: {crop.yield} quintals/acre</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Droplets className="w-4 h-4 text-blue-600" />
                      <span>Water: {crop.waterNeed}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-amber-600" />
                      <span>Duration: {crop.duration}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <IndianRupee className="w-4 h-4 text-primary" />
                      <span>₹{crop.pricePerQuintal}/quintal</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-primary font-semibold">
                      Est. Profit: ₹{crop.profitPerAcre.toLocaleString()}/acre
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
