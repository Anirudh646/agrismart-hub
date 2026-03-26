import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import { Sprout, Users, BarChart3, Shield, Mail, Phone, MapPin } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />

        {/* About Section */}
        <section id="about" className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">About KrishiSathi</h2>
              <p className="text-lg text-muted-foreground">
                KrishiSathi is an AI-powered platform built to empower Indian farmers with smart tools, real-time data, and government scheme access — all in one place.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-background border border-border">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Sprout className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">AI-Powered Advisory</h3>
                <p className="text-sm text-muted-foreground">Get personalized crop recommendations, disease detection, and farming tips powered by advanced AI.</p>
              </div>
              <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-background border border-border">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Market Intelligence</h3>
                <p className="text-sm text-muted-foreground">Track real-time market prices, price predictions, and crop comparison tools to maximize your profits.</p>
              </div>
              <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-background border border-border">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Government Schemes</h3>
                <p className="text-sm text-muted-foreground">Check eligibility and apply for government schemes designed for farmers — never miss a benefit.</p>
              </div>
            </div>
          </div>
        </section>

        <CTASection />

        {/* Contact Section */}
        <section id="contact" className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">Contact Us</h2>
              <p className="text-lg text-muted-foreground">
                Have questions or need support? Reach out to us anytime.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 max-w-3xl mx-auto">
              <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-background border border-border">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">Email</h3>
                <p className="text-sm text-muted-foreground">support@krishisathi.in</p>
              </div>
              <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-background border border-border">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Phone className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">Phone</h3>
                <p className="text-sm text-muted-foreground">+91 1800-XXX-XXXX (Toll Free)</p>
              </div>
              <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-background border border-border">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">Location</h3>
                <p className="text-sm text-muted-foreground">New Delhi, India</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
