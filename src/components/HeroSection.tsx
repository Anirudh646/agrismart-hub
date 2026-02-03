import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-farm.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Beautiful farmland"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/90 via-foreground/70 to-foreground/40" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10 pt-20">
        <div className="max-w-2xl text-primary-foreground">
          <div className="inline-flex items-center gap-2 bg-primary/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="text-sm font-medium text-primary-foreground/90">Smart Agriculture Portal</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 animate-fade-in-up">
            Empowering Farmers with
            <span className="block text-accent mt-2">Digital Agriculture</span>
          </h1>

          <p className="text-lg md:text-xl text-primary-foreground/80 mb-8 leading-relaxed animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            Access government schemes, real-time market prices, weather forecasts, and AI-powered crop advisory all in one place. Your complete agricultural companion.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            <Link to="/register">
              <Button variant="hero" size="xl" className="w-full sm:w-auto">
                Get Started
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Button
              variant="outline"
              size="xl"
              className="w-full sm:w-auto border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
            >
              <Play className="w-5 h-5" />
              Watch Demo
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 mt-12 pt-8 border-t border-primary-foreground/20 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
            <div>
              <p className="text-3xl md:text-4xl font-bold text-accent">50K+</p>
              <p className="text-sm text-primary-foreground/70 mt-1">Registered Farmers</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold text-accent">100+</p>
              <p className="text-sm text-primary-foreground/70 mt-1">Government Schemes</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold text-accent">24/7</p>
              <p className="text-sm text-primary-foreground/70 mt-1">Support Available</p>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute bottom-8 right-8 hidden lg:block animate-float">
        <div className="bg-card/95 backdrop-blur-sm rounded-2xl p-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <span className="text-2xl">🌾</span>
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Wheat Price Today</p>
              <p className="text-lg font-bold text-primary">₹2,450/Quintal</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
