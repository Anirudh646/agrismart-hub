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
import { Calculator, Loader2, Beaker, Leaf } from "lucide-react";

const crops = ["Wheat", "Rice", "Cotton", "Maize", "Sugarcane", "Mustard", "Soybean", "Groundnut", "Potato", "Onion"];
const soilTypes = ["Sandy", "Loamy", "Clay", "Silty", "Black Cotton"];
const fertilizers = [
  { name: "Urea (46% N)", baseRate: 60, unit: "kg/acre" },
  { name: "DAP (18-46-0)", baseRate: 50, unit: "kg/acre" },
  { name: "MOP (0-0-60)", baseRate: 30, unit: "kg/acre" },
  { name: "NPK 10-26-26", baseRate: 75, unit: "kg/acre" },
  { name: "SSP (16% P)", baseRate: 100, unit: "kg/acre" },
  { name: "Zinc Sulphate", baseRate: 10, unit: "kg/acre" },
  { name: "Borax", baseRate: 5, unit: "kg/acre" },
];

export function DoseCalculator() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ dose: number; notes: string } | null>(null);
  
  const [formData, setFormData] = useState({
    crop: "",
    landArea: "",
    soilType: "",
    fertilizer: "",
  });

  const calculateDose = async () => {
    if (!formData.crop || !formData.landArea || !formData.fertilizer) {
      toast({ title: "Error", description: "Please fill all required fields", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    
    const selectedFertilizer = fertilizers.find(f => f.name === formData.fertilizer);
    const baseRate = selectedFertilizer?.baseRate || 50;
    const area = parseFloat(formData.landArea);
    
    // Adjust based on soil type
    let soilMultiplier = 1;
    if (formData.soilType === "Sandy") soilMultiplier = 1.2;
    else if (formData.soilType === "Clay") soilMultiplier = 0.9;
    else if (formData.soilType === "Black Cotton") soilMultiplier = 0.85;
    
    const calculatedDose = Math.round(baseRate * area * soilMultiplier);
    
    const notes = `Recommended dose for ${formData.crop} on ${area} acres of ${formData.soilType || "average"} soil. Apply in 2-3 split doses for best results.`;

    // Save to database
    if (user) {
      await supabase.from("dose_calculations").insert({
        user_id: user.id,
        crop_name: formData.crop,
        land_area: area,
        soil_type: formData.soilType || null,
        fertilizer_type: formData.fertilizer,
        calculated_dose: calculatedDose,
        unit: "kg",
        notes,
      } as never);
    }

    setResult({ dose: calculatedDose, notes });
    setIsLoading(false);
    
    toast({ title: "Calculation Complete", description: "Your fertilizer dose has been calculated" });
  };

  return (
    <Card className="border-2 border-secondary/20">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center">
            <Calculator className="w-5 h-5 text-secondary-foreground" />
          </div>
          <div>
            <CardTitle className="text-lg">Fertilizer Dose Calculator</CardTitle>
            <CardDescription>Calculate optimal fertilizer quantity</CardDescription>
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
            <Label htmlFor="fertilizer">Fertilizer *</Label>
            <Select value={formData.fertilizer} onValueChange={(v) => setFormData({ ...formData, fertilizer: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Select fertilizer" />
              </SelectTrigger>
              <SelectContent>
                {fertilizers.map(f => (
                  <SelectItem key={f.name} value={f.name}>{f.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button onClick={calculateDose} disabled={isLoading} className="w-full">
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Calculate Dose"}
        </Button>

        {result && (
          <div className="mt-4 p-4 bg-primary/10 rounded-xl space-y-3">
            <div className="flex items-center gap-3">
              <Beaker className="w-8 h-8 text-primary" />
              <div>
                <p className="text-2xl font-bold text-primary">{result.dose} kg</p>
                <p className="text-sm text-muted-foreground">Recommended Dose</p>
              </div>
            </div>
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <Leaf className="w-4 h-4 mt-0.5 text-green-600" />
              <p>{result.notes}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
