import { Link } from "react-router-dom";
import { Sprout, Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-foreground text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <Sprout className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">KrishiMitra</span>
            </Link>
            <p className="text-primary-foreground/70 text-sm leading-relaxed">
              Empowering farmers with digital solutions for better agriculture. Access schemes, market prices, weather updates, and AI-powered crop advisory.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-9 h-9 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary transition-colors">
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/schemes" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm">
                  Government Schemes
                </Link>
              </li>
              <li>
                <Link to="/market-prices" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm">
                  Market Prices
                </Link>
              </li>
              <li>
                <Link to="/weather" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm">
                  Weather Forecast
                </Link>
              </li>
              <li>
                <Link to="/ai-advisory" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm">
                  AI Crop Advisory
                </Link>
              </li>
              <li>
                <Link to="/support" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm">
                  Farmer Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Services</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm">
                  Crop Information
                </a>
              </li>
              <li>
                <a href="#" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm">
                  Disease Detection
                </a>
              </li>
              <li>
                <a href="#" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm">
                  Fertilizer Guide
                </a>
              </li>
              <li>
                <a href="#" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm">
                  Expert Consultation
                </a>
              </li>
              <li>
                <a href="#" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm">
                  Training Programs
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm text-primary-foreground/70">
                <MapPin className="w-4 h-4 shrink-0" />
                Agriculture Department, District Office
              </li>
              <li className="flex items-center gap-3 text-sm text-primary-foreground/70">
                <Phone className="w-4 h-4 shrink-0" />
                1800-XXX-XXXX (Toll Free)
              </li>
              <li className="flex items-center gap-3 text-sm text-primary-foreground/70">
                <Mail className="w-4 h-4 shrink-0" />
                support@krishimitra.gov.in
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/10 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-primary-foreground/60">
            © 2024 KrishiMitra. All rights reserved. | Government of India Initiative
          </p>
          <div className="flex gap-6 text-sm">
            <a href="#" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors">
              Terms of Service
            </a>
            <a href="#" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors">
              Accessibility
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
