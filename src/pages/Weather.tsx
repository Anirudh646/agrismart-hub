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
  Loader2,
  CloudSnow,
  CloudFog
} from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface WeatherData {
  temp: number;
  condition: string;
  humidity: number;
  wind: number;
  feelsLike: number;
  uvIndex: number;
  icon: string;
}

interface ForecastDay {
  day: string;
  high: number;
  low: number;
  condition: string;
  rain: string;
  icon: string;
}

interface HourlyData {
  time: string;
  temp: number;
  icon: string;
}

const getWeatherIcon = (iconCode: string) => {
  if (iconCode.includes("01")) return Sun;
  if (iconCode.includes("02") || iconCode.includes("03") || iconCode.includes("04")) return Cloud;
  if (iconCode.includes("09") || iconCode.includes("10")) return CloudRain;
  if (iconCode.includes("11")) return CloudRain;
  if (iconCode.includes("13")) return CloudSnow;
  if (iconCode.includes("50")) return CloudFog;
  return Sun;
};

const Weather = () => {
  const [location, setLocation] = useState("Delhi, India");
  const [searchInput, setSearchInput] = useState("");
  const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastDay[]>([]);
  const [hourlyForecast, setHourlyForecast] = useState<HourlyData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const API_KEY = "8d2de98e089f1c28e1a22fc19a24ef04"; // Free OpenWeatherMap key

  const fetchWeather = async (city: string) => {
    setIsLoading(true);
    try {
      // Fetch current weather
      const currentRes = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`
      );
      
      if (!currentRes.ok) {
        throw new Error("City not found");
      }
      
      const currentData = await currentRes.json();
      
      setCurrentWeather({
        temp: Math.round(currentData.main.temp),
        condition: currentData.weather[0].main,
        humidity: currentData.main.humidity,
        wind: Math.round(currentData.wind.speed * 3.6), // Convert m/s to km/h
        feelsLike: Math.round(currentData.main.feels_like),
        uvIndex: 5, // UV index requires separate API call
        icon: currentData.weather[0].icon,
      });
      
      setLocation(`${currentData.name}, ${currentData.sys.country}`);
      
      // Fetch 5-day forecast
      const forecastRes = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`
      );
      
      if (forecastRes.ok) {
        const forecastData = await forecastRes.json();
        
        // Process hourly forecast (next 8 entries = 24 hours)
        const hourly: HourlyData[] = forecastData.list.slice(0, 8).map((item: any) => ({
          time: new Date(item.dt * 1000).toLocaleTimeString("en-US", { hour: "numeric", hour12: true }),
          temp: Math.round(item.main.temp),
          icon: item.weather[0].icon,
        }));
        setHourlyForecast(hourly);
        
        // Process daily forecast (group by day)
        const dailyMap = new Map<string, any[]>();
        forecastData.list.forEach((item: any) => {
          const date = new Date(item.dt * 1000).toLocaleDateString("en-US", { weekday: "long" });
          if (!dailyMap.has(date)) {
            dailyMap.set(date, []);
          }
          dailyMap.get(date)!.push(item);
        });
        
        const daily: ForecastDay[] = Array.from(dailyMap.entries())
          .slice(0, 7)
          .map(([day, items], index) => {
            const temps = items.map((i: any) => i.main.temp);
            const rainProb = items.some((i: any) => i.weather[0].main.includes("Rain")) ? 
              Math.max(...items.map((i: any) => (i.pop || 0) * 100)) : 0;
            
            return {
              day: index === 0 ? "Today" : index === 1 ? "Tomorrow" : day,
              high: Math.round(Math.max(...temps)),
              low: Math.round(Math.min(...temps)),
              condition: items[0].weather[0].main,
              rain: `${Math.round(rainProb)}%`,
              icon: items[0].weather[0].icon,
            };
          });
        
        setForecast(daily);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not fetch weather data. Please try another city.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather("Delhi, India");
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      fetchWeather(searchInput);
      setSearchInput("");
    }
  };

  const alerts = [
    {
      type: "info",
      title: "Farming Advisory",
      description: "Monitor weather conditions before irrigation. Check 7-day forecast for planning.",
      icon: Droplets,
    },
  ];

  const WeatherIcon = currentWeather ? getWeatherIcon(currentWeather.icon) : Sun;

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
            <form onSubmit={handleSearch} className="relative w-full md:w-auto flex gap-2">
              <div className="relative flex-1">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search any city..."
                  className="pl-10 h-12 w-full md:w-72"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
              </div>
              <Button type="submit" size="icon" className="h-12 w-12">
                <Search className="w-5 h-5" />
              </Button>
            </form>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : currentWeather ? (
            <>
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
                        <WeatherIcon className="w-24 h-24 text-accent" />
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
              {hourlyForecast.length > 0 && (
                <Card className="mb-8">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-4">Hourly Forecast</h3>
                    <div className="flex gap-4 overflow-x-auto pb-2">
                      {hourlyForecast.map((hour, index) => {
                        const HourIcon = getWeatherIcon(hour.icon);
                        return (
                          <div key={index} className="flex flex-col items-center min-w-[60px]">
                            <p className="text-sm text-muted-foreground mb-2">{hour.time}</p>
                            <HourIcon className="w-8 h-8 text-accent mb-2" />
                            <p className="font-semibold text-foreground">{hour.temp}°</p>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* 7-Day Forecast */}
              {forecast.length > 0 && (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-4">7-Day Forecast</h3>
                    <div className="space-y-4">
                      {forecast.map((day, index) => {
                        const DayIcon = getWeatherIcon(day.icon);
                        return (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-center gap-4 min-w-[120px]">
                              <p className="font-medium text-foreground w-24">{day.day}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <DayIcon className="w-8 h-8 text-accent" />
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
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : null}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Weather;
