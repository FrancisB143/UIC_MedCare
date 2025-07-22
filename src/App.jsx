import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Stocks from "./pages/Stocks";
import Reports from "./pages/Reports";
import History from "./pages/History";
import About from "./pages/About";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/stocks" element={<Stocks />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/history" element={<History />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </Router>
  );
}

export default App;
