import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Clock, Tag, Search, ArrowRight, FileText, CheckCircle, ExternalLink, Loader2 } from "lucide-react";

interface Scheme {
  id: string;
  title: string;
  description: string;
  deadline: string | null;
  category: string | null;
  eligibility: string | null;
  benefits: string | null;
  link: string | null;
  is_active: boolean;
}

// Static fallback schemes
const staticSchemes: Scheme[] = [
  {
    id: "1",
    title: "PM-KISAN Samman Nidhi",
    description: "Direct income support of ₹6,000 per year to eligible farmer families in three equal installments of ₹2,000 each.",
    deadline: "Always Open",
    category: "subsidy",
    eligibility: "Small and marginal farmers with land ownership records and Aadhar linked bank account",
    benefits: "₹6,000 annual support with direct bank transfer",
    link: "https://pmkisan.gov.in/",
    is_active: true,
  },
  {
    id: "2",
    title: "Pradhan Mantri Fasal Bima Yojana",
    description: "Comprehensive crop insurance scheme covering all stages of the crop cycle including post-harvest losses.",
    deadline: "Kharif: July 31 | Rabi: Dec 31",
    category: "insurance",
    eligibility: "All farmers including sharecroppers, crop loan borrowers (compulsory), non-loanee farmers (voluntary)",
    benefits: "Low premium rates, full sum insured coverage, quick claim settlement",
    link: "https://pmfby.gov.in/",
    is_active: true,
  },
  {
    id: "3",
    title: "Kisan Credit Card Scheme",
    description: "Affordable credit facility for farmers with flexible repayment options, low interest rates, and crop insurance coverage.",
    deadline: "Always Open",
    category: "loan",
    eligibility: "Owner cultivators, tenant farmers, oral lessees and sharecroppers",
    benefits: "Up to ₹3 lakh credit limit at 4% interest rate with insurance coverage",
    link: null,
    is_active: true,
  },
  {
    id: "4",
    title: "Soil Health Card Scheme",
    description: "Free soil testing and expert recommendations for balanced use of fertilizers to improve soil health and productivity.",
    deadline: "Always Open",
    category: "training",
    eligibility: "All farmers, no documents required, available at local agriculture office",
    benefits: "Free soil testing, nutrient recommendations, improved crop yield",
    link: "https://soilhealth.dac.gov.in/",
    is_active: true,
  },
  {
    id: "5",
    title: "Pradhan Mantri Krishi Sinchai Yojana",
    description: "Irrigation support scheme for water conservation and efficient water usage through micro-irrigation systems.",
    deadline: "State-wise deadlines",
    category: "equipment",
    eligibility: "All farmers with priority to small and marginal farmers, land ownership/lease document",
    benefits: "55-75% subsidy on micro-irrigation, drip and sprinkler systems",
    link: "https://pmksy.gov.in/",
    is_active: true,
  },
  {
    id: "6",
    title: "National Mission for Sustainable Agriculture",
    description: "Promoting sustainable farming practices, organic farming, and climate-resilient agriculture techniques.",
    deadline: "Rolling basis",
    category: "training",
    eligibility: "Farmers interested in organic farming, farmer groups and FPOs, agricultural land owners",
    benefits: "Training, organic certification support, market linkage assistance",
    link: null,
    is_active: true,
  },
];

const Schemes = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [expandedScheme, setExpandedScheme] = useState<string | null>(null);
  const [schemes, setSchemes] = useState<Scheme[]>(staticSchemes);
  const [isLoading, setIsLoading] = useState(true);

  const categories = ["All", "subsidy", "insurance", "loan", "training", "equipment"];

  useEffect(() => {
    fetchSchemes();
  }, []);

  const fetchSchemes = async () => {
    try {
      const { data, error } = await supabase
        .from("schemes")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Merge database schemes with static ones (database takes priority)
      if (data && data.length > 0) {
        setSchemes([...data, ...staticSchemes]);
      }
    } catch (error) {
      console.error("Error fetching schemes:", error);
      // Keep static schemes as fallback
    } finally {
      setIsLoading(false);
    }
  };

  const filteredSchemes = schemes.filter((scheme) => {
    const matchesSearch = scheme.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scheme.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || scheme.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      subsidy: "Subsidy",
      insurance: "Insurance",
      loan: "Credit/Loan",
      training: "Training",
      equipment: "Equipment",
    };
    return labels[category] || category;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Government Schemes
            </h1>
            <p className="text-muted-foreground">
              Explore agricultural schemes, subsidies, and support programs for farmers
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-col gap-4 mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search schemes..."
                className="pl-10 h-12 max-w-md"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedCategory === category
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category === "All" ? "All" : getCategoryLabel(category)}
                </button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Schemes Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredSchemes.map((scheme) => (
                  <Card key={scheme.id} className="border border-border/50 card-hover">
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                            <Tag className="w-3 h-3" />
                            {getCategoryLabel(scheme.category || "subsidy")}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>{scheme.deadline || "Always Open"}</span>
                        </div>
                      </div>
                      <CardTitle className="text-xl">{scheme.title}</CardTitle>
                      <CardDescription className="text-base">{scheme.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {expandedScheme === scheme.id && (
                        <div className="space-y-4 mb-4 animate-fade-in">
                          {scheme.eligibility && (
                            <div>
                              <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                Eligibility
                              </h4>
                              <p className="text-sm text-muted-foreground">{scheme.eligibility}</p>
                            </div>
                          )}
                          {scheme.benefits && (
                            <div>
                              <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                                <CheckCircle className="w-4 h-4" />
                                Benefits
                              </h4>
                              <p className="text-sm text-muted-foreground">{scheme.benefits}</p>
                            </div>
                          )}
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <Button
                          variant="ghost"
                          onClick={() => setExpandedScheme(expandedScheme === scheme.id ? null : scheme.id)}
                        >
                          {expandedScheme === scheme.id ? "Show Less" : "Learn More"}
                        </Button>
                        {scheme.link ? (
                          <a href={scheme.link} target="_blank" rel="noopener noreferrer">
                            <Button variant="default" className="gap-2">
                              Apply Now
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          </a>
                        ) : (
                          <Button variant="default">
                            Apply Now
                            <ArrowRight className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Empty State */}
              {filteredSchemes.length === 0 && (
                <div className="text-center py-16">
                  <p className="text-muted-foreground text-lg">No schemes found matching your criteria</p>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Schemes;
