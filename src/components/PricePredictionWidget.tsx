import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, Loader2, IndianRupee } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PredictionData {
  currentPrice: number;
  predictedPrices: {
    "1week": number;
    "2weeks": number;
    "1month": number;
    "3months": number;
  };
  trend: "rising" | "falling" | "stable";
  confidence: number;
  bestTimeToSell: string;
  factors: string[];
  recommendation: string;
}

export function PricePredictionWidget() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [cropName, setCropName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [prediction, setPrediction] = useState<PredictionData | null>(null);

  const getPrediction = async () => {
    if (!cropName.trim()) {
      toast({
        title: "Enter crop name",
        description: "Please enter a crop name to get price prediction",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/price-prediction`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ cropName, location: "India" }),
        }
      );

      const data = await response.json();
      if (data.error) throw new Error(data.error);
      
      setPrediction(data.prediction);
    } catch (error) {
      console.error("Prediction error:", error);
      toast({
        title: "Prediction failed",
        description: error instanceof Error ? error.message : "Failed to get prediction",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getTrendIcon = () => {
    if (!prediction) return null;
    switch (prediction.trend) {
      case "rising": return <TrendingUp className="w-5 h-5 text-green-500" />;
      case "falling": return <TrendingDown className="w-5 h-5 text-red-500" />;
      default: return <Minus className="w-5 h-5 text-yellow-500" />;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <IndianRupee className="w-5 h-5 text-primary" />
          {t("prediction.title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Enter crop name (e.g., Wheat, Rice)"
            value={cropName}
            onChange={(e) => setCropName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && getPrediction()}
          />
          <Button onClick={getPrediction} disabled={isLoading}>
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Predict"}
          </Button>
        </div>

        {prediction && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-muted rounded-lg text-center">
                <p className="text-xs text-muted-foreground">{t("prediction.currentPrice")}</p>
                <p className="text-xl font-bold">₹{prediction.currentPrice}</p>
                <p className="text-xs text-muted-foreground">per quintal</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg text-center">
                <p className="text-xs text-muted-foreground">1 Month Predicted</p>
                <p className="text-xl font-bold text-primary">₹{prediction.predictedPrices["1month"]}</p>
                <div className="flex items-center justify-center gap-1">
                  {getTrendIcon()}
                  <span className="text-xs">{prediction.trend}</span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
              <p className="text-sm font-medium text-green-700 dark:text-green-400">
                {t("prediction.bestTime")}:
              </p>
              <p className="text-sm">{prediction.bestTimeToSell}</p>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Confidence</span>
              <Badge variant={prediction.confidence > 70 ? "default" : "secondary"}>
                {prediction.confidence}%
              </Badge>
            </div>

            <p className="text-sm text-muted-foreground">{prediction.recommendation}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
