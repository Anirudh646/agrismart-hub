import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Droplets, Leaf, Scissors, Sun } from "lucide-react";

interface CropEvent {
  type: "sowing" | "fertilizer" | "irrigation" | "harvest" | "pesticide";
  date: Date;
  description: string;
  crop: string;
}

interface CropCalendarProps {
  crops?: Array<{
    crop_name: string;
    sowing_date: string | null;
    expected_harvest: string | null;
  }>;
}

export function CropCalendar({ crops = [] }: CropCalendarProps) {
  const { t } = useTranslation();

  const events = useMemo(() => {
    const allEvents: CropEvent[] = [];
    const today = new Date();

    crops.forEach((crop) => {
      if (crop.sowing_date) {
        const sowingDate = new Date(crop.sowing_date);
        
        // Add sowing event
        allEvents.push({
          type: "sowing",
          date: sowingDate,
          description: `${crop.crop_name} sowing`,
          crop: crop.crop_name
        });

        // Add fertilizer events (15, 30, 45 days after sowing)
        [15, 30, 45].forEach((days, idx) => {
          const fertDate = new Date(sowingDate);
          fertDate.setDate(fertDate.getDate() + days);
          if (fertDate >= today) {
            allEvents.push({
              type: "fertilizer",
              date: fertDate,
              description: `${crop.crop_name} - ${idx === 0 ? "Urea" : idx === 1 ? "DAP" : "Potash"} application`,
              crop: crop.crop_name
            });
          }
        });

        // Add irrigation reminders (weekly)
        for (let i = 7; i <= 90; i += 7) {
          const irrigationDate = new Date(sowingDate);
          irrigationDate.setDate(irrigationDate.getDate() + i);
          if (irrigationDate >= today && irrigationDate <= new Date(crop.expected_harvest || today)) {
            allEvents.push({
              type: "irrigation",
              date: irrigationDate,
              description: `${crop.crop_name} irrigation check`,
              crop: crop.crop_name
            });
          }
        }
      }

      if (crop.expected_harvest) {
        allEvents.push({
          type: "harvest",
          date: new Date(crop.expected_harvest),
          description: `${crop.crop_name} harvest`,
          crop: crop.crop_name
        });
      }
    });

    // Sort by date and return next 10 events
    return allEvents
      .filter(e => e.date >= today)
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(0, 10);
  }, [crops]);

  const getEventIcon = (type: string) => {
    switch (type) {
      case "sowing": return <Leaf className="w-4 h-4 text-green-500" />;
      case "fertilizer": return <Sun className="w-4 h-4 text-yellow-500" />;
      case "irrigation": return <Droplets className="w-4 h-4 text-blue-500" />;
      case "harvest": return <Scissors className="w-4 h-4 text-orange-500" />;
      default: return <Calendar className="w-4 h-4" />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case "sowing": return "bg-green-500/10 text-green-700 dark:text-green-400";
      case "fertilizer": return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400";
      case "irrigation": return "bg-blue-500/10 text-blue-700 dark:text-blue-400";
      case "harvest": return "bg-orange-500/10 text-orange-700 dark:text-orange-400";
      default: return "bg-muted";
    }
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const diffDays = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays < 7) return `In ${diffDays} days`;
    return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calendar className="w-5 h-5 text-primary" />
          {t("calendar.title")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-4">
            Add crops to see your farming calendar
          </p>
        ) : (
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {events.map((event, idx) => (
              <div 
                key={idx}
                className={`flex items-center gap-3 p-2 rounded-lg ${getEventColor(event.type)}`}
              >
                {getEventIcon(event.type)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{event.description}</p>
                </div>
                <Badge variant="outline" className="flex-shrink-0">
                  {formatDate(event.date)}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
