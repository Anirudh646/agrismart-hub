import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, Loader2, Phone, MapPin, Send } from "lucide-react";

const emergencyTypes = [
  { value: "pest_attack", label: "🐛 Pest Attack", color: "text-red-600" },
  { value: "crop_disease", label: "🌿 Crop Disease", color: "text-orange-600" },
  { value: "water_shortage", label: "💧 Water Shortage", color: "text-blue-600" },
  { value: "flood", label: "🌊 Flood Damage", color: "text-cyan-600" },
  { value: "equipment_failure", label: "🔧 Equipment Failure", color: "text-gray-600" },
  { value: "market_issue", label: "📉 Market/Price Issue", color: "text-purple-600" },
  { value: "other", label: "❓ Other Emergency", color: "text-amber-600" },
];

export function EmergencyHelpButton() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    emergencyType: "",
    description: "",
    location: profile?.village || "",
    contactPhone: profile?.phone || "",
  });

  const handleSubmit = async () => {
    if (!formData.emergencyType || !formData.description) {
      toast({ title: "Error", description: "Please fill emergency type and description", variant: "destructive" });
      return;
    }

    if (!user) {
      toast({ title: "Error", description: "Please login to submit emergency request", variant: "destructive" });
      return;
    }

    setIsLoading(true);

    const { error } = await supabase.from("emergency_requests").insert({
      user_id: user.id,
      emergency_type: formData.emergencyType,
      description: formData.description,
      location: formData.location || null,
      contact_phone: formData.contactPhone || null,
    } as never);

    setIsLoading(false);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ 
        title: "🚨 Emergency Request Sent", 
        description: "Our team will contact you shortly. Stay safe!" 
      });
      setFormData({ emergencyType: "", description: "", location: profile?.village || "", contactPhone: profile?.phone || "" });
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="destructive" 
          size="lg" 
          className="gap-2 animate-pulse hover:animate-none shadow-lg shadow-red-500/30"
        >
          <AlertTriangle className="w-5 h-5" />
          Emergency Help
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            Emergency Assistance
          </DialogTitle>
          <DialogDescription>
            Submit an emergency request for immediate help. Our team will respond as soon as possible.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="type">Emergency Type *</Label>
            <Select 
              value={formData.emergencyType} 
              onValueChange={(v) => setFormData({ ...formData, emergencyType: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select emergency type" />
              </SelectTrigger>
              <SelectContent>
                {emergencyTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Describe the Problem *</Label>
            <Textarea
              id="description"
              placeholder="Explain the emergency situation in detail..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="min-h-[100px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location" className="flex items-center gap-1">
                <MapPin className="w-3 h-3" /> Location
              </Label>
              <Input
                id="location"
                placeholder="Village/Area"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-1">
                <Phone className="w-3 h-3" /> Contact Phone
              </Label>
              <Input
                id="phone"
                placeholder="Your phone number"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
              />
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
            <p className="font-medium">📞 For life-threatening emergencies:</p>
            <p>Call 112 (Emergency) or 1800-180-1551 (Kisan Call Center)</p>
          </div>

          <Button 
            onClick={handleSubmit} 
            disabled={isLoading} 
            className="w-full bg-destructive hover:bg-destructive/90"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send Emergency Request
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
