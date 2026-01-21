import { BrowserRouter, Routes, Route } from "react-router-dom";

import PublicHome from "./pages/PublicHome";
import PainelDoCorretor from "./pages/PainelDoCorretor";
import CatalogoDeImoveis from "./pages/CatalogoDeImoveis";
import LeadDetails from "./pages/LeadDetails";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicHome />} />
        <Route path="/corretor" element={<PainelDoCorretor />} />
        <Route path="/catalogo" element={<CatalogoDeImoveis />} />
        <Route path="/lead/:id" element={<LeadDetails />} />
      </Routes>
    </BrowserRouter>
  );
}
