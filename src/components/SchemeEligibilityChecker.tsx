import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, FileText, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Scheme {
  id: string;
  title: string;
  eligibility: string | null;
  benefits: string | null;
  category: string | null;
}

interface EligibilityResult {
  schemeId: string;
  schemeName: string;
  eligible: boolean;
  reason: string;
  matchScore: number;
}

export function SchemeEligibilityChecker() {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const [isChecking, setIsChecking] = useState(false);
  const [results, setResults] = useState<EligibilityResult[]>([]);

  const checkEligibility = async () => {
    setIsChecking(true);
    try {
      const { data: schemes } = await supabase
        .from("schemes")
        .select("id, title, eligibility, benefits, category")
        .eq("is_active", true);

      if (!schemes) return;

      // Simple eligibility matching based on profile
      const eligibilityResults: EligibilityResult[] = schemes.map((scheme: Scheme) => {
        const eligibility = scheme.eligibility?.toLowerCase() || "";
        let matchScore = 50; // Base score
        let reasons: string[] = [];

        // Check state match
        if (profile?.state && eligibility.includes(profile.state.toLowerCase())) {
          matchScore += 20;
          reasons.push("Location match");
        }

        // Check category keywords
        if (eligibility.includes("all farmer") || eligibility.includes("सभी किसान")) {
          matchScore += 30;
          reasons.push("Open to all farmers");
        }

        if (eligibility.includes("small") && profile?.village) {
          matchScore += 15;
          reasons.push("Small farmer benefits");
        }

        const eligible = matchScore >= 60;

        return {
          schemeId: scheme.id,
          schemeName: scheme.title,
          eligible,
          reason: reasons.length > 0 ? reasons.join(", ") : "Basic eligibility met",
          matchScore: Math.min(matchScore, 100)
        };
      });

      // Sort by match score
      eligibilityResults.sort((a, b) => b.matchScore - a.matchScore);
      setResults(eligibilityResults);
    } catch (error) {
      console.error("Error checking eligibility:", error);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileText className="w-5 h-5 text-primary" />
          {t("eligibility.title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={checkEligibility} 
          disabled={isChecking}
          className="w-full"
        >
          {isChecking ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Checking...
            </>
          ) : (
            t("eligibility.check")
          )}
        </Button>

        {results.length > 0 && (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {results.slice(0, 5).map((result) => (
              <div 
                key={result.schemeId}
                className={`p-3 rounded-lg border ${
                  result.eligible 
                    ? "bg-green-500/10 border-green-500/20" 
                    : "bg-muted border-border"
                }`}
              >
                <div className="flex items-start gap-2">
                  {result.eligible ? (
                    <CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-muted-foreground mt-1 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-sm">{result.schemeName}</p>
                    <p className="text-xs text-muted-foreground">{result.reason}</p>
                  </div>
                  <Badge variant={result.eligible ? "default" : "secondary"}>
                    {result.matchScore}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
