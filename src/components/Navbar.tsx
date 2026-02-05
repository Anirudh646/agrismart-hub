import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Sprout, Menu, X, User } from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, profile, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center group-hover:scale-110 transition-transform">
              <Sprout className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">KrishiMitra</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-muted-foreground hover:text-primary transition-colors font-medium">
              Home
            </Link>
            <Link to="/schemes" className="text-muted-foreground hover:text-primary transition-colors font-medium">
              Schemes
            </Link>
            <Link to="/market-prices" className="text-muted-foreground hover:text-primary transition-colors font-medium">
              Market Prices
            </Link>
            <Link to="/weather" className="text-muted-foreground hover:text-primary transition-colors font-medium">
              Weather
            </Link>
            <Link to="/ai-advisory" className="text-muted-foreground hover:text-primary transition-colors font-medium">
              AI Advisory
            </Link>
            <Link to="/disease-detection" className="text-muted-foreground hover:text-primary transition-colors font-medium">
              Disease Detection
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <User className="w-4 h-4" />
                    {profile?.full_name || "Account"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {isAdmin && (
                    <>
                      <DropdownMenuItem onClick={() => navigate("/admin")}>
                        Admin Dashboard
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                    My Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="outline" size="sm">Login</Button>
                </Link>
                <Link to="/register">
                  <Button variant="hero" size="sm">Register</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-muted"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-border animate-fade-in">
            <div className="flex flex-col gap-4">
              <Link to="/" className="text-foreground hover:text-primary transition-colors font-medium py-2" onClick={() => setIsOpen(false)}>
                Home
              </Link>
              <Link to="/schemes" className="text-foreground hover:text-primary transition-colors font-medium py-2" onClick={() => setIsOpen(false)}>
                Schemes
              </Link>
              <Link to="/market-prices" className="text-foreground hover:text-primary transition-colors font-medium py-2" onClick={() => setIsOpen(false)}>
                Market Prices
              </Link>
              <Link to="/weather" className="text-foreground hover:text-primary transition-colors font-medium py-2" onClick={() => setIsOpen(false)}>
                Weather
              </Link>
              <Link to="/ai-advisory" className="text-foreground hover:text-primary transition-colors font-medium py-2" onClick={() => setIsOpen(false)}>
                AI Advisory
              </Link>
              <Link to="/disease-detection" className="text-foreground hover:text-primary transition-colors font-medium py-2" onClick={() => setIsOpen(false)}>
                Disease Detection
              </Link>
              
              <div className="flex gap-3 pt-4 border-t border-border">
                {user ? (
                  <div className="flex flex-col gap-2 w-full">
                    {isAdmin && (
                      <Link to="/admin" className="flex-1" onClick={() => setIsOpen(false)}>
                        <Button variant="outline" className="w-full">Admin Dashboard</Button>
                      </Link>
                    )}
                    <Link to="/dashboard" className="flex-1" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" className="w-full">My Dashboard</Button>
                    </Link>
                    <Button variant="destructive" className="w-full" onClick={() => { handleSignOut(); setIsOpen(false); }}>
                      Logout
                    </Button>
                  </div>
                ) : (
                  <>
                    <Link to="/login" className="flex-1" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" className="w-full">Login</Button>
                    </Link>
                    <Link to="/register" className="flex-1" onClick={() => setIsOpen(false)}>
                      <Button variant="hero" className="w-full">Register</Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
