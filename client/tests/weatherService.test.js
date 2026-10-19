import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { fetchWeatherByCity } from '../src/services/weatherService.js';

describe('weatherService - fetchWeatherByCity', () => {
  let originalFetch;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('should throw error when city name is empty or whitespace', async () => {
    await assert.rejects(
      () => fetchWeatherByCity(''),
      /please enter a city name/i
    );
    await assert.rejects(
      () => fetchWeatherByCity('    '),
      /please enter a city name/i
    );
    await assert.rejects(
      () => fetchWeatherByCity(null),
      /please enter a city name/i
    );
  });

  it('should fetch and format weather data correctly on valid response', async () => {
    const mockApiResponse = {
      name: 'London',
      sys: { country: 'GB' },
      main: {
        temp: 18.6,
        temp_min: 15.2,
        temp_max: 20.4,
        feels_like: 17.9,
        humidity: 65,
        pressure: 1012,
      },
      wind: { speed: 4.5 },
      weather: [{ description: 'scattered clouds', icon: '03d' }],
      coord: { lon: -0.1257, lat: 51.5085 },
      timezone: 3600,
    };

    let requestedUrl = null;
    globalThis.fetch = async (url) => {
      requestedUrl = url;
      return {
        ok: true,
        json: async () => mockApiResponse,
      };
    };

    const weather = await fetchWeatherByCity('  London  ');

    assert.ok(requestedUrl.includes('q=London'));
    assert.ok(requestedUrl.includes('units=metric'));

    assert.deepStrictEqual(weather, {
      city: 'London',
      country: 'GB',
      temp: 19, // rounded 18.6
      tempMin: 15, // rounded 15.2
      tempMax: 20, // rounded 20.4
      feelsLike: 18, // rounded 17.9
      humidity: 65,
      pressure: 1012,
      windSpeed: 4.5,
      description: 'scattered clouds',
      iconCode: '03d',
      coord: { lon: -0.1257, lat: 51.5085 },
      timezone: 3600,
    });
  });

  it('should throw an error when API returns non-ok response', async () => {
    globalThis.fetch = async () => ({
      ok: false,
      json: async () => ({ message: 'city not found' }),
    });

    await assert.rejects(
      () => fetchWeatherByCity('NonExistentCityXYZ'),
      /city not found/i
    );
  });

  it('should use fallback error message when response message is missing', async () => {
    globalThis.fetch = async () => ({
      ok: false,
      json: async () => ({}),
    });

    await assert.rejects(
      () => fetchWeatherByCity('Paris'),
      /failed to fetch weather data/i
    );
  });
});
