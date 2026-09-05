import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BellRing, Loader2, Plus, Trash2, TrendingDown, TrendingUp } from "lucide-react";

interface PriceAlert {
  id: string;
  crop_name: string;
  market: string | null;
  target_price: number;
  direction: string;
  is_active: boolean;
  triggered_at: string | null;
  triggered_price: number | null;
  created_at: string;
}

export const PriceAlertsManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ crop_name: "", market: "", target_price: "", direction: "above" });

  useEffect(() => {
    void fetchAlerts();
  }, [user]);

  const fetchAlerts = async () => {
    setIsLoading(true);
    const { data } = await supabase.from("price_alerts").select("*").order("created_at", { ascending: false });
    if (data) setAlerts(data);
    setIsLoading(false);
  };

  const createAlert = async () => {
    if (!user || !form.crop_name.trim() || !form.target_price) {
      toast({ title: "Missing details", description: "Enter a crop and a target price.", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("price_alerts").insert({
      user_id: user.id,
      crop_name: form.crop_name.trim(),
      market: form.market.trim() || null,
      target_price: parseFloat(form.target_price),
      direction: form.direction,
    });
    setSaving(false);
    if (error) {
      toast({ title: "Could not save alert", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Alert created", description: `We will flag ${form.crop_name} at ₹${form.target_price}.` });
    setForm({ crop_name: "", market: "", target_price: "", direction: "above" });
    void fetchAlerts();
  };

  const toggleActive = async (alert: PriceAlert) => {
    const { error } = await supabase.from("price_alerts").update({ is_active: !alert.is_active }).eq("id", alert.id);
    if (error) {
      toast({ title: "Could not update", description: error.message, variant: "destructive" });
      return;
    }
    setAlerts((a) => a.map((x) => (x.id === alert.id ? { ...x, is_active: !x.is_active } : x)));
  };

  const removeAlert = async (id: string) => {
    const { error } = await supabase.from("price_alerts").delete().eq("id", id);
    if (error) {
      toast({ title: "Could not delete", description: error.message, variant: "destructive" });
      return;
    }
    setAlerts((a) => a.filter((x) => x.id !== id));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellRing className="w-5 h-5 text-primary" />
            Set a Price Alert
          </CardTitle>
          <CardDescription>Get flagged when your crop crosses the price you want</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            <div className="space-y-2 md:col-span-2">
              <Label>Crop *</Label>
              <Input
                value={form.crop_name}
                onChange={(e) => setForm({ ...form, crop_name: e.target.value })}
                placeholder="e.g., Wheat"
              />
            </div>
            <div className="space-y-2">
              <Label>Market (optional)</Label>
              <Input
                value={form.market}
                onChange={(e) => setForm({ ...form, market: e.target.value })}
                placeholder="e.g., Mathura Mandi"
              />
            </div>
            <div className="space-y-2">
              <Label>Target price (₹/quintal) *</Label>
              <Input
                type="number"
                min="0"
                value={form.target_price}
                onChange={(e) => setForm({ ...form, target_price: e.target.value })}
                placeholder="2200"
              />
            </div>
            <div className="space-y-2">
              <Label>Notify when</Label>
              <Select value={form.direction} onValueChange={(v) => setForm({ ...form, direction: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="above">Price goes above</SelectItem>
                  <SelectItem value="below">Price falls below</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button className="mt-4 gap-2" onClick={createAlert} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Create Alert
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>My Alerts</CardTitle>
          <CardDescription>{alerts.length} alert(s) saved</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading && <Loader2 className="w-5 h-5 animate-spin text-primary" />}
          {!isLoading && alerts.length === 0 && (
            <p className="text-sm text-muted-foreground">No alerts yet. Create one above.</p>
          )}
          {alerts.map((alert) => (
            <div key={alert.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4">
              <div className="flex items-center gap-3">
                {alert.direction === "above" ? (
                  <TrendingUp className="w-5 h-5 text-primary" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-destructive" />
                )}
                <div>
                  <p className="font-medium">
                    {alert.crop_name} · ₹{alert.target_price}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {alert.direction === "above" ? "Above" : "Below"} target
                    {alert.market ? ` · ${alert.market}` : ""} · created{" "}
                    {new Date(alert.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {alert.triggered_at ? (
                  <Badge className="bg-primary/10 text-primary hover:bg-primary/10">
                    Triggered at ₹{alert.triggered_price ?? "-"}
                  </Badge>
                ) : (
                  <Badge variant="outline">Watching</Badge>
                )}
                <div className="flex items-center gap-2">
                  <Switch
                    checked={alert.is_active}
                    onCheckedChange={() => toggleActive(alert)}
                    aria-label="Toggle alert"
                  />
                  <span className="text-xs text-muted-foreground">{alert.is_active ? "On" : "Off"}</span>
                </div>
                <Button variant="ghost" size="icon" aria-label="Delete alert" onClick={() => removeAlert(alert.id)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default PriceAlertsManager;
