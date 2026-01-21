import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import LeadForm from "./pages/LeadForm";
import CRM from "./pages/CRM";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/lead" element={<LeadForm />} />
        <Route path="/crm" element={<CRM />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
