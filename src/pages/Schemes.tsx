import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Clock, Tag, Search, ArrowRight, FileText, CheckCircle } from "lucide-react";
import { useState } from "react";

const allSchemes = [
  {
    id: 1,
    title: "PM-KISAN Samman Nidhi",
    description: "Direct income support of ₹6,000 per year to eligible farmer families in three equal installments of ₹2,000 each.",
    deadline: "Always Open",
    category: "Income Support",
    eligibility: ["Small and marginal farmers", "Land ownership records required", "Aadhar linked bank account"],
    benefits: ["₹6,000 annual support", "Direct bank transfer", "No intermediaries"],
    isNew: true,
  },
  {
    id: 2,
    title: "Pradhan Mantri Fasal Bima Yojana",
    description: "Comprehensive crop insurance scheme covering all stages of the crop cycle including post-harvest losses.",
    deadline: "Kharif: July 31 | Rabi: Dec 31",
    category: "Insurance",
    eligibility: ["All farmers including sharecroppers", "Crop loan borrowers (compulsory)", "Non-loanee farmers (voluntary)"],
    benefits: ["Low premium rates", "Full sum insured coverage", "Quick claim settlement"],
    isNew: false,
  },
  {
    id: 3,
    title: "Kisan Credit Card Scheme",
    description: "Affordable credit facility for farmers with flexible repayment options, low interest rates, and crop insurance coverage.",
    deadline: "Always Open",
    category: "Credit",
    eligibility: ["Owner cultivators", "Tenant farmers", "Oral lessees and sharecroppers"],
    benefits: ["Up to ₹3 lakh credit limit", "4% interest rate (with subvention)", "Insurance coverage included"],
    isNew: false,
  },
  {
    id: 4,
    title: "Soil Health Card Scheme",
    description: "Free soil testing and expert recommendations for balanced use of fertilizers to improve soil health and productivity.",
    deadline: "Always Open",
    category: "Soil Health",
    eligibility: ["All farmers", "No documents required", "Available at local agriculture office"],
    benefits: ["Free soil testing", "Nutrient recommendations", "Improved crop yield"],
    isNew: true,
  },
  {
    id: 5,
    title: "Pradhan Mantri Krishi Sinchai Yojana",
    description: "Irrigation support scheme for water conservation and efficient water usage through micro-irrigation systems.",
    deadline: "State-wise deadlines",
    category: "Irrigation",
    eligibility: ["All farmers", "Priority to small and marginal farmers", "Land ownership/lease document"],
    benefits: ["55-75% subsidy on micro-irrigation", "Drip and sprinkler systems", "Water saving technology"],
    isNew: false,
  },
  {
    id: 6,
    title: "National Mission for Sustainable Agriculture",
    description: "Promoting sustainable farming practices, organic farming, and climate-resilient agriculture techniques.",
    deadline: "Rolling basis",
    category: "Sustainability",
    eligibility: ["Farmers interested in organic farming", "Farmer groups and FPOs", "Agricultural land owners"],
    benefits: ["Training and capacity building", "Organic certification support", "Market linkage assistance"],
    isNew: true,
  },
];

const Schemes = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [expandedScheme, setExpandedScheme] = useState<number | null>(null);

  const categories = ["All", "Income Support", "Insurance", "Credit", "Soil Health", "Irrigation", "Sustainability"];

  const filteredSchemes = allSchemes.filter((scheme) => {
    const matchesSearch = scheme.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scheme.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || scheme.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Schemes Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredSchemes.map((scheme) => (
              <Card key={scheme.id} className="border border-border/50 card-hover">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        <Tag className="w-3 h-3" />
                        {scheme.category}
                      </span>
                      {scheme.isNew && (
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-accent text-accent-foreground">
                          New
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>{scheme.deadline}</span>
                    </div>
                  </div>
                  <CardTitle className="text-xl">{scheme.title}</CardTitle>
                  <CardDescription className="text-base">{scheme.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  {expandedScheme === scheme.id && (
                    <div className="space-y-4 mb-4 animate-fade-in">
                      <div>
                        <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          Eligibility
                        </h4>
                        <ul className="space-y-1">
                          {scheme.eligibility.map((item, index) => (
                            <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          Benefits
                        </h4>
                        <ul className="space-y-1">
                          {scheme.benefits.map((item, index) => (
                            <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <Button
                      variant="ghost"
                      onClick={() => setExpandedScheme(expandedScheme === scheme.id ? null : scheme.id)}
                    >
                      {expandedScheme === scheme.id ? "Show Less" : "Learn More"}
                    </Button>
                    <Button variant="default">
                      Apply Now
                      <ArrowRight className="w-4 h-4" />
                    </Button>
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
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Schemes;
