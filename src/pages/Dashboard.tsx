import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { RiskScoreWidget } from "@/components/RiskScoreWidget";
import { SchemeEligibilityChecker } from "@/components/SchemeEligibilityChecker";
import { CropCalendar } from "@/components/CropCalendar";
import { PricePredictionWidget } from "@/components/PricePredictionWidget";
import { CropComparisonTool } from "@/components/CropComparisonTool";
import { DoseCalculator } from "@/components/DoseCalculator";
import { WaterPlanner } from "@/components/WaterPlanner";
import { EmergencyHelpButton } from "@/components/EmergencyHelpButton";
import WeatherWidget from "@/components/WeatherWidget";
import MarketPricesWidget from "@/components/MarketPricesWidget";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  User,
  Sprout,
  MessageSquare,
  Bell,
  Plus,
  Calendar,
  MapPin,
  Trash2,
  Loader2,
  Wrench,
  Cloud,
  TrendingUp,
  Shield,
  BrainCircuit,
  Bug,
  Home,
  Menu,
  X,
  Save,
  FileText,
} from "lucide-react";

interface Crop {
  id: string;
  crop_name: string;
  area_in_acres: number | null;
  sowing_date: string | null;
  expected_harvest: string | null;
  status: string;
  notes: string | null;
}

interface Query {
  id: string;
  subject: string;
  message: string;
  category: string | null;
  status: string;
  admin_response: string | null;
  created_at: string;
}

interface Alert {
  id: string;
  title: string;
  message: string;
  alert_type: string;
  severity: string;
  created_at: string;
}

type ActiveSection =
  | "overview"
  | "crops"
  | "weather"
  | "market"
  | "advisory"
  | "risk"
  | "schemes"
  | "calendar"
  | "price-prediction"
  | "tools"
  | "disease"
  | "queries"
  | "profile"
  | "emergency";

const sidebarItems: { key: ActiveSection; label: string; icon: React.ElementType }[] = [
  { key: "overview", label: "Dashboard", icon: Home },
  { key: "crops", label: "My Crops", icon: Sprout },
  { key: "weather", label: "Weather", icon: Cloud },
  { key: "market", label: "Market Prices", icon: TrendingUp },
  { key: "advisory", label: "AI Advisory", icon: BrainCircuit },
  { key: "risk", label: "Risk Score", icon: Shield },
  { key: "schemes", label: "Schemes", icon: FileText },
  { key: "calendar", label: "Crop Calendar", icon: Calendar },
  { key: "price-prediction", label: "Price Prediction", icon: TrendingUp },
  { key: "tools", label: "Farm Tools", icon: Wrench },
  { key: "disease", label: "Disease Detection", icon: Bug },
  { key: "queries", label: "Support Queries", icon: MessageSquare },
  { key: "emergency", label: "Emergency Help", icon: Bell },
  { key: "profile", label: "My Profile", icon: User },
];

const Dashboard = () => {
  const { user, profile, signOut, updateProfile } = useAuth();
  const { toast } = useToast();
  const [crops, setCrops] = useState<Crop[]>([]);
  const [queries, setQueries] = useState<Query[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddCrop, setShowAddCrop] = useState(false);
  const [showAddQuery, setShowAddQuery] = useState(false);
  const [activeSection, setActiveSection] = useState<ActiveSection>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    full_name: "",
    phone: "",
    state: "",
    district: "",
    village: "",
    aadhar: "",
  });

  const [newCrop, setNewCrop] = useState({
    crop_name: "",
    area_in_acres: "",
    sowing_date: "",
    expected_harvest: "",
    notes: "",
  });

  const [newQuery, setNewQuery] = useState({
    subject: "",
    message: "",
    category: "general",
  });

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  useEffect(() => {
    if (profile) {
      setProfileForm({
        full_name: profile.full_name || "",
        phone: profile.phone || "",
        state: profile.state || "",
        district: profile.district || "",
        village: profile.village || "",
        aadhar: profile.aadhar || "",
      });
    }
  }, [profile]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [cropsRes, queriesRes, alertsRes] = await Promise.all([
        supabase.from("farmer_crops").select("*").order("created_at", { ascending: false }),
        supabase.from("farmer_queries").select("*").order("created_at", { ascending: false }),
        supabase.from("alerts").select("*").eq("is_active", true).order("created_at", { ascending: false }),
      ]);
      if (cropsRes.data) setCrops(cropsRes.data);
      if (queriesRes.data) setQueries(queriesRes.data);
      if (alertsRes.data) setAlerts(alertsRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCrop = async () => {
    if (!user || !newCrop.crop_name) return;
    const { error } = await supabase.from("farmer_crops").insert({
      user_id: user.id,
      crop_name: newCrop.crop_name,
      area_in_acres: newCrop.area_in_acres ? parseFloat(newCrop.area_in_acres) : null,
      sowing_date: newCrop.sowing_date || null,
      expected_harvest: newCrop.expected_harvest || null,
      notes: newCrop.notes || null,
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Crop added successfully!" });
      setNewCrop({ crop_name: "", area_in_acres: "", sowing_date: "", expected_harvest: "", notes: "" });
      setShowAddCrop(false);
      fetchData();
    }
  };

  const handleDeleteCrop = async (id: string) => {
    const { error } = await supabase.from("farmer_crops").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Crop deleted!" });
      fetchData();
    }
  };

  const handleAddQuery = async () => {
    if (!user || !newQuery.subject || !newQuery.message) return;
    const { error } = await supabase.from("farmer_queries").insert({
      user_id: user.id,
      subject: newQuery.subject,
      message: newQuery.message,
      category: newQuery.category,
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Query submitted!" });
      setNewQuery({ subject: "", message: "", category: "general" });
      setShowAddQuery(false);
      fetchData();
    }
  };

  const handleUpdateProfile = async () => {
    const { error } = await updateProfile(profileForm);
    if (!error) {
      setIsEditingProfile(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      growing: "bg-green-100 text-green-800",
      harvested: "bg-amber-100 text-amber-800",
      failed: "bg-red-100 text-red-800",
      pending: "bg-yellow-100 text-yellow-800",
      answered: "bg-green-100 text-green-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getSeverityBadge = (severity: string) => {
    const colors: Record<string, string> = {
      info: "bg-blue-100 text-blue-800",
      warning: "bg-yellow-100 text-yellow-800",
      critical: "bg-red-100 text-red-800",
    };
    return colors[severity] || "bg-gray-100 text-gray-800";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const renderContent = () => {
    switch (activeSection) {
      case "overview":
        return (
          <div className="space-y-6">
            {alerts.length > 0 && (
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <Card key={alert.id} className="border-l-4 border-l-amber-500 bg-amber-50">
                    <CardContent className="py-4">
                      <div className="flex items-start gap-3">
                        <Bell className="w-5 h-5 text-amber-600 mt-0.5" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-foreground">{alert.title}</h3>
                            <Badge className={getSeverityBadge(alert.severity)}>{alert.severity}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{alert.message}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <WeatherWidget />
              <RiskScoreWidget location={profile?.state} crops={crops.map(c => c.crop_name)} />
              <PricePredictionWidget />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <SchemeEligibilityChecker />
              <CropCalendar crops={crops} />
            </div>
          </div>
        );

      case "crops":
        return (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Crop Tracking</CardTitle>
                <CardDescription>Manage and monitor your crops</CardDescription>
              </div>
              <Dialog open={showAddCrop} onOpenChange={setShowAddCrop}>
                <DialogTrigger asChild>
                  <Button className="gap-2"><Plus className="w-4 h-4" />Add Crop</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Crop</DialogTitle>
                    <DialogDescription>Enter details about your crop</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label>Crop Name *</Label>
                      <Input value={newCrop.crop_name} onChange={(e) => setNewCrop({ ...newCrop, crop_name: e.target.value })} placeholder="e.g., Rice, Wheat" />
                    </div>
                    <div className="space-y-2">
                      <Label>Area (acres)</Label>
                      <Input type="number" value={newCrop.area_in_acres} onChange={(e) => setNewCrop({ ...newCrop, area_in_acres: e.target.value })} placeholder="e.g., 2.5" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Sowing Date</Label>
                        <Input type="date" value={newCrop.sowing_date} onChange={(e) => setNewCrop({ ...newCrop, sowing_date: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>Expected Harvest</Label>
                        <Input type="date" value={newCrop.expected_harvest} onChange={(e) => setNewCrop({ ...newCrop, expected_harvest: e.target.value })} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Notes</Label>
                      <Textarea value={newCrop.notes} onChange={(e) => setNewCrop({ ...newCrop, notes: e.target.value })} placeholder="Additional notes" />
                    </div>
                    <Button onClick={handleAddCrop} className="w-full">Add Crop</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {crops.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Sprout className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No crops added yet. Start tracking your crops!</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {crops.map((crop) => (
                    <Card key={crop.id} className="relative">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="font-semibold text-lg">{crop.crop_name}</h3>
                          <Badge className={getStatusBadge(crop.status)}>{crop.status}</Badge>
                        </div>
                        {crop.area_in_acres && <p className="text-sm text-muted-foreground mb-2"><MapPin className="w-4 h-4 inline mr-1" />{crop.area_in_acres} acres</p>}
                        {crop.sowing_date && <p className="text-sm text-muted-foreground mb-2"><Calendar className="w-4 h-4 inline mr-1" />Sown: {new Date(crop.sowing_date).toLocaleDateString()}</p>}
                        {crop.expected_harvest && <p className="text-sm text-muted-foreground mb-2">Harvest: {new Date(crop.expected_harvest).toLocaleDateString()}</p>}
                        {crop.notes && <p className="text-sm text-muted-foreground mt-3 pt-3 border-t">{crop.notes}</p>}
                        <Button variant="ghost" size="icon" className="absolute top-2 right-2 text-destructive" onClick={() => handleDeleteCrop(crop.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        );

      case "weather":
        return <WeatherWidget />;

      case "market":
        return <MarketPricesWidget />;

      case "advisory":
        return (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <BrainCircuit className="w-12 h-12 mx-auto mb-4 text-primary" />
                <h3 className="text-xl font-semibold mb-2">AI Crop Advisory</h3>
                <p className="text-muted-foreground mb-4">Get personalized AI recommendations for your farm</p>
                <Link to="/ai-advisory"><Button>Open AI Advisory</Button></Link>
              </div>
            </CardContent>
          </Card>
        );

      case "risk":
        return <RiskScoreWidget location={profile?.state} crops={crops.map(c => c.crop_name)} />;

      case "schemes":
        return <SchemeEligibilityChecker />;

      case "calendar":
        return <CropCalendar crops={crops} />;

      case "price-prediction":
        return <PricePredictionWidget />;

      case "tools":
        return (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <CropComparisonTool />
              <DoseCalculator />
            </div>
            <WaterPlanner />
          </div>
        );

      case "disease":
        return (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Bug className="w-12 h-12 mx-auto mb-4 text-primary" />
                <h3 className="text-xl font-semibold mb-2">Disease Detection</h3>
                <p className="text-muted-foreground mb-4">Upload leaf images for AI-powered disease analysis</p>
                <Link to="/disease-detection"><Button>Open Disease Detection</Button></Link>
              </div>
            </CardContent>
          </Card>
        );

      case "queries":
        return (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Support Queries</CardTitle>
                <CardDescription>Submit questions to agriculture experts</CardDescription>
              </div>
              <Dialog open={showAddQuery} onOpenChange={setShowAddQuery}>
                <DialogTrigger asChild>
                  <Button className="gap-2"><Plus className="w-4 h-4" />New Query</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Submit a Query</DialogTitle>
                    <DialogDescription>Ask agriculture experts</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label>Subject *</Label>
                      <Input value={newQuery.subject} onChange={(e) => setNewQuery({ ...newQuery, subject: e.target.value })} placeholder="Brief title" />
                    </div>
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Select value={newQuery.category} onValueChange={(value) => setNewQuery({ ...newQuery, category: value })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General</SelectItem>
                          <SelectItem value="crops">Crops</SelectItem>
                          <SelectItem value="pests">Pests & Diseases</SelectItem>
                          <SelectItem value="schemes">Government Schemes</SelectItem>
                          <SelectItem value="market">Market & Prices</SelectItem>
                          <SelectItem value="equipment">Equipment</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Your Question *</Label>
                      <Textarea value={newQuery.message} onChange={(e) => setNewQuery({ ...newQuery, message: e.target.value })} placeholder="Describe your question" rows={4} />
                    </div>
                    <Button onClick={handleAddQuery} className="w-full">Submit Query</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {queries.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No queries submitted yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {queries.map((query) => (
                    <Card key={query.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold">{query.subject}</h3>
                          <Badge className={getStatusBadge(query.status)}>{query.status}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{query.message}</p>
                        {query.admin_response && (
                          <div className="bg-green-50 p-4 rounded-lg mt-3">
                            <p className="text-sm font-medium text-green-800 mb-1">Expert Response:</p>
                            <p className="text-sm text-green-700">{query.admin_response}</p>
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground mt-3">Submitted: {new Date(query.created_at).toLocaleDateString()}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        );

      case "emergency":
        return (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Bell className="w-12 h-12 mx-auto mb-4 text-destructive" />
                <h3 className="text-xl font-semibold mb-2">Emergency Help</h3>
                <p className="text-muted-foreground mb-4">Report urgent agricultural emergencies</p>
                <EmergencyHelpButton />
              </div>
            </CardContent>
          </Card>
        );

      case "profile":
        return (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Your personal and farm details</CardDescription>
              </div>
              {!isEditingProfile ? (
                <Button variant="outline" onClick={() => setIsEditingProfile(true)} className="gap-2">
                  <User className="w-4 h-4" />Edit Profile
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button onClick={handleUpdateProfile} className="gap-2"><Save className="w-4 h-4" />Save</Button>
                  <Button variant="outline" onClick={() => setIsEditingProfile(false)}>Cancel</Button>
                </div>
              )}
            </CardHeader>
            <CardContent>
              {isEditingProfile ? (
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input value={profileForm.full_name} onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input value={profile?.email || user?.email || ""} disabled className="bg-muted" />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} placeholder="Enter phone number" />
                  </div>
                  <div className="space-y-2">
                    <Label>Aadhar Number</Label>
                    <Input value={profileForm.aadhar} onChange={(e) => setProfileForm({ ...profileForm, aadhar: e.target.value })} placeholder="Enter Aadhar number" />
                  </div>
                  <div className="space-y-2">
                    <Label>State</Label>
                    <Input value={profileForm.state} onChange={(e) => setProfileForm({ ...profileForm, state: e.target.value })} placeholder="Enter state" />
                  </div>
                  <div className="space-y-2">
                    <Label>District</Label>
                    <Input value={profileForm.district} onChange={(e) => setProfileForm({ ...profileForm, district: e.target.value })} placeholder="Enter district" />
                  </div>
                  <div className="space-y-2">
                    <Label>Village/Town</Label>
                    <Input value={profileForm.village} onChange={(e) => setProfileForm({ ...profileForm, village: e.target.value })} placeholder="Enter village/town" />
                  </div>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2">
                  <div><Label className="text-muted-foreground">Full Name</Label><p className="font-medium">{profile?.full_name || "-"}</p></div>
                  <div><Label className="text-muted-foreground">Email</Label><p className="font-medium">{profile?.email || user?.email || "-"}</p></div>
                  <div><Label className="text-muted-foreground">Phone</Label><p className="font-medium">{profile?.phone || "-"}</p></div>
                  <div><Label className="text-muted-foreground">Aadhar</Label><p className="font-medium">{profile?.aadhar || "-"}</p></div>
                  <div><Label className="text-muted-foreground">State</Label><p className="font-medium">{profile?.state || "-"}</p></div>
                  <div><Label className="text-muted-foreground">District</Label><p className="font-medium">{profile?.district || "-"}</p></div>
                  <div><Label className="text-muted-foreground">Village/Town</Label><p className="font-medium">{profile?.village || "-"}</p></div>
                </div>
              )}
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <Navbar />
      <div className="flex pt-16">
        {/* Mobile sidebar toggle */}
        <button
          className="md:hidden fixed top-20 left-4 z-40 p-2 rounded-lg bg-primary text-primary-foreground shadow-lg"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Sidebar */}
        <aside className={`fixed md:sticky top-16 left-0 z-30 h-[calc(100vh-4rem)] w-64 bg-card border-r border-border overflow-y-auto transition-transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
          <div className="p-4">
            <div className="mb-6 px-3">
              <h2 className="font-bold text-lg text-foreground">{profile?.full_name || "Farmer"}</h2>
              <p className="text-sm text-muted-foreground truncate">{profile?.village && profile?.district ? `${profile.village}, ${profile.district}` : "KrishiSathi Portal"}</p>
            </div>
            <nav className="space-y-1">
              {sidebarItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => { setActiveSection(item.key); setSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeSection === item.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </button>
              ))}
            </nav>
            <div className="mt-6 px-3">
              <Button variant="destructive" className="w-full" onClick={signOut}>Logout</Button>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-h-[calc(100vh-4rem)] p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-foreground">
                {sidebarItems.find(i => i.key === activeSection)?.label || "Dashboard"}
              </h1>
            </div>
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
