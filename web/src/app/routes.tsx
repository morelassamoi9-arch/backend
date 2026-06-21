import { createBrowserRouter } from "react-router";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import CitizenDashboard from "./pages/CitizenDashboard";
import NewRequest from "./pages/NewRequest";
import AIResponse from "./pages/AIResponse";
import MyRequests from "./pages/MyRequests";
import AgentDashboard from "./pages/AgentDashboard";
import RequestManagement from "./pages/RequestManagement";
import RequestDetails from "./pages/RequestDetails";
import Statistics from "./pages/Statistics";

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
    path: "/citizen",
    children: [
      { index: true, Component: CitizenDashboard },
      { path: "new-request", Component: NewRequest },
      { path: "request/:id", Component: AIResponse },
      { path: "requests", Component: MyRequests },
    ],
  },
  {
    path: "/agent",
    children: [
      { index: true, Component: AgentDashboard },
      { path: "requests", Component: RequestManagement },
      { path: "request/:id", Component: RequestDetails },
      { path: "statistics", Component: Statistics },
    ],
  },
]);
