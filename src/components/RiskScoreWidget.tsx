import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, CloudRain, Bug, TrendingDown, Shield } from "lucide-react";

interface RiskData {
  weather: number;
  pest: number;
  market: number;
  overall: number;
}

interface RiskScoreWidgetProps {
  location?: string;
  crops?: string[];
}

export function RiskScoreWidget({ location, crops = [] }: RiskScoreWidgetProps) {
  const { t } = useTranslation();
  
  // Calculate mock risk scores based on season and crops
  const calculateRisks = (): RiskData => {
    const month = new Date().getMonth();
    const isMonSoon = month >= 5 && month <= 9;
    
    return {
      weather: isMonSoon ? 65 : 30,
      pest: crops.length > 0 ? 45 : 25,
      market: 40,
      overall: 0
    };
  };

  const [risks] = useState<RiskData>(() => {
    const r = calculateRisks();
    r.overall = Math.round((r.weather + r.pest + r.market) / 3);
    return r;
  });

  const getRiskLevel = (score: number) => {
    if (score < 35) return { label: t("risk.low"), color: "text-green-500", bg: "bg-green-500" };
    if (score < 65) return { label: t("risk.medium"), color: "text-yellow-500", bg: "bg-yellow-500" };
    return { label: t("risk.high"), color: "text-red-500", bg: "bg-red-500" };
  };

  const overallRisk = getRiskLevel(risks.overall);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Shield className="w-5 h-5 text-primary" />
          {t("risk.title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Risk */}
        <div className="text-center p-4 bg-muted rounded-lg">
          <div className={`text-4xl font-bold ${overallRisk.color}`}>
            {risks.overall}%
          </div>
          <div className={`text-sm font-medium ${overallRisk.color}`}>
            {overallRisk.label} {t("risk.overall")}
          </div>
        </div>

        {/* Individual Risks */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <CloudRain className="w-4 h-4 text-blue-500" />
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-1">
                <span>{t("risk.weather")}</span>
                <span className={getRiskLevel(risks.weather).color}>{risks.weather}%</span>
              </div>
              <Progress value={risks.weather} className="h-2" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Bug className="w-4 h-4 text-orange-500" />
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-1">
                <span>{t("risk.pest")}</span>
                <span className={getRiskLevel(risks.pest).color}>{risks.pest}%</span>
              </div>
              <Progress value={risks.pest} className="h-2" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <TrendingDown className="w-4 h-4 text-purple-500" />
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-1">
                <span>{t("risk.market")}</span>
                <span className={getRiskLevel(risks.market).color}>{risks.market}%</span>
              </div>
              <Progress value={risks.market} className="h-2" />
            </div>
          </div>
        </div>

        {risks.overall > 50 && (
          <div className="flex items-start gap-2 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
            <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-yellow-700 dark:text-yellow-400">
              {risks.weather > 50 && "Heavy rainfall expected. Consider drainage preparation. "}
              {risks.pest > 50 && "High pest activity season. Monitor crops closely. "}
              {risks.market > 50 && "Price volatility expected. Consider staggered selling."}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
