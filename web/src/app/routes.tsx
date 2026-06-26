import { createBrowserRouter, Outlet } from "react-router";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import CitizenDashboard from "./pages/CitizenDashboard";
import NewRequest from "./pages/NewRequest";
import AIResponse from "./pages/AIResponse";
import MyRequests from "./pages/MyRequests";
import History from "./pages/History";
import Help from "./pages/Help";
import NotFound from "./pages/NotFound";
import Register from "./pages/Register";
import { ProtectedRoute } from "./components/ProtectedRoute";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: LandingPage,
  },
  {
    path: "/login",
    Component: LoginPage,
  },
  {
    path: "/register",
    Component: Register,
  },
  {
    path: "/history",
    Component: History,
  },
  {
    path: "/help",
    Component: Help,
  },
  {
    path: "/citizen",
    element: (
      <ProtectedRoute>
        <Outlet />
      </ProtectedRoute>
    ),
    children: [
      { index: true, Component: CitizenDashboard },
      { path: "new-request", Component: NewRequest },
      { path: "request/:id", Component: AIResponse },
      { path: "requests", Component: MyRequests },
      { path: "history", Component: History },
      { path: "help", Component: Help },
    ],
  },
  {
    path: "*",
    Component: NotFound,
  },
]);
