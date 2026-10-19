const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

export const fetchWeatherByCity = async (cityName) => {
  if (!cityName || !cityName.trim()) {
    throw new Error('Please enter a city name.');
  }

  const query = encodeURIComponent(cityName.trim());
  const url = `${BASE_URL}?q=${query}&units=metric&appid=${API_KEY}`;

  const response = await fetch(url);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch weather data.');
  }

  return {
    city: data.name,
    country: data.sys?.country,
    temp: Math.round(data.main.temp),
    tempMin: Math.round(data.main.temp_min),
    tempMax: Math.round(data.main.temp_max),
    feelsLike: Math.round(data.main.feels_like),
    humidity: data.main.humidity,
    pressure: data.main.pressure,
    windSpeed: data.wind?.speed,
    description: data.weather?.[0]?.description || 'Clear',
    iconCode: data.weather?.[0]?.icon || '01d',
    coord: data.coord,
    timezone: data.timezone,
  };
};
