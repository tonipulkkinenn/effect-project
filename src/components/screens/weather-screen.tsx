import { Effect } from "effect";
import { useAsyncData } from "../../hooks/use-async-data";
import { Alert, Box, CircularProgress, MenuItem, Snackbar, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { WeatherApiResponse } from "types";

interface SnackbarOptions {
  open: boolean;
  message: string;
  severity: "error" | "success";
}

const defaultSnackbarOptions: SnackbarOptions = {
  open: false,
  message: "",
  severity: "success"
};

const WeatherScreen = () => {
  const [selectedCity, setSelectedCity] = useState<string>("Mikkeli");
  const [snackbarOptions, setSnackbarOptions] = useState<SnackbarOptions>(defaultSnackbarOptions);

  const weatherData = useAsyncData(async () => {
    const fetchWeatherData = Effect.gen(function* fetchWeatherDataGenerator() {
      const response = yield* Effect.tryPromise({
        try: () =>
          fetch(`https://api.weatherapi.com/v1/current.json?${
            new URLSearchParams({
              q: selectedCity,
              key: "04574337f4394b0c809114337243009"
            })}`
          ),
        catch: () => new Error("Network Error: Unable to reach the API.")
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} - ${response.statusText}`);
      }

      const data = yield* Effect.tryPromise({
        try: () => response.json(),
        catch: () => new Error("Parsing Error: Invalid JSON format from API.")
      });

      return data as WeatherApiResponse;
    });

    const matchResult = Effect.match(fetchWeatherData, {
      onSuccess(value) {
        setSnackbarOptions({
          open: true,
          message: "Weather data fetched successfully.",
          severity: "success"
        });

        return value;
      },
      onFailure(error) {
        setSnackbarOptions({
          open: true,
          message: error.message,
          severity: "error"
        });

        return null;
      }
    });

    return Effect.runPromise(matchResult);
  }, { deps: [selectedCity] });

  const renderTitleAndFilters = () => (
    <Box display="flex" justifyContent="space-between" alignItems="center">
      <Typography variant="h1">
        {selectedCity}
      </Typography>
      <TextField
        select
        label="City"
        value={selectedCity}
        onChange={event => setSelectedCity(event.target.value)}
      >
        <MenuItem value="Mikkeli">Mikkeli</MenuItem>
        <MenuItem value="Helsinki">Helsinki</MenuItem>
        <MenuItem value="Tampere">Tampere</MenuItem>
        <MenuItem value="Turku">Turku</MenuItem>
        <MenuItem value="Oulu">Oulu</MenuItem>
      </TextField>
    </Box>
  );

  if (weatherData.isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
        <CircularProgress/>
      </Box>
    );
  }

  return (
    <Box px={3}>
      {renderTitleAndFilters()}
      <Snackbar
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        open={snackbarOptions.open}
        autoHideDuration={5000}
        onClose={() => setSnackbarOptions({ ...snackbarOptions, open: false })}
      >
        <Alert
          onClose={() => setSnackbarOptions({ ...snackbarOptions, open: false })}
          severity={snackbarOptions.severity}
          sx={{ width: "100%" }}
        >
          {snackbarOptions.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default WeatherScreen;