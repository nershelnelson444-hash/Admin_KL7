import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Inventory from "@/pages/Inventory";
import BikeEditor from "@/pages/BikeEditor";
import Gallery from "@/pages/Gallery";
import SellEnquiry from "@/pages/SellEnquiry";
import CustomerEnquiry from "@/pages/CustomerEnquiry";
import Calendar from "@/pages/Calendar";
import Settings from "@/pages/Settings";
import Profile from "@/pages/Profile";
import NotFound from "@/pages/NotFound";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/inventory/new" element={<BikeEditor />} />
            <Route path="/inventory/:id/edit" element={<BikeEditor />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/sell-enquiry" element={<SellEnquiry />} />
            <Route path="/customer-enquiry" element={<CustomerEnquiry />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Route>

        {/* Legacy redirects */}
        <Route path="/media" element={<Navigate to="/gallery" replace />} />
        <Route path="/library" element={<Navigate to="/gallery" replace />} />
        <Route path="/leads" element={<Navigate to="/sell-enquiry" replace />} />
        <Route path="/users" element={<Navigate to="/customer-enquiry" replace />} />

        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
