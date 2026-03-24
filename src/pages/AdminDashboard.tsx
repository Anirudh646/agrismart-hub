import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { AdminAnalytics } from "@/components/AdminAnalytics";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import {
  Users,
  FileText,
  Bell,
  MessageSquare,
  Plus,
  Loader2,
  Send,
  Trash2,
  AlertTriangle,
  BrainCircuit,
  CheckCircle,
  UserCheck,
  UserX,
  Droplets,
  Shield,
  BarChart3,
  Menu,
  X,
  Home,
  Sprout,
} from "lucide-react";

interface Scheme {
  id: string;
  title: string;
  description: string;
  eligibility: string | null;
  benefits: string | null;
  category: string | null;
  deadline: string | null;
  is_active: boolean;
  link: string | null;
}

interface Query {
  id: string;
  subject: string;
  message: string;
  category: string | null;
  status: string;
  admin_response: string | null;
  created_at: string;
  user_id: string;
}

interface Alert {
  id: string;
  title: string;
  message: string;
  alert_type: string;
  severity: string;
  target_state: string | null;
  target_district: string | null;
  is_active: boolean;
  created_at: string;
}

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  state: string | null;
  district: string | null;
  is_verified?: boolean;
  is_active?: boolean;
}

interface EmergencyRequest {
  id: string;
  user_id: string;
  emergency_type: string;
  description: string;
  location: string | null;
  contact_phone: string | null;
  status: string;
  admin_response: string | null;
  created_at: string;
}

interface AdvisoryRequest {
  id: string;
  user_id: string;
  location: string | null;
  soil_type: string | null;
  season: string | null;
  land_size: number | null;
  current_crop: string | null;
  query: string | null;
  created_at: string;
}

interface WaterPlan {
  id: string;
  user_id: string;
  crop_name: string;
  land_area: number;
  soil_type: string | null;
  irrigation_type: string | null;
  total_water_requirement: number | null;
  unit: string | null;
  created_at: string;
}

interface CropData {
  id: string;
  user_id: string;
  crop_name: string;
  area_in_acres: number | null;
  status: string | null;
}

type AdminSection = "overview" | "analytics" | "farmers" | "crops" | "queries" | "emergency" | "advisory" | "waterplans" | "schemes" | "alerts";

const adminSidebarItems: { key: AdminSection; label: string; icon: React.ElementType }[] = [
  { key: "overview", label: "Overview", icon: Home },
  { key: "analytics", label: "Analytics", icon: BarChart3 },
  { key: "farmers", label: "Farmer Management", icon: Users },
  { key: "crops", label: "Crop Data", icon: Sprout },
  { key: "queries", label: "Queries", icon: MessageSquare },
  { key: "emergency", label: "Emergencies", icon: AlertTriangle },
  { key: "advisory", label: "AI Advisory", icon: BrainCircuit },
  { key: "waterplans", label: "Water Plans", icon: Droplets },
  { key: "schemes", label: "Schemes", icon: FileText },
  { key: "alerts", label: "Alerts", icon: Bell },
];

const AdminDashboard = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [queries, setQueries] = useState<Query[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [farmers, setFarmers] = useState<Profile[]>([]);
  const [emergencyRequests, setEmergencyRequests] = useState<EmergencyRequest[]>([]);
  const [advisoryRequests, setAdvisoryRequests] = useState<AdvisoryRequest[]>([]);
  const [waterPlans, setWaterPlans] = useState<WaterPlan[]>([]);
  const [allCrops, setAllCrops] = useState<CropData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddScheme, setShowAddScheme] = useState(false);
  const [showAddAlert, setShowAddAlert] = useState(false);
  const [selectedQuery, setSelectedQuery] = useState<Query | null>(null);
  const [selectedEmergency, setSelectedEmergency] = useState<EmergencyRequest | null>(null);
  const [responseText, setResponseText] = useState("");
  const [emergencyResponse, setEmergencyResponse] = useState("");
  const [queryFilter, setQueryFilter] = useState<string>("all");
  const [activeSection, setActiveSection] = useState<AdminSection>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [newScheme, setNewScheme] = useState({
    title: "", description: "", eligibility: "", benefits: "", category: "subsidy", deadline: "", link: "",
  });

  const [newAlert, setNewAlert] = useState({
    title: "", message: "", alert_type: "weather", severity: "warning", target_state: "", target_district: "",
  });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [schemesRes, queriesRes, alertsRes, farmersRes, emergencyRes, advisoryRes, waterRes, cropsRes] = await Promise.all([
        supabase.from("schemes").select("*").order("created_at", { ascending: false }),
        supabase.from("farmer_queries").select("*").order("created_at", { ascending: false }),
        supabase.from("alerts").select("*").order("created_at", { ascending: false }),
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("emergency_requests").select("*").order("created_at", { ascending: false }),
        supabase.from("farmer_advisory_requests").select("*").order("created_at", { ascending: false }),
        supabase.from("water_plans").select("*").order("created_at", { ascending: false }),
        supabase.from("farmer_crops").select("*").order("created_at", { ascending: false }),
      ]);
      if (schemesRes.data) setSchemes(schemesRes.data);
      if (queriesRes.data) setQueries(queriesRes.data);
      if (alertsRes.data) setAlerts(alertsRes.data);
      if (farmersRes.data) setFarmers(farmersRes.data as Profile[]);
      if (emergencyRes.data) setEmergencyRequests(emergencyRes.data as EmergencyRequest[]);
      if (advisoryRes.data) setAdvisoryRequests(advisoryRes.data as AdvisoryRequest[]);
      if (waterRes.data) setWaterPlans(waterRes.data as WaterPlan[]);
      if (cropsRes.data) setAllCrops(cropsRes.data as CropData[]);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddScheme = async () => {
    if (!user || !newScheme.title || !newScheme.description) return;
    const { error } = await supabase.from("schemes").insert({
      title: newScheme.title, description: newScheme.description,
      eligibility: newScheme.eligibility || null, benefits: newScheme.benefits || null,
      category: newScheme.category, deadline: newScheme.deadline || null,
      link: newScheme.link || null, created_by: user.id,
    });
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); }
    else {
      toast({ title: "Success", description: "Scheme added!" });
      setNewScheme({ title: "", description: "", eligibility: "", benefits: "", category: "subsidy", deadline: "", link: "" });
      setShowAddScheme(false); fetchData();
    }
  };

  const handleDeleteScheme = async (id: string) => {
    const { error } = await supabase.from("schemes").delete().eq("id", id);
    if (!error) { toast({ title: "Deleted" }); fetchData(); }
  };

  const handleAddAlert = async () => {
    if (!user || !newAlert.title || !newAlert.message) return;
    const { error } = await supabase.from("alerts").insert({
      title: newAlert.title, message: newAlert.message, alert_type: newAlert.alert_type,
      severity: newAlert.severity, target_state: newAlert.target_state || null,
      target_district: newAlert.target_district || null, created_by: user.id,
    });
    if (!error) {
      toast({ title: "Alert published!" });
      setNewAlert({ title: "", message: "", alert_type: "weather", severity: "warning", target_state: "", target_district: "" });
      setShowAddAlert(false); fetchData();
    }
  };

  const handleDeleteAlert = async (id: string) => {
    const { error } = await supabase.from("alerts").delete().eq("id", id);
    if (!error) { toast({ title: "Deleted" }); fetchData(); }
  };

  const handleRespondToQuery = async () => {
    if (!selectedQuery || !responseText || !user) return;
    const { error } = await supabase.from("farmer_queries").update({
      admin_response: responseText, responded_by: user.id,
      responded_at: new Date().toISOString(), status: "answered",
    }).eq("id", selectedQuery.id);
    if (!error) { toast({ title: "Response sent!" }); setSelectedQuery(null); setResponseText(""); fetchData(); }
  };

  const handleRespondToEmergency = async () => {
    if (!selectedEmergency || !emergencyResponse || !user) return;
    const { error } = await supabase.from("emergency_requests").update({
      admin_response: emergencyResponse, responded_by: user.id,
      responded_at: new Date().toISOString(), status: "resolved",
    } as never).eq("id", selectedEmergency.id);
    if (!error) { toast({ title: "Emergency resolved!" }); setSelectedEmergency(null); setEmergencyResponse(""); fetchData(); }
  };

  const handleToggleFarmerStatus = async (farmerId: string, currentStatus: boolean) => {
    const { error } = await supabase.from("profiles").update({ is_active: !currentStatus } as never).eq("id", farmerId);
    if (!error) { toast({ title: `Farmer ${!currentStatus ? "activated" : "deactivated"}` }); fetchData(); }
  };

  const handleVerifyFarmer = async (farmerId: string) => {
    const { error } = await supabase.from("profiles").update({ is_verified: true } as never).eq("id", farmerId);
    if (!error) { toast({ title: "Farmer verified!" }); fetchData(); }
  };

  const getStatusBadge = (status: string) => {
    const c: Record<string, string> = { pending: "bg-yellow-100 text-yellow-800", answered: "bg-green-100 text-green-800", resolved: "bg-green-100 text-green-800" };
    return c[status] || "bg-gray-100 text-gray-800";
  };

  const getEmergencyTypeBadge = (type: string) => {
    const c: Record<string, string> = { pest_attack: "bg-red-100 text-red-800", crop_disease: "bg-orange-100 text-orange-800", water_shortage: "bg-blue-100 text-blue-800", flood: "bg-cyan-100 text-cyan-800" };
    return c[type] || "bg-gray-100 text-gray-800";
  };

  const filteredQueries = queries.filter(q => {
    if (queryFilter === "all") return true;
    if (queryFilter === "pending") return q.status === "pending";
    if (queryFilter === "answered") return q.status === "answered";
    return q.category === queryFilter;
  });

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  const renderContent = () => {
    switch (activeSection) {
      case "overview":
        return (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="border-l-4 border-l-primary">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary/10 rounded-lg"><Users className="w-6 h-6 text-primary" /></div>
                    <div><p className="text-3xl font-bold">{farmers.length}</p><p className="text-sm text-muted-foreground">Total Farmers</p></div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-green-500">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-green-100 rounded-lg"><FileText className="w-6 h-6 text-green-600" /></div>
                    <div><p className="text-3xl font-bold">{schemes.length}</p><p className="text-sm text-muted-foreground">Active Schemes</p></div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-amber-500">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-amber-100 rounded-lg"><MessageSquare className="w-6 h-6 text-amber-600" /></div>
                    <div><p className="text-3xl font-bold">{queries.filter(q => q.status === "pending").length}</p><p className="text-sm text-muted-foreground">Pending Queries</p></div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-red-500">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-red-100 rounded-lg"><AlertTriangle className="w-6 h-6 text-red-600" /></div>
                    <div><p className="text-3xl font-bold">{emergencyRequests.filter(e => e.status === "pending").length}</p><p className="text-sm text-muted-foreground">Emergencies</p></div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-purple-100 rounded-lg"><BrainCircuit className="w-6 h-6 text-purple-600" /></div>
                    <div><p className="text-2xl font-bold">{advisoryRequests.length}</p><p className="text-sm text-muted-foreground">AI Advisory Requests</p></div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-100 rounded-lg"><Droplets className="w-6 h-6 text-blue-600" /></div>
                    <div><p className="text-2xl font-bold">{waterPlans.length}</p><p className="text-sm text-muted-foreground">Water Plans</p></div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-green-100 rounded-lg"><Sprout className="w-6 h-6 text-green-600" /></div>
                    <div><p className="text-2xl font-bold">{allCrops.length}</p><p className="text-sm text-muted-foreground">Crops Tracked</p></div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader><CardTitle className="text-base">Verified vs Unverified Farmers</CardTitle></CardHeader>
                <CardContent>
                  <div className="flex gap-8">
                    <div><p className="text-2xl font-bold text-green-600">{farmers.filter(f => f.is_verified).length}</p><p className="text-sm text-muted-foreground">Verified</p></div>
                    <div><p className="text-2xl font-bold text-amber-600">{farmers.filter(f => !f.is_verified).length}</p><p className="text-sm text-muted-foreground">Unverified</p></div>
                    <div><p className="text-2xl font-bold text-red-600">{farmers.filter(f => f.is_active === false).length}</p><p className="text-sm text-muted-foreground">Inactive</p></div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-base">Recent Alerts</CardTitle></CardHeader>
                <CardContent>
                  {alerts.slice(0, 3).map(a => (
                    <div key={a.id} className="flex items-center gap-2 py-1">
                      <Bell className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm truncate">{a.title}</span>
                      <Badge className={a.is_active ? "bg-green-100 text-green-800 ml-auto" : "bg-gray-100 text-gray-800 ml-auto"}>{a.is_active ? "Active" : "Inactive"}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case "analytics":
        return <AdminAnalytics />;

      case "farmers":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Shield className="w-5 h-5" />Farmer Management</CardTitle>
              <CardDescription>View, verify, and manage farmer accounts</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Phone</TableHead><TableHead>Location</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {farmers.map((farmer) => (
                    <TableRow key={farmer.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">{farmer.full_name}{farmer.is_verified && <CheckCircle className="w-4 h-4 text-green-600" />}</div>
                      </TableCell>
                      <TableCell>{farmer.email || "-"}</TableCell>
                      <TableCell>{farmer.phone || "-"}</TableCell>
                      <TableCell>{farmer.district && farmer.state ? `${farmer.district}, ${farmer.state}` : "-"}</TableCell>
                      <TableCell>
                        <Badge className={farmer.is_active !== false ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                          {farmer.is_active !== false ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {!farmer.is_verified && <Button variant="outline" size="sm" onClick={() => handleVerifyFarmer(farmer.id)} className="gap-1"><UserCheck className="w-4 h-4" />Verify</Button>}
                          <Button variant="ghost" size="sm" onClick={() => handleToggleFarmerStatus(farmer.id, farmer.is_active !== false)} className={farmer.is_active !== false ? "text-red-600" : "text-green-600"}>
                            {farmer.is_active !== false ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        );

      case "crops":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Sprout className="w-5 h-5" />All Farmer Crops</CardTitle>
              <CardDescription>View crops tracked by all farmers</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Farmer ID</TableHead><TableHead>Crop</TableHead><TableHead>Area (acres)</TableHead><TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allCrops.map((crop) => (
                    <TableRow key={crop.id}>
                      <TableCell className="font-mono text-xs">{crop.user_id.substring(0, 8)}...</TableCell>
                      <TableCell className="font-medium">{crop.crop_name}</TableCell>
                      <TableCell>{crop.area_in_acres || "-"}</TableCell>
                      <TableCell><Badge className={getStatusBadge(crop.status || "growing")}>{crop.status || "growing"}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        );

      case "queries":
        return (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div><CardTitle>Farmer Queries</CardTitle><CardDescription>Respond to farmer questions</CardDescription></div>
              <Select value={queryFilter} onValueChange={setQueryFilter}>
                <SelectTrigger className="w-[180px]"><SelectValue placeholder="Filter" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="answered">Answered</SelectItem>
                  <SelectItem value="crops">Crops</SelectItem>
                  <SelectItem value="pests">Pests</SelectItem>
                  <SelectItem value="schemes">Schemes</SelectItem>
                  <SelectItem value="market">Market</SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredQueries.length === 0 ? <p className="text-center text-muted-foreground py-8">No queries</p> : filteredQueries.map(query => (
                  <Card key={query.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-2">
                        <div><h3 className="font-semibold">{query.subject}</h3><p className="text-sm text-muted-foreground">{query.category}</p></div>
                        <Badge className={getStatusBadge(query.status)}>{query.status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{query.message}</p>
                      {query.admin_response && <div className="bg-green-50 p-4 rounded-lg mt-3"><p className="text-sm font-medium text-green-800 mb-1">Your Response:</p><p className="text-sm text-green-700">{query.admin_response}</p></div>}
                      <div className="flex items-center justify-between mt-4">
                        <p className="text-xs text-muted-foreground">{new Date(query.created_at).toLocaleDateString()}</p>
                        {query.status === "pending" && (
                          <Dialog>
                            <DialogTrigger asChild><Button size="sm" className="gap-2" onClick={() => setSelectedQuery(query)}><Send className="w-4 h-4" />Respond</Button></DialogTrigger>
                            <DialogContent>
                              <DialogHeader><DialogTitle>Respond to Query</DialogTitle><DialogDescription>{query.subject}</DialogDescription></DialogHeader>
                              <div className="space-y-4 pt-4">
                                <div className="bg-muted p-4 rounded-lg"><p className="text-sm">{query.message}</p></div>
                                <div className="space-y-2"><Label>Your Response</Label><Textarea value={responseText} onChange={(e) => setResponseText(e.target.value)} placeholder="Type your response..." rows={4} /></div>
                                <Button onClick={handleRespondToQuery} className="w-full">Send Response</Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        );

      case "emergency":
        return (
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-destructive"><AlertTriangle className="w-5 h-5" />Emergency Requests</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                {emergencyRequests.length === 0 ? <p className="text-center text-muted-foreground py-8">No emergencies</p> : emergencyRequests.map(emergency => (
                  <Card key={emergency.id} className={emergency.status === "pending" ? "border-red-200 bg-red-50/30" : ""}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <Badge className={getEmergencyTypeBadge(emergency.emergency_type)}>{emergency.emergency_type.replace("_", " ").toUpperCase()}</Badge>
                          {emergency.location && <p className="text-sm text-muted-foreground mt-1">📍 {emergency.location}</p>}
                        </div>
                        <Badge className={getStatusBadge(emergency.status)}>{emergency.status}</Badge>
                      </div>
                      <p className="text-sm mt-3">{emergency.description}</p>
                      {emergency.contact_phone && <p className="text-sm text-muted-foreground mt-2">📞 {emergency.contact_phone}</p>}
                      {emergency.admin_response && <div className="bg-green-50 p-4 rounded-lg mt-3"><p className="text-sm font-medium text-green-800 mb-1">Resolution:</p><p className="text-sm text-green-700">{emergency.admin_response}</p></div>}
                      <div className="flex items-center justify-between mt-4">
                        <p className="text-xs text-muted-foreground">{new Date(emergency.created_at).toLocaleString()}</p>
                        {emergency.status === "pending" && (
                          <Dialog>
                            <DialogTrigger asChild><Button size="sm" variant="destructive" className="gap-2" onClick={() => setSelectedEmergency(emergency)}><CheckCircle className="w-4 h-4" />Resolve</Button></DialogTrigger>
                            <DialogContent>
                              <DialogHeader><DialogTitle>Resolve Emergency</DialogTitle></DialogHeader>
                              <div className="space-y-4 pt-4">
                                <div className="bg-muted p-4 rounded-lg"><p className="text-sm">{emergency.description}</p></div>
                                <div className="space-y-2"><Label>Resolution Notes</Label><Textarea value={emergencyResponse} onChange={(e) => setEmergencyResponse(e.target.value)} placeholder="How was this resolved..." rows={4} /></div>
                                <Button onClick={handleRespondToEmergency} className="w-full" variant="destructive">Mark as Resolved</Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        );

      case "advisory":
        return (
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><BrainCircuit className="w-5 h-5 text-purple-600" />AI Advisory Requests</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow><TableHead>Date</TableHead><TableHead>Location</TableHead><TableHead>Soil</TableHead><TableHead>Season</TableHead><TableHead>Land</TableHead><TableHead>Crop</TableHead><TableHead>Query</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {advisoryRequests.map(req => (
                    <TableRow key={req.id}>
                      <TableCell className="text-sm">{new Date(req.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>{req.location || "-"}</TableCell>
                      <TableCell>{req.soil_type || "-"}</TableCell>
                      <TableCell>{req.season || "-"}</TableCell>
                      <TableCell>{req.land_size ? `${req.land_size} acres` : "-"}</TableCell>
                      <TableCell>{req.current_crop || "-"}</TableCell>
                      <TableCell className="max-w-xs truncate">{req.query || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        );

      case "waterplans":
        return (
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Droplets className="w-5 h-5 text-blue-600" />Water Plans</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow><TableHead>Farmer ID</TableHead><TableHead>Crop</TableHead><TableHead>Land Area</TableHead><TableHead>Soil</TableHead><TableHead>Irrigation</TableHead><TableHead>Water Req.</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {waterPlans.map(plan => (
                    <TableRow key={plan.id}>
                      <TableCell className="font-mono text-xs">{plan.user_id.substring(0, 8)}...</TableCell>
                      <TableCell className="font-medium">{plan.crop_name}</TableCell>
                      <TableCell>{plan.land_area} acres</TableCell>
                      <TableCell>{plan.soil_type || "-"}</TableCell>
                      <TableCell>{plan.irrigation_type || "-"}</TableCell>
                      <TableCell>{plan.total_water_requirement ? `${plan.total_water_requirement} ${plan.unit || "liters"}` : "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        );

      case "schemes":
        return (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div><CardTitle>Government Schemes</CardTitle><CardDescription>Manage schemes</CardDescription></div>
              <Dialog open={showAddScheme} onOpenChange={setShowAddScheme}>
                <DialogTrigger asChild><Button className="gap-2"><Plus className="w-4 h-4" />Add Scheme</Button></DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader><DialogTitle>Add New Scheme</DialogTitle></DialogHeader>
                  <div className="space-y-4 pt-4 max-h-[60vh] overflow-y-auto">
                    <div className="space-y-2"><Label>Title *</Label><Input value={newScheme.title} onChange={(e) => setNewScheme({ ...newScheme, title: e.target.value })} placeholder="e.g., PM Kisan" /></div>
                    <div className="space-y-2"><Label>Description *</Label><Textarea value={newScheme.description} onChange={(e) => setNewScheme({ ...newScheme, description: e.target.value })} rows={3} /></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2"><Label>Category</Label>
                        <Select value={newScheme.category} onValueChange={(v) => setNewScheme({ ...newScheme, category: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="subsidy">Subsidy</SelectItem><SelectItem value="loan">Loan</SelectItem><SelectItem value="insurance">Insurance</SelectItem><SelectItem value="training">Training</SelectItem><SelectItem value="equipment">Equipment</SelectItem></SelectContent></Select>
                      </div>
                      <div className="space-y-2"><Label>Deadline</Label><Input type="date" value={newScheme.deadline} onChange={(e) => setNewScheme({ ...newScheme, deadline: e.target.value })} /></div>
                    </div>
                    <div className="space-y-2"><Label>Eligibility</Label><Textarea value={newScheme.eligibility} onChange={(e) => setNewScheme({ ...newScheme, eligibility: e.target.value })} rows={2} /></div>
                    <div className="space-y-2"><Label>Benefits</Label><Textarea value={newScheme.benefits} onChange={(e) => setNewScheme({ ...newScheme, benefits: e.target.value })} rows={2} /></div>
                    <div className="space-y-2"><Label>Link</Label><Input value={newScheme.link} onChange={(e) => setNewScheme({ ...newScheme, link: e.target.value })} placeholder="https://..." /></div>
                    <Button onClick={handleAddScheme} className="w-full">Add Scheme</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Category</TableHead><TableHead>Deadline</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {schemes.map(scheme => (
                    <TableRow key={scheme.id}>
                      <TableCell className="font-medium">{scheme.title}</TableCell>
                      <TableCell className="capitalize">{scheme.category}</TableCell>
                      <TableCell>{scheme.deadline ? new Date(scheme.deadline).toLocaleDateString() : "-"}</TableCell>
                      <TableCell><Badge className={scheme.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>{scheme.is_active ? "Active" : "Inactive"}</Badge></TableCell>
                      <TableCell><Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteScheme(scheme.id)}><Trash2 className="w-4 h-4" /></Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        );

      case "alerts":
        return (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div><CardTitle>Emergency Alerts</CardTitle><CardDescription>Send alerts to farmers</CardDescription></div>
              <Dialog open={showAddAlert} onOpenChange={setShowAddAlert}>
                <DialogTrigger asChild><Button className="gap-2"><Plus className="w-4 h-4" />New Alert</Button></DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Create Alert</DialogTitle></DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2"><Label>Title *</Label><Input value={newAlert.title} onChange={(e) => setNewAlert({ ...newAlert, title: e.target.value })} placeholder="e.g., Heavy Rainfall Warning" /></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2"><Label>Type</Label>
                        <Select value={newAlert.alert_type} onValueChange={(v) => setNewAlert({ ...newAlert, alert_type: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="weather">Weather</SelectItem><SelectItem value="pest">Pest</SelectItem><SelectItem value="market">Market</SelectItem><SelectItem value="scheme">Scheme</SelectItem><SelectItem value="fake_fertilizer">Fake Fertilizer</SelectItem><SelectItem value="general">General</SelectItem></SelectContent></Select>
                      </div>
                      <div className="space-y-2"><Label>Severity</Label>
                        <Select value={newAlert.severity} onValueChange={(v) => setNewAlert({ ...newAlert, severity: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="info">Info</SelectItem><SelectItem value="warning">Warning</SelectItem><SelectItem value="critical">Critical</SelectItem></SelectContent></Select>
                      </div>
                    </div>
                    <div className="space-y-2"><Label>Message *</Label><Textarea value={newAlert.message} onChange={(e) => setNewAlert({ ...newAlert, message: e.target.value })} rows={4} /></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2"><Label>Target State</Label><Input value={newAlert.target_state} onChange={(e) => setNewAlert({ ...newAlert, target_state: e.target.value })} /></div>
                      <div className="space-y-2"><Label>Target District</Label><Input value={newAlert.target_district} onChange={(e) => setNewAlert({ ...newAlert, target_district: e.target.value })} /></div>
                    </div>
                    <Button onClick={handleAddAlert} className="w-full">Publish Alert</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alerts.map(alert => (
                  <Card key={alert.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">{alert.title}</h3>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="outline">{alert.alert_type}</Badge>
                            <Badge className={alert.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>{alert.is_active ? "Active" : "Inactive"}</Badge>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteAlert(alert.id)}><Trash2 className="w-4 h-4" /></Button>
                      </div>
                      <p className="text-sm mt-3 text-muted-foreground">{alert.message}</p>
                      <p className="text-xs text-muted-foreground mt-2">{new Date(alert.created_at).toLocaleString()}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 flex">
      {/* Mobile toggle */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-destructive text-destructive-foreground shadow-lg"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar */}
      <aside className={`fixed md:sticky top-0 left-0 z-40 h-screen w-64 bg-card border-r border-border overflow-y-auto transition-transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
        <div className="p-4">
          <div className="mb-6 px-3 pt-2">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-6 h-6 text-destructive" />
              <h2 className="font-bold text-lg text-foreground">Admin Panel</h2>
            </div>
            <p className="text-xs text-muted-foreground">Agriculture Department</p>
          </div>
          <nav className="space-y-1">
            {adminSidebarItems.map((item) => (
              <button
                key={item.key}
                onClick={() => { setActiveSection(item.key); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeSection === item.key ? "bg-destructive text-destructive-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </nav>
          <div className="mt-6 px-3">
            <Button variant="outline" className="w-full" onClick={signOut}>Logout</Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-h-screen p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">
              {adminSidebarItems.find(i => i.key === activeSection)?.label || "Admin Dashboard"}
            </h1>
            <p className="text-sm text-muted-foreground">Agriculture Department Management</p>
          </div>
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
