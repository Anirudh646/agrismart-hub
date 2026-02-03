import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TrendingUp, TrendingDown, Minus, Search, Filter, ArrowUpDown } from "lucide-react";
import { useState } from "react";

const allCrops = [
  { name: "Wheat", price: 2450, change: 2.5, mandi: "Karnal", state: "Haryana", emoji: "🌾" },
  { name: "Rice (Basmati)", price: 4200, change: 3.2, mandi: "Karnal", state: "Haryana", emoji: "🍚" },
  { name: "Rice (Common)", price: 2100, change: -1.2, mandi: "Ludhiana", state: "Punjab", emoji: "🍚" },
  { name: "Cotton", price: 6800, change: 0, mandi: "Sirsa", state: "Haryana", emoji: "🧶" },
  { name: "Soybean", price: 4150, change: 3.8, mandi: "Indore", state: "Madhya Pradesh", emoji: "🫘" },
  { name: "Maize", price: 1850, change: -0.5, mandi: "Davangere", state: "Karnataka", emoji: "🌽" },
  { name: "Sugarcane", price: 350, change: 1.2, mandi: "Muzaffarnagar", state: "Uttar Pradesh", emoji: "🎋" },
  { name: "Potato", price: 1200, change: -2.3, mandi: "Agra", state: "Uttar Pradesh", emoji: "🥔" },
  { name: "Onion", price: 2800, change: 5.5, mandi: "Nashik", state: "Maharashtra", emoji: "🧅" },
  { name: "Tomato", price: 3200, change: -4.2, mandi: "Kolar", state: "Karnataka", emoji: "🍅" },
  { name: "Mustard", price: 5100, change: 1.8, mandi: "Alwar", state: "Rajasthan", emoji: "🌿" },
  { name: "Groundnut", price: 5800, change: 2.1, mandi: "Rajkot", state: "Gujarat", emoji: "🥜" },
];

const MarketPrices = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"price" | "change">("change");

  const filteredCrops = allCrops
    .filter((crop) =>
      crop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      crop.mandi.toLowerCase().includes(searchQuery.toLowerCase()) ||
      crop.state.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "price") return b.price - a.price;
      return Math.abs(b.change) - Math.abs(a.change);
    });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Market Prices
            </h1>
            <p className="text-muted-foreground">
              Real-time crop prices from mandis across India • Updated every hour
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search by crop, mandi, or state..."
                className="pl-10 h-12"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={sortBy === "change" ? "default" : "outline"}
                onClick={() => setSortBy("change")}
                className="h-12"
              >
                <ArrowUpDown className="w-4 h-4 mr-2" />
                By Change
              </Button>
              <Button
                variant={sortBy === "price" ? "default" : "outline"}
                onClick={() => setSortBy("price")}
                className="h-12"
              >
                <ArrowUpDown className="w-4 h-4 mr-2" />
                By Price
              </Button>
            </div>
          </div>

          {/* Price Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredCrops.map((crop, index) => (
              <Card key={index} className="card-hover border border-border/50">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{crop.emoji}</span>
                      <div>
                        <h3 className="font-semibold text-foreground">{crop.name}</h3>
                        <p className="text-xs text-muted-foreground">{crop.mandi}, {crop.state}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-2xl font-bold text-foreground">₹{crop.price.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">Per Quintal</p>
                    </div>
                    <div className={`flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-lg ${
                      crop.change > 0 
                        ? "text-primary bg-primary/10" 
                        : crop.change < 0 
                        ? "text-destructive bg-destructive/10" 
                        : "text-muted-foreground bg-muted"
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
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Empty State */}
          {filteredCrops.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">No crops found matching "{searchQuery}"</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MarketPrices;
