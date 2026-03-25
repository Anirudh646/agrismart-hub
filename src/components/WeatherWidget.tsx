import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Cloud, Droplets, Wind, Sun, CloudRain, Thermometer, CloudSnow, CloudFog, Loader2, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface WeatherData {
  temp: number;
  condition: string;
  humidity: number;
  wind: number;
  feelsLike: number;
  icon: string;
  city: string;
}

interface ForecastItem {
  day: string;
  temp: number;
  condition: string;
  rain: string;
  icon: string;
}

const API_KEY = "8d2de98e089f1c28e1a22fc19a24ef04";

const getWeatherIcon = (iconCode: string) => {
  if (iconCode.includes("01")) return Sun;
  if (iconCode.includes("02") || iconCode.includes("03") || iconCode.includes("04")) return Cloud;
  if (iconCode.includes("09") || iconCode.includes("10")) return CloudRain;
  if (iconCode.includes("13")) return CloudSnow;
  if (iconCode.includes("50")) return CloudFog;
  return Sun;
};

const WeatherWidget = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [city, setCity] = useState("Delhi");

  const fetchWeather = async (searchCity: string) => {
    setIsLoading(true);
    try {
      const [currentRes, forecastRes] = await Promise.all([
        fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(searchCity)}&appid=${API_KEY}&units=metric`),
        fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(searchCity)}&appid=${API_KEY}&units=metric`),
      ]);

      if (!currentRes.ok) throw new Error("City not found");

      const currentData = await currentRes.json();
      setWeather({
        temp: Math.round(currentData.main.temp),
        condition: currentData.weather[0].main,
        humidity: currentData.main.humidity,
        wind: Math.round(currentData.wind.speed * 3.6),
        feelsLike: Math.round(currentData.main.feels_like),
        icon: currentData.weather[0].icon,
        city: `${currentData.name}, ${currentData.sys.country}`,
      });

      if (forecastRes.ok) {
        const forecastData = await forecastRes.json();
        const dailyMap = new Map<string, any[]>();
        forecastData.list.forEach((item: any) => {
          const date = new Date(item.dt * 1000).toLocaleDateString("en-US", { weekday: "short" });
          if (!dailyMap.has(date)) dailyMap.set(date, []);
          dailyMap.get(date)!.push(item);
        });

        const daily: ForecastItem[] = Array.from(dailyMap.entries()).slice(0, 5).map(([day, items], i) => {
          const temps = items.map((it: any) => it.main.temp);
          const rainProb = Math.max(...items.map((it: any) => (it.pop || 0) * 100));
          return {
            day: i === 0 ? "Today" : i === 1 ? "Tomorrow" : day,
            temp: Math.round(Math.max(...temps)),
            condition: items[0].weather[0].main,
            rain: `${Math.round(rainProb)}%`,
            icon: items[0].weather[0].icon,
          };
        });
        setForecast(daily);
      }
    } catch {
      // Keep previous data on error
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather(city);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setCity(searchInput.trim());
      fetchWeather(searchInput.trim());
      setSearchInput("");
    }
  };

  if (isLoading && !weather) {
    return (
      <section className="py-20 gradient-weather text-white">
        <div className="container mx-auto px-4 flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-white" />
        </div>
      </section>
    );
  }

  if (!weather) return null;

  const CurrentIcon = getWeatherIcon(weather.icon);

  return (
    <section className="py-20 gradient-weather text-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Current Weather */}
          <div className="lg:col-span-1">
            <h2 className="text-3xl md:text-4xl font-bold mb-2">Live Weather</h2>
            <form onSubmit={handleSearch} className="flex gap-2 mb-6">
              <Input
                placeholder="Search city..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="bg-white/20 border-white/30 text-white placeholder:text-white/60 h-10"
              />
              <Button type="submit" size="sm" variant="secondary" className="shrink-0">
                <MapPin className="w-4 h-4" />
              </Button>
            </form>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
              <p className="text-sm text-white/70 mb-3 flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {weather.city}
              </p>
              <div className="flex items-center gap-4 mb-6">
                <CurrentIcon className="w-16 h-16 text-accent" />
                <div>
                  <p className="text-5xl font-bold">{weather.temp}°C</p>
                  <p className="text-white/80">{weather.condition}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <Droplets className="w-6 h-6 mx-auto mb-1 text-white/70" />
                  <p className="text-sm text-white/70">Humidity</p>
                  <p className="font-semibold">{weather.humidity}%</p>
                </div>
                <div className="text-center">
                  <Wind className="w-6 h-6 mx-auto mb-1 text-white/70" />
                  <p className="text-sm text-white/70">Wind</p>
                  <p className="font-semibold">{weather.wind} km/h</p>
                </div>
                <div className="text-center">
                  <Thermometer className="w-6 h-6 mx-auto mb-1 text-white/70" />
                  <p className="text-sm text-white/70">Feels Like</p>
                  <p className="font-semibold">{weather.feelsLike}°C</p>
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
              {forecast.map((day, index) => {
                const DayIcon = getWeatherIcon(day.icon);
                return (
                  <Card key={index} className="bg-white/10 backdrop-blur-sm border-0 text-white">
                    <CardContent className="p-4 text-center">
                      <p className="text-sm text-white/70 mb-2">{day.day}</p>
                      <DayIcon className="w-10 h-10 mx-auto mb-2 text-accent" />
                      <p className="text-2xl font-bold mb-1">{day.temp}°</p>
                      <p className="text-xs text-white/70">{day.condition}</p>
                      <div className="flex items-center justify-center gap-1 mt-2 text-xs">
                        <Droplets className="w-3 h-3" />
                        <span>{day.rain}</span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Weather Alert */}
            {forecast.some(d => d.condition.includes("Rain")) && (
              <div className="mt-6 bg-accent/20 backdrop-blur-sm rounded-xl p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center shrink-0">
                  <CloudRain className="w-5 h-5 text-accent-foreground" />
                </div>
                <div>
                  <p className="font-semibold">Rain Alert</p>
                  <p className="text-sm text-white/80">Rainfall expected. Plan outdoor farming activities accordingly and secure harvested crops.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WeatherWidget;
