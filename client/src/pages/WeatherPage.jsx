import React, { useState, useEffect } from 'react';
import { fetchWeatherByCity } from '../services/weatherService';
import { getWeatherIcon } from '../utils/weatherIcons';
import {
  Search,
  MapPin,
  Droplets,
  Wind,
  Gauge,
  ThermometerSun,
  AlertTriangle,
  RotateCw,
} from 'lucide-react';

const QUICK_CITIES = ['Bengaluru', 'London', 'Tokyo', 'New York', 'Paris', 'Dubai'];

export const WeatherPage = () => {
  const [searchTerm, setSearchTerm] = useState('Bengaluru');
  const [currentCity, setCurrentCity] = useState('Bengaluru');
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadWeather = async (cityName) => {
    if (!cityName.trim()) return;
    try {
      setLoading(true);
      setError(null);
      const data = await fetchWeatherByCity(cityName);
      setWeather(data);
      setCurrentCity(data.city);
    } catch (err) {
      setError(err.message || 'Location not found. Please verify spelling.');
      setWeather(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWeather('Bengaluru');
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      loadWeather(searchTerm);
    }
  };

  const handleQuickCityClick = (city) => {
    setSearchTerm(city);
    loadWeather(city);
  };

  return (
    <div className="weather-page-container">
      {/* Header & Search */}
      <div className="weather-hero-section">
        <h1 className="page-title">Live Weather Forecast</h1>
        <p className="page-subtitle">
          Real-time atmospheric telemetry and conditions powered by OpenWeather.
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="search-form">
          <div className="search-input-box">
            <Search size={20} className="search-icon" />
            <input
              id="weather-search-input"
              type="text"
              placeholder="Search any city or country (e.g. Bengaluru, London)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button
              id="weather-search-btn"
              type="submit"
              className="btn-search"
              disabled={loading}
            >
              {loading ? <RotateCw size={16} className="animate-spin" /> : 'Search'}
            </button>
          </div>
        </form>

        {/* Quick city tags */}
        <div className="quick-cities-row">
          <span className="quick-label">Popular:</span>
          {QUICK_CITIES.map((city) => (
            <button
              key={city}
              type="button"
              className={`quick-pill ${currentCity.toLowerCase() === city.toLowerCase() ? 'active' : ''}`}
              onClick={() => handleQuickCityClick(city)}
            >
              {city}
            </button>
          ))}
        </div>
      </div>

      {/* Weather Content Area */}
      <div className="weather-content-area">
        {loading && (
          <div className="weather-loading-box glass-panel">
            <div className="spinner-lg"></div>
            <p>Fetching weather telemetry for "{searchTerm}"...</p>
          </div>
        )}

        {error && !loading && (
          <div className="weather-notfound-card glass-panel">
            <div className="notfound-icon">
              <AlertTriangle size={48} className="text-warning" />
            </div>
            <h2>Place Not Found</h2>
            <p>{error}</p>
            <span className="notfound-hint">Please check the city spelling and try again.</span>
          </div>
        )}

        {weather && !loading && (
          <div className="weather-main-card glass-panel">
            <div className="card-top">
              <div className="location-heading">
                <MapPin size={24} className="text-cyan" />
                <h2>
                  {weather.city}
                  {weather.country && <span className="country-code">, {weather.country}</span>}
                </h2>
              </div>
              <span className="weather-condition-tag">{weather.description}</span>
            </div>

            <div className="card-hero-display">
              <div className="icon-wrapper">
                <img
                  src={getWeatherIcon(weather.iconCode)}
                  alt={weather.description}
                  className="weather-animated-svg"
                />
              </div>

              <div className="temp-hero-display">
                <span className="temp-hero-number">{weather.temp}</span>
                <span className="temp-unit">°C</span>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="weather-metrics-grid">
              <div className="metric-tile">
                <div className="metric-icon-box">
                  <ThermometerSun size={20} className="text-orange" />
                </div>
                <div className="metric-data">
                  <span className="metric-label">Min / Max Temp</span>
                  <span className="metric-val">
                    {weather.tempMin}° / {weather.tempMax}°C
                  </span>
                </div>
              </div>

              <div className="metric-tile">
                <div className="metric-icon-box">
                  <Droplets size={20} className="text-cyan" />
                </div>
                <div className="metric-data">
                  <span className="metric-label">Humidity</span>
                  <span className="metric-val">{weather.humidity}%</span>
                </div>
              </div>

              <div className="metric-tile">
                <div className="metric-icon-box">
                  <Wind size={20} className="text-teal" />
                </div>
                <div className="metric-data">
                  <span className="metric-label">Wind Speed</span>
                  <span className="metric-val">{weather.windSpeed} m/s</span>
                </div>
              </div>

              <div className="metric-tile">
                <div className="metric-icon-box">
                  <Gauge size={20} className="text-purple" />
                </div>
                <div className="metric-data">
                  <span className="metric-label">Pressure</span>
                  <span className="metric-val">{weather.pressure} hPa</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
