import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Cloud, 
  Droplets, 
  Wind, 
  Sun, 
  CloudRain, 
  Thermometer,
  MapPin,
  Search,
  AlertTriangle,
  Umbrella,
  CloudSnow
} from "lucide-react";
import { useState } from "react";

const Weather = () => {
  const [location, setLocation] = useState("Karnal, Haryana");

  const currentWeather = {
    temp: 32,
    condition: "Sunny",
    humidity: 65,
    wind: 12,
    feelsLike: 35,
    uvIndex: 7,
    visibility: 10,
    pressure: 1013,
  };

  const forecast = [
    { day: "Today", icon: Sun, high: 32, low: 22, condition: "Sunny", rain: "0%" },
    { day: "Tomorrow", icon: Cloud, high: 29, low: 20, condition: "Cloudy", rain: "20%" },
    { day: "Wednesday", icon: CloudRain, high: 26, low: 19, condition: "Rainy", rain: "80%" },
    { day: "Thursday", icon: CloudRain, high: 25, low: 18, condition: "Rainy", rain: "60%" },
    { day: "Friday", icon: Sun, high: 30, low: 21, condition: "Sunny", rain: "10%" },
    { day: "Saturday", icon: Cloud, high: 28, low: 20, condition: "Partly Cloudy", rain: "15%" },
    { day: "Sunday", icon: Sun, high: 31, low: 22, condition: "Sunny", rain: "5%" },
  ];

  const hourlyForecast = [
    { time: "Now", temp: 32, icon: Sun },
    { time: "1PM", temp: 33, icon: Sun },
    { time: "2PM", temp: 34, icon: Sun },
    { time: "3PM", temp: 33, icon: Cloud },
    { time: "4PM", temp: 31, icon: Cloud },
    { time: "5PM", temp: 29, icon: Cloud },
    { time: "6PM", temp: 27, icon: Cloud },
    { time: "7PM", temp: 25, icon: Cloud },
  ];

  const alerts = [
    {
      type: "warning",
      title: "Heavy Rain Alert",
      description: "Heavy rainfall expected on Wednesday. Avoid outdoor farming activities.",
      icon: CloudRain,
    },
    {
      type: "info",
      title: "Irrigation Advisory",
      description: "Favorable conditions for irrigation on Thursday and Friday.",
      icon: Droplets,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header with Location Search */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                Weather Forecast
              </h1>
              <p className="text-muted-foreground">
                Plan your farming activities with accurate weather predictions
              </p>
            </div>
            <div className="relative w-full md:w-auto">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Enter location..."
                className="pl-10 h-12 w-full md:w-72"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </div>

          {/* Current Weather */}
          <Card className="gradient-weather text-white mb-8 overflow-hidden">
            <CardContent className="p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <div className="flex items-center gap-2 text-white/70 mb-4">
                    <MapPin className="w-4 h-4" />
                    <span>{location}</span>
                  </div>
                  <div className="flex items-center gap-6">
                    <Sun className="w-24 h-24 text-accent" />
                    <div>
                      <p className="text-6xl font-bold">{currentWeather.temp}°</p>
                      <p className="text-xl text-white/80">{currentWeather.condition}</p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-white/10 rounded-xl p-4 text-center">
                    <Droplets className="w-6 h-6 mx-auto mb-2 text-white/70" />
                    <p className="text-sm text-white/70">Humidity</p>
                    <p className="text-xl font-semibold">{currentWeather.humidity}%</p>
                  </div>
                  <div className="bg-white/10 rounded-xl p-4 text-center">
                    <Wind className="w-6 h-6 mx-auto mb-2 text-white/70" />
                    <p className="text-sm text-white/70">Wind</p>
                    <p className="text-xl font-semibold">{currentWeather.wind} km/h</p>
                  </div>
                  <div className="bg-white/10 rounded-xl p-4 text-center">
                    <Thermometer className="w-6 h-6 mx-auto mb-2 text-white/70" />
                    <p className="text-sm text-white/70">Feels Like</p>
                    <p className="text-xl font-semibold">{currentWeather.feelsLike}°</p>
                  </div>
                  <div className="bg-white/10 rounded-xl p-4 text-center">
                    <Sun className="w-6 h-6 mx-auto mb-2 text-white/70" />
                    <p className="text-sm text-white/70">UV Index</p>
                    <p className="text-xl font-semibold">{currentWeather.uvIndex}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Alerts */}
          {alerts.length > 0 && (
            <div className="space-y-4 mb-8">
              {alerts.map((alert, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-4 p-4 rounded-xl ${
                    alert.type === "warning" 
                      ? "bg-accent/20 border border-accent/30" 
                      : "bg-weather/10 border border-weather/20"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    alert.type === "warning" ? "bg-accent" : "bg-weather"
                  }`}>
                    <alert.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{alert.title}</p>
                    <p className="text-sm text-muted-foreground">{alert.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Hourly Forecast */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Hourly Forecast</h3>
              <div className="flex gap-4 overflow-x-auto pb-2">
                {hourlyForecast.map((hour, index) => (
                  <div key={index} className="flex flex-col items-center min-w-[60px]">
                    <p className="text-sm text-muted-foreground mb-2">{hour.time}</p>
                    <hour.icon className="w-8 h-8 text-accent mb-2" />
                    <p className="font-semibold text-foreground">{hour.temp}°</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 7-Day Forecast */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">7-Day Forecast</h3>
              <div className="space-y-4">
                {forecast.map((day, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4 min-w-[120px]">
                      <p className="font-medium text-foreground w-24">{day.day}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <day.icon className="w-8 h-8 text-accent" />
                      <span className="text-sm text-muted-foreground w-24">{day.condition}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Droplets className="w-4 h-4 text-weather" />
                      <span className="text-muted-foreground w-12">{day.rain}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">{day.high}°</span>
                      <span className="text-muted-foreground">/</span>
                      <span className="text-muted-foreground">{day.low}°</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Weather;
