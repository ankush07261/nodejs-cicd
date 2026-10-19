// Maps OpenWeather weather icon codes to local animated SVGs
const getIconUrl = (name) => {
  return new URL(`../assets/animated/${name}.svg`, import.meta.url).href;
};

export const getWeatherIcon = (iconCode) => {
  const iconMap = {
    // Clear sky
    '01d': 'clear-day',
    '01n': 'clear-night',
    // Few clouds
    '02d': 'partly-cloudy-day',
    '02n': 'partly-cloudy-night',
    // Scattered clouds
    '03d': 'cloudy',
    '03n': 'cloudy',
    // Broken / Overcast clouds
    '04d': 'overcast-day',
    '04n': 'overcast-night',
    // Shower rain
    '09d': 'rain',
    '09n': 'rain',
    // Rain
    '10d': 'partly-cloudy-day-rain',
    '10n': 'partly-cloudy-night-rain',
    // Thunderstorm
    '11d': 'thunderstorms-day-rain',
    '11n': 'thunderstorms-night-rain',
    // Snow
    '13d': 'snow',
    '13n': 'snow',
    // Mist / Smoke / Fog
    '50d': 'mist',
    '50n': 'mist',
  };

  const svgName = iconMap[iconCode] || 'clear-day';
  return getIconUrl(svgName);
};
