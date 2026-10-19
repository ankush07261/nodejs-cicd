import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getWeatherIcon } from '../src/utils/weatherIcons.js';

describe('weatherIcons - getWeatherIcon', () => {
  it('should return clear-day.svg for 01d', () => {
    const url = getWeatherIcon('01d');
    assert.match(url, /clear-day\.svg$/);
  });

  it('should return clear-night.svg for 01n', () => {
    const url = getWeatherIcon('01n');
    assert.match(url, /clear-night\.svg$/);
  });

  it('should return partly-cloudy-day.svg for 02d', () => {
    const url = getWeatherIcon('02d');
    assert.match(url, /partly-cloudy-day\.svg$/);
  });

  it('should return cloudy.svg for 03d and 03n', () => {
    assert.match(getWeatherIcon('03d'), /cloudy\.svg$/);
    assert.match(getWeatherIcon('03n'), /cloudy\.svg$/);
  });

  it('should return overcast-day.svg for 04d', () => {
    const url = getWeatherIcon('04d');
    assert.match(url, /overcast-day\.svg$/);
  });

  it('should return rain.svg for 09d', () => {
    const url = getWeatherIcon('09d');
    assert.match(url, /rain\.svg$/);
  });

  it('should return thunderstorms-day-rain.svg for 11d', () => {
    const url = getWeatherIcon('11d');
    assert.match(url, /thunderstorms-day-rain\.svg$/);
  });

  it('should return snow.svg for 13d', () => {
    const url = getWeatherIcon('13d');
    assert.match(url, /snow\.svg$/);
  });

  it('should return mist.svg for 50d and 50n', () => {
    assert.match(getWeatherIcon('50d'), /mist\.svg$/);
    assert.match(getWeatherIcon('50n'), /mist\.svg$/);
  });

  it('should fallback to clear-day.svg for unknown or invalid icon codes', () => {
    assert.match(getWeatherIcon('unknown-code'), /clear-day\.svg$/);
    assert.match(getWeatherIcon(undefined), /clear-day\.svg$/);
  });
});
