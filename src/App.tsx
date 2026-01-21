import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import CaptureLead from "./pages/CaptureLead";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/captura" element={<CaptureLead />} />
      </Routes>
    </BrowserRouter>
  );
}
