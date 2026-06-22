import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Inventory from "@/pages/Inventory";
import BikeEditor from "@/pages/BikeEditor";
import MediaLibrary from "@/pages/MediaLibrary";
import GalleryManagement from "@/pages/GalleryManagement";
import Leads from "@/pages/Leads";
import Users from "@/pages/Users";
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
            <Route path="/media" element={<MediaLibrary />} />
            <Route path="/gallery" element={<GalleryManagement />} />
            <Route path="/leads" element={<Leads />} />
            <Route path="/users" element={<Users />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Route>

        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
