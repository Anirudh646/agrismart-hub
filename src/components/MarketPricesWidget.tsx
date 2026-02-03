import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

const crops = [
  { name: "Wheat", price: 2450, change: 2.5, unit: "Quintal", emoji: "🌾" },
  { name: "Rice", price: 3200, change: -1.2, unit: "Quintal", emoji: "🍚" },
  { name: "Cotton", price: 6800, change: 0, unit: "Quintal", emoji: "🧶" },
  { name: "Soybean", price: 4150, change: 3.8, unit: "Quintal", emoji: "🫘" },
  { name: "Maize", price: 1850, change: -0.5, unit: "Quintal", emoji: "🌽" },
  { name: "Sugarcane", price: 350, change: 1.2, unit: "Quintal", emoji: "🎋" },
];

const MarketPricesWidget = () => {
  return (
    <section className="py-20 bg-card">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Today's Market Prices
            </h2>
            <p className="text-muted-foreground">
              Latest crop prices from major mandis • Updated hourly
            </p>
          </div>
          <a href="/market-prices" className="mt-4 md:mt-0 text-primary font-semibold hover:underline">
            View All Prices →
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {crops.map((crop, index) => (
            <Card key={index} className="card-hover border border-border/50 bg-gradient-card">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{crop.emoji}</span>
                    <div>
                      <h3 className="font-semibold text-foreground">{crop.name}</h3>
                      <p className="text-sm text-muted-foreground">Per {crop.unit}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-foreground">₹{crop.price.toLocaleString()}</p>
                    <div className={`flex items-center gap-1 text-sm font-medium ${
                      crop.change > 0 ? "text-primary" : crop.change < 0 ? "text-destructive" : "text-muted-foreground"
                    }`}>
                      {crop.change > 0 ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : crop.change < 0 ? (
                        <TrendingDown className="w-4 h-4" />
                      ) : (
                        <Minus className="w-4 h-4" />
                      )}
                      {crop.change > 0 ? "+" : ""}{crop.change}%
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MarketPricesWidget;
