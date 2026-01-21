import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import CaptureLead from "./pages/CaptureLead";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/captar-lead" element={<CaptureLead />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

