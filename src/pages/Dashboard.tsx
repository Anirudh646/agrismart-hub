import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { RiskScoreWidget } from "@/components/RiskScoreWidget";
import { SchemeEligibilityChecker } from "@/components/SchemeEligibilityChecker";
import { CropCalendar } from "@/components/CropCalendar";
import { PricePredictionWidget } from "@/components/PricePredictionWidget";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Edit,
  Loader2,
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

const Dashboard = () => {
  const { user, profile, signOut } = useAuth();
  const { toast } = useToast();
  const [crops, setCrops] = useState<Crop[]>([]);
  const [queries, setQueries] = useState<Query[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddCrop, setShowAddCrop] = useState(false);
  const [showAddQuery, setShowAddQuery] = useState(false);

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
    if (user) {
      fetchData();
    }
  }, [user]);

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
      toast({ title: "Success", description: "Crop deleted successfully!" });
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
      toast({ title: "Success", description: "Query submitted successfully!" });
      setNewQuery({ subject: "", message: "", category: "general" });
      setShowAddQuery(false);
      fetchData();
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

  return (
    <div className="min-h-screen bg-muted/30">
      <Navbar />
      <main className="pt-20 pb-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Welcome, {profile?.full_name || "Farmer"}!
              </h1>
              <p className="text-muted-foreground mt-1">
                {profile?.village && profile?.district && profile?.state
                  ? `${profile.village}, ${profile.district}, ${profile.state}`
                  : "Manage your farm and track your crops"}
              </p>
            </div>
            <div className="flex gap-3">
              <Link to="/ai-advisory">
                <Button variant="outline">AI Advisory</Button>
              </Link>
              <Button variant="destructive" onClick={signOut}>
                Logout
              </Button>
            </div>
          </div>

          {/* Alerts Section */}
          {alerts.length > 0 && (
            <div className="mb-8 space-y-3">
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

          {/* Smart Widgets Section */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <RiskScoreWidget location={profile?.state} crops={crops.map(c => c.crop_name)} />
            <SchemeEligibilityChecker />
            <CropCalendar crops={crops} />
            <PricePredictionWidget />
          </div>

          {/* Main Tabs */}
          <Tabs defaultValue="crops" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
              <TabsTrigger value="crops" className="gap-2">
                <Sprout className="w-4 h-4" />
                My Crops
              </TabsTrigger>
              <TabsTrigger value="queries" className="gap-2">
                <MessageSquare className="w-4 h-4" />
                My Queries
              </TabsTrigger>
              <TabsTrigger value="profile" className="gap-2">
                <User className="w-4 h-4" />
                Profile
              </TabsTrigger>
            </TabsList>

            {/* Crops Tab */}
            <TabsContent value="crops">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Crop Tracking</CardTitle>
                    <CardDescription>Manage and monitor your crops</CardDescription>
                  </div>
                  <Dialog open={showAddCrop} onOpenChange={setShowAddCrop}>
                    <DialogTrigger asChild>
                      <Button className="gap-2">
                        <Plus className="w-4 h-4" />
                        Add Crop
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Crop</DialogTitle>
                        <DialogDescription>Enter details about your crop</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 pt-4">
                        <div className="space-y-2">
                          <Label htmlFor="crop_name">Crop Name *</Label>
                          <Input
                            id="crop_name"
                            value={newCrop.crop_name}
                            onChange={(e) => setNewCrop({ ...newCrop, crop_name: e.target.value })}
                            placeholder="e.g., Rice, Wheat, Cotton"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="area">Area (in acres)</Label>
                          <Input
                            id="area"
                            type="number"
                            value={newCrop.area_in_acres}
                            onChange={(e) => setNewCrop({ ...newCrop, area_in_acres: e.target.value })}
                            placeholder="e.g., 2.5"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="sowing_date">Sowing Date</Label>
                            <Input
                              id="sowing_date"
                              type="date"
                              value={newCrop.sowing_date}
                              onChange={(e) => setNewCrop({ ...newCrop, sowing_date: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="harvest_date">Expected Harvest</Label>
                            <Input
                              id="harvest_date"
                              type="date"
                              value={newCrop.expected_harvest}
                              onChange={(e) => setNewCrop({ ...newCrop, expected_harvest: e.target.value })}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="notes">Notes</Label>
                          <Textarea
                            id="notes"
                            value={newCrop.notes}
                            onChange={(e) => setNewCrop({ ...newCrop, notes: e.target.value })}
                            placeholder="Additional notes about this crop"
                          />
                        </div>
                        <Button onClick={handleAddCrop} className="w-full">
                          Add Crop
                        </Button>
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
                            {crop.area_in_acres && (
                              <p className="text-sm text-muted-foreground mb-2">
                                <MapPin className="w-4 h-4 inline mr-1" />
                                {crop.area_in_acres} acres
                              </p>
                            )}
                            {crop.sowing_date && (
                              <p className="text-sm text-muted-foreground mb-2">
                                <Calendar className="w-4 h-4 inline mr-1" />
                                Sown: {new Date(crop.sowing_date).toLocaleDateString()}
                              </p>
                            )}
                            {crop.expected_harvest && (
                              <p className="text-sm text-muted-foreground mb-2">
                                Expected Harvest: {new Date(crop.expected_harvest).toLocaleDateString()}
                              </p>
                            )}
                            {crop.notes && (
                              <p className="text-sm text-muted-foreground mt-3 pt-3 border-t">
                                {crop.notes}
                              </p>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute top-2 right-2 text-destructive hover:text-destructive"
                              onClick={() => handleDeleteCrop(crop.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Queries Tab */}
            <TabsContent value="queries">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Support Queries</CardTitle>
                    <CardDescription>Submit questions to agriculture experts</CardDescription>
                  </div>
                  <Dialog open={showAddQuery} onOpenChange={setShowAddQuery}>
                    <DialogTrigger asChild>
                      <Button className="gap-2">
                        <Plus className="w-4 h-4" />
                        New Query
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Submit a Query</DialogTitle>
                        <DialogDescription>Ask questions to our agriculture experts</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 pt-4">
                        <div className="space-y-2">
                          <Label htmlFor="subject">Subject *</Label>
                          <Input
                            id="subject"
                            value={newQuery.subject}
                            onChange={(e) => setNewQuery({ ...newQuery, subject: e.target.value })}
                            placeholder="Brief title for your query"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="category">Category</Label>
                          <Select
                            value={newQuery.category}
                            onValueChange={(value) => setNewQuery({ ...newQuery, category: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
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
                          <Label htmlFor="message">Your Question *</Label>
                          <Textarea
                            id="message"
                            value={newQuery.message}
                            onChange={(e) => setNewQuery({ ...newQuery, message: e.target.value })}
                            placeholder="Describe your question or problem in detail"
                            rows={4}
                          />
                        </div>
                        <Button onClick={handleAddQuery} className="w-full">
                          Submit Query
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  {queries.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No queries submitted yet. Ask our experts!</p>
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
                            <p className="text-xs text-muted-foreground mt-3">
                              Submitted: {new Date(query.created_at).toLocaleDateString()}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Profile Tab */}
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Your personal and farm details</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <Label className="text-muted-foreground">Full Name</Label>
                      <p className="font-medium">{profile?.full_name || "-"}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Email</Label>
                      <p className="font-medium">{profile?.email || user?.email || "-"}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Phone</Label>
                      <p className="font-medium">{profile?.phone || "-"}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">State</Label>
                      <p className="font-medium">{profile?.state || "-"}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">District</Label>
                      <p className="font-medium">{profile?.district || "-"}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Village/Town</Label>
                      <p className="font-medium">{profile?.village || "-"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
