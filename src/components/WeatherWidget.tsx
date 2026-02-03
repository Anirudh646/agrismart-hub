import { Card, CardContent } from "@/components/ui/card";
import { Cloud, Droplets, Wind, Sun, CloudRain, Thermometer } from "lucide-react";

const WeatherWidget = () => {
  const forecast = [
    { day: "Today", icon: Sun, temp: 32, condition: "Sunny", rain: "0%" },
    { day: "Tomorrow", icon: Cloud, temp: 29, condition: "Cloudy", rain: "20%" },
    { day: "Wed", icon: CloudRain, temp: 26, condition: "Rainy", rain: "80%" },
    { day: "Thu", icon: CloudRain, temp: 25, condition: "Rainy", rain: "60%" },
    { day: "Fri", icon: Sun, temp: 30, condition: "Sunny", rain: "10%" },
  ];

  return (
    <section className="py-20 gradient-weather text-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Current Weather */}
          <div className="lg:col-span-1">
            <h2 className="text-3xl md:text-4xl font-bold mb-2">Weather Forecast</h2>
            <p className="text-white/80 mb-6">Plan your farming activities with accurate predictions</p>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
              <div className="flex items-center gap-4 mb-6">
                <Sun className="w-16 h-16 text-accent" />
                <div>
                  <p className="text-5xl font-bold">32°C</p>
                  <p className="text-white/80">Sunny</p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <Droplets className="w-6 h-6 mx-auto mb-1 text-white/70" />
                  <p className="text-sm text-white/70">Humidity</p>
                  <p className="font-semibold">65%</p>
                </div>
                <div className="text-center">
                  <Wind className="w-6 h-6 mx-auto mb-1 text-white/70" />
                  <p className="text-sm text-white/70">Wind</p>
                  <p className="font-semibold">12 km/h</p>
                </div>
                <div className="text-center">
                  <Thermometer className="w-6 h-6 mx-auto mb-1 text-white/70" />
                  <p className="text-sm text-white/70">Feels Like</p>
                  <p className="font-semibold">35°C</p>
                </div>
              </div>
            </div>
          </div>

          {/* 5-Day Forecast */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">5-Day Forecast</h3>
              <a href="/weather" className="text-white/80 hover:text-white transition-colors text-sm">
                View Full Forecast →
              </a>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              {forecast.map((day, index) => (
                <Card key={index} className="bg-white/10 backdrop-blur-sm border-0 text-white">
                  <CardContent className="p-4 text-center">
                    <p className="text-sm text-white/70 mb-2">{day.day}</p>
                    <day.icon className="w-10 h-10 mx-auto mb-2 text-accent" />
                    <p className="text-2xl font-bold mb-1">{day.temp}°</p>
                    <p className="text-xs text-white/70">{day.condition}</p>
                    <div className="flex items-center justify-center gap-1 mt-2 text-xs">
                      <Droplets className="w-3 h-3" />
                      <span>{day.rain}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Weather Alert */}
            <div className="mt-6 bg-accent/20 backdrop-blur-sm rounded-xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center shrink-0">
                <CloudRain className="w-5 h-5 text-accent-foreground" />
              </div>
              <div>
                <p className="font-semibold">Rain Alert for Wednesday</p>
                <p className="text-sm text-white/80">Heavy rainfall expected. Avoid outdoor farming activities and secure harvested crops.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WeatherWidget;
