import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock, Tag } from "lucide-react";
import { Link } from "react-router-dom";

const schemes = [
  {
    id: 1,
    title: "PM-KISAN Samman Nidhi",
    description: "Direct income support of ₹6,000 per year to eligible farmer families in three equal installments.",
    deadline: "Always Open",
    category: "Income Support",
    isNew: true,
  },
  {
    id: 2,
    title: "Pradhan Mantri Fasal Bima Yojana",
    description: "Comprehensive crop insurance scheme covering all stages of the crop cycle including prevented sowing.",
    deadline: "31 Dec 2024",
    category: "Insurance",
    isNew: false,
  },
  {
    id: 3,
    title: "Kisan Credit Card Scheme",
    description: "Affordable credit facility for farmers with flexible repayment options and low interest rates.",
    deadline: "Always Open",
    category: "Credit",
    isNew: false,
  },
  {
    id: 4,
    title: "Soil Health Card Scheme",
    description: "Free soil testing and recommendations for balanced use of fertilizers to improve soil health.",
    deadline: "Always Open",
    category: "Soil Health",
    isNew: true,
  },
];

const SchemesSection = () => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Government Schemes
            </h2>
            <p className="text-muted-foreground">
              Latest agricultural schemes and subsidies for farmers
            </p>
          </div>
          <Link to="/schemes" className="mt-4 md:mt-0">
            <Button variant="outline">
              View All Schemes
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {schemes.map((scheme) => (
            <Card key={scheme.id} className="card-hover border border-border/50">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
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
                </div>
                
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {scheme.title}
                </h3>
                <p className="text-muted-foreground mb-4 line-clamp-2">
                  {scheme.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>Deadline: {scheme.deadline}</span>
                  </div>
                  <Button variant="link" className="p-0 h-auto text-primary">
                    Learn More →
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SchemesSection;
