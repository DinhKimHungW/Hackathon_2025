import { Card, CardContent, Typography, Box, useTheme, alpha } from '@mui/material';
import {
  WbSunny,
  Cloud,
  Air,
  Waves,
  Opacity,
  Visibility,
  Compress,
} from '@mui/icons-material';
import { useMemo } from 'react';

export default function WeatherWidget() {
  const theme = useTheme();

  // Mock weather data - replace with real API data
  const weatherData = useMemo(() => ({
    condition: 'Partly Cloudy',
    temperature: 28,
    feelsLike: 30,
    humidity: 75,
    windSpeed: 18,
    windDirection: 'NE',
    visibility: 10,
    pressure: 1013,
    waveHeight: 1.2,
    seaCondition: 'Moderate',
    forecast: [
      { time: '12:00', temp: 28, condition: 'cloudy' },
      { time: '15:00', temp: 29, condition: 'sunny' },
      { time: '18:00', temp: 27, condition: 'cloudy' },
      { time: '21:00', temp: 25, condition: 'clear' },
    ],
  }), []);

  const getWeatherIcon = (condition: string) => {
    const lowerCondition = condition.toLowerCase();
    if (lowerCondition.includes('sunny') || lowerCondition.includes('clear')) {
      return <WbSunny sx={{ fontSize: 48, color: theme.palette.warning.main }} />;
    }
    return <Cloud sx={{ fontSize: 48, color: theme.palette.info.main }} />;
  };

  return (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        borderRadius: 3,
        border: `1px solid ${theme.palette.divider}`,
        background: theme.palette.mode === 'light'
          ? `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.05)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`
          : theme.palette.background.paper,
      }}
    >
      <CardContent sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Weather Conditions
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Cảng Cát Lái - Updated 5 min ago
          </Typography>
        </Box>

        {/* Main Weather Display */}
        <Box
          sx={{
            p: 3,
            borderRadius: 3,
            background: theme.palette.mode === 'light'
              ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              : 'linear-gradient(135deg, #434343 0%, #000000 100%)',
            color: 'white',
            mb: 3,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Background Pattern */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '100%',
              height: '100%',
              opacity: 0.1,
              backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
              backgroundSize: '20px 20px',
            }}
          />

          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box>
                <Typography variant="h2" fontWeight={700} sx={{ lineHeight: 1 }}>
                  {weatherData.temperature}°
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  {weatherData.condition}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.7 }}>
                  Feels like {weatherData.feelsLike}°C
                </Typography>
              </Box>
              {getWeatherIcon(weatherData.condition)}
            </Box>

            {/* Sea Condition */}
            <Box
              sx={{
                mt: 2,
                p: 1.5,
                borderRadius: 2,
                bgcolor: alpha('#fff', 0.15),
                backdropFilter: 'blur(10px)',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Waves fontSize="small" />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" sx={{ opacity: 0.9 }}>
                    Sea Condition
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {weatherData.seaCondition} - Wave height: {weatherData.waveHeight}m
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Weather Details Grid */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 1.5,
            mb: 3,
          }}
        >
          {/* Wind */}
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
              bgcolor: theme.palette.background.paper,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Air fontSize="small" color="action" />
              <Typography variant="caption" color="text.secondary">
                Wind
              </Typography>
            </Box>
            <Typography variant="body2" fontWeight={600}>
              {weatherData.windSpeed} km/h {weatherData.windDirection}
            </Typography>
          </Box>

          {/* Humidity */}
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
              bgcolor: theme.palette.background.paper,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Opacity fontSize="small" color="action" />
              <Typography variant="caption" color="text.secondary">
                Humidity
              </Typography>
            </Box>
            <Typography variant="body2" fontWeight={600}>
              {weatherData.humidity}%
            </Typography>
          </Box>

          {/* Visibility */}
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
              bgcolor: theme.palette.background.paper,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Visibility fontSize="small" color="action" />
              <Typography variant="caption" color="text.secondary">
                Visibility
              </Typography>
            </Box>
            <Typography variant="body2" fontWeight={600}>
              {weatherData.visibility} km
            </Typography>
          </Box>

          {/* Pressure */}
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
              bgcolor: theme.palette.background.paper,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Compress fontSize="small" color="action" />
              <Typography variant="caption" color="text.secondary">
                Pressure
              </Typography>
            </Box>
            <Typography variant="body2" fontWeight={600}>
              {weatherData.pressure} mb
            </Typography>
          </Box>
        </Box>

        {/* Hourly Forecast */}
        <Box>
          <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mb: 1, display: 'block' }}>
            HOURLY FORECAST
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 1 }}>
            {weatherData.forecast.map((hour, index) => (
              <Box
                key={index}
                sx={{
                  minWidth: 70,
                  p: 1.5,
                  borderRadius: 2,
                  border: `1px solid ${theme.palette.divider}`,
                  bgcolor: theme.palette.background.paper,
                  textAlign: 'center',
                }}
              >
                <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                  {hour.time}
                </Typography>
                {hour.condition === 'sunny' ? (
                  <WbSunny fontSize="small" color="warning" sx={{ my: 0.5 }} />
                ) : (
                  <Cloud fontSize="small" color="info" sx={{ my: 0.5 }} />
                )}
                <Typography variant="body2" fontWeight={600}>
                  {hour.temp}°
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Safety Status */}
        <Box
          sx={{
            mt: 2,
            p: 1.5,
            borderRadius: 2,
            bgcolor: alpha(theme.palette.success.main, 0.1),
            border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`,
          }}
        >
          <Typography variant="caption" color="success.main" fontWeight={700}>
            ✓ CONDITIONS SAFE FOR PORT OPERATIONS
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
