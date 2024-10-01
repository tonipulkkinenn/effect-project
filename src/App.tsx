import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import AppLayout from "./layouts/app-layout";
import WeatherScreen from "./components/screens/weather-screen";

const router = createBrowserRouter([
  {
    element: <AppLayout/>,
    children: [
      {
        index: true,
        element: <Navigate to="/weather"/>
      },
      {
        path: "weather",
        element: <WeatherScreen/>
      }
    ]
  }
]);

const App = () => (
  <RouterProvider router={router}/>
);
export default App;